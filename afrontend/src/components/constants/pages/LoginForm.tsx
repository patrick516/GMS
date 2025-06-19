import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@hooks/useAuth";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { toast } from "react-toastify";
import ChangePasswordModal from "./ChangePasswordModal";

const LoginForm = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api//auth/login`,
        { username, password }
      );

      const { user, token } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);

      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setError("Invalid username or password");
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleLogin} className="space-y-4">
        {error && (
          <div className="text-sm text-center text-red-600">{error}</div>
        )}

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Username
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            className="w-full px-3 py-2 pr-10 border rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-2.5 text-gray-500 hover:text-black focus:outline-none"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
          </button>
        </div>

        <button
          type="submit"
          className="w-full py-2 text-white transition bg-blue-700 rounded hover:bg-blue-800"
        >
          Login
        </button>

        <div className="mt-2 text-center">
          <a
            href="/forgot-password"
            className="text-sm text-blue-600 hover:underline"
          >
            Forgot Password?
          </a>
        </div>
      </form>

      {/* Password Change Modal Triggered from User Context */}
      <ChangePasswordModal />
    </div>
  );
};

export default LoginForm;
