const env = require("../config");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const User = require("../models/userModel");

exports.register = async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  if (!username || !email || !password || password !== confirmPassword) {
    return res.status(400).json({ message: "Invalid input fields" });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser)
    return res.status(409).json({ message: "User already exists" });

  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ username, email, password: hashed });

  await user.save();
  return res.status(201).json({ message: "Registered successfully", user });
};

exports.login = async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  const token = jwt.sign(
    { id: user._id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
  res.status(200).json({
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
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
