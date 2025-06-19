import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
} from "@mui/material";
import axios from "axios";
import { useAuth } from "@hooks/useAuth";
import { toast } from "react-toastify";
import { FaLock } from "react-icons/fa";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const ChangePasswordModal = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (user && user.mustChangePassword) {
      setOpen(true);
    }
  }, [user]);

  const handleSubmit = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error("Please fill out both fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/change-password`,
        {
          userId: user?.id,
          newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Password updated. You're good to go!");
      setOpen(false);

      const updatedUser = {
        id: user?.id ?? "",
        username: user?.username ?? "",
        email: user?.email ?? "",
        role: user?.role ?? "staff",
        mustChangePassword: false,
      };

      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      //  Optional: redirect to dashboard or reload
      navigate("/dashboard");
    } catch (err) {
      console.error("Password change failed", err);
      toast.error("Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} fullWidth maxWidth="sm">
      <DialogTitle className="flex items-center gap-2">
        <FaLock className="text-blue-700" /> Change Your Password
      </DialogTitle>
      <DialogContent>
        <Typography className="mb-4">
          For security, you must change your default password before continuing.
        </Typography>

        <div className="relative mb-4">
          <TextField
            type={showNewPassword ? "text" : "password"}
            label="New Password"
            fullWidth
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowNewPassword((prev) => !prev)}
            className="absolute text-gray-500 right-3 top-3 hover:text-black"
            style={{ background: "none", border: "none" }}
          >
            {showNewPassword ? <FiEyeOff /> : <FiEye />}
          </button>
        </div>

        <div className="relative">
          <TextField
            type={showConfirmPassword ? "text" : "password"}
            label="Confirm Password"
            fullWidth
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            className="absolute text-gray-500 right-3 top-3 hover:text-black"
            style={{ background: "none", border: "none" }}
          >
            {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
          </button>
        </div>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={handleSubmit}
          color="primary"
          variant="contained"
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Password"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChangePasswordModal;
