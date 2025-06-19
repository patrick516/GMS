const env = require("../config");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const User = require("../models/userModel");
const logAudit = require("../utils/logAudit");

exports.register = async (req, res) => {
  let { username, email, password, confirmPassword, role } = req.body;

  const defaultPassword = "12345";
  const isAdminTriggered = !password;

  if (!username || !email || (password && password !== confirmPassword)) {
    return res.status(400).json({ message: "Invalid input fields" });
  }

  if (!password) {
    password = defaultPassword;
  }

  const existingUser = await User.findOne({ email });
  if (existingUser)
    return res.status(409).json({ message: "User already exists" });

  const hashed = await bcrypt.hash(password, 10);
  role = role || "staff";

  if (role === "admin") {
    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      return res.status(403).json({ message: "An admin already exists" });
    }
  }

  const user = new User({
    username,
    email,
    password: hashed,
    role,
    mustChangePassword: password === defaultPassword,
  });

  await user.save();
  return res.status(201).json({ message: "Registered successfully", user });
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  console.log("Login request received:", username);

  const user = await User.findOne({ $or: [{ username }, { email: username }] });

  if (!user) {
    console.log("User not found");
    return res.status(401).json({ message: "Invalid username or password" });
  }

  const match = await bcrypt.compare(password, user.password);
  console.log("Password match result:", match);

  if (!match) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  const token = jwt.sign(
    { id: user._id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
  await logAudit(user, "User Logged In", {
    email: user.email,
    role: user.role,
  });

  res.status(200).json({
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
    },
  });
};

// Send reset password email
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: "No user with that email" });
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  await user.save();

  const resetLink = `${env.FRONTEND_URL}/reset-password/${resetToken}`;
  console.log("Generated reset link:", resetLink);

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    to: user.email,
    from: process.env.EMAIL_USERNAME,
    subject: "Password Reset",
    text: `Click the link to reset your password: ${resetLink}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Reset link sent to email" });
  } catch (err) {
    console.error("Email failed:", err);
    res.status(500).json({ message: "Failed to send email" });
  }
};

// Handle password reset with token
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;

  console.log("Received token:", token);
  console.log("Request body:", req.body);

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ message: "Invalid or expired reset token" });
  }

  user.password = await bcrypt.hash(password, 10);
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  await user.save();

  res.status(200).json({ message: "Password has been reset" });
};

exports.adminExists = async (req, res) => {
  const admin = await User.findOne({ role: "admin" });
  res.status(200).json({ exists: !!admin });
};

exports.changePassword = async (req, res) => {
  const { userId, newPassword } = req.body;

  if (!userId || !newPassword) {
    return res
      .status(400)
      .json({ message: "User ID and new password are required" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    user.mustChangePassword = false;
    await user.save();

    await logAudit(user, "Password Changed", { email: user.email });

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Error updating password:", err);
    res.status(500).json({ message: "Failed to update password" });
  }
};
