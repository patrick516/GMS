import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

import axios from "axios";

const AuthPage = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [adminExists, setAdminExists] = useState(false);
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/auth/admin-exists`
        );
        setAdminExists(res.data.exists);
      } catch (err) {
        console.error("Failed to check admin status:", err);
      }
    };

    checkAdmin();
  }, []);
  useEffect(() => {
    if (adminExists) {
      setActiveTab("login");
    }
  }, [adminExists]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-gray-100">
      {/* Background Image + Title */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
        <h1 className="mb-4 text-3xl font-bold tracking-wider text-gray-700 md:text-2.5xl drop-shadow-lg uppercase">
          <span className="text-red-600">Pro</span>
          <span className="text-blue-700">Tech</span> Garage Inventory
          Management System
        </h1>

        <img
          src="/logos/login-image.png"
          alt="Background"
          className="max-w-[700px] w-full h-auto"
        />
      </div>

      {/* Foreground Form Card */}
      <div className="relative z-10 w-full max-w-md p-6 bg-white shadow-lg bg-opacity-95 rounded-xl">
        <div className="flex justify-center mb-4">
          <img
            src="/logos/uas-motors-logo.webp"
            alt="UAS Motors Logo"
            className="w-auto h-20"
          />
        </div>

        <div className="flex mb-4 overflow-hidden border rounded">
          <button
            onClick={() => setActiveTab("login")}
            className={`w-full py-2 font-semibold ${
              activeTab === "login"
                ? "bg-blue-700 text-white"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            Login
          </button>

          {!adminExists && (
            <button
              onClick={() => setActiveTab("register")}
              className={`w-full py-2 font-semibold ${
                activeTab === "register"
                  ? "bg-blue-700 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              Register
            </button>
          )}
        </div>

        {activeTab === "login" ? (
          <LoginForm />
        ) : adminExists ? (
          <div className="py-4 font-semibold text-center text-red-600">
            Admin already exists. Registration is disabled.
          </div>
        ) : (
          <RegisterForm />
        )}
      </div>
      <div className="absolute bottom-0 w-full text-center py-2 bg-[#001f3f]">
        <p className="text-2xl  font-semibold text-[#00cccc]">
          Powered by{" "}
          <a
            href="https://tranptech.wuaze.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="italic underline hover:text-white"
          >
            Tranptech
          </a>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
