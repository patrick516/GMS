import { useState } from "react";
import axios from "axios";

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { username, email, password, confirmPassword } = formData;

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, {
        username,
        email,
        password,
        confirmPassword,
      });

      setSuccess("Account created successfully!");
      setFormData({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    } catch (err) {
      console.error("Registration error:", err);
      setError("Registration failed. Try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-sm text-center text-red-600">{error}</div>}
      {success && (
        <div className="text-sm text-center text-green-600">{success}</div>
      )}

      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">
          Username
        </label>
        <input
          type="text"
          name="username"
          className="w-full px-3 py-2 border rounded shadow-sm focus:outline-none"
          value={formData.username}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          name="email"
          className="w-full px-3 py-2 border rounded shadow-sm focus:outline-none"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          type="password"
          name="password"
          className="w-full px-3 py-2 border rounded shadow-sm focus:outline-none"
          value={formData.password}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">
          Confirm Password
        </label>
        <input
          type="password"
          name="confirmPassword"
          className="w-full px-3 py-2 border rounded shadow-sm focus:outline-none"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />
      </div>

      <button
        type="submit"
        className="w-full py-2 text-white transition bg-blue-700 rounded hover:bg-blue-800"
      >
        Register
      </button>
    </form>
  );
};

export default RegisterForm;
