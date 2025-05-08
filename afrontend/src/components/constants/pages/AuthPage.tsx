import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

const AuthPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

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
        <h1 className="mb-4 text-3xl font-bold tracking-wider text-gray-700 md:text-2.5xl drop-shadow-lg">
          UAS MOTORS INVENTORY MANAGEMENT SYSTEM
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
            className={`w-1/2 py-2 font-semibold ${
              activeTab === "login"
                ? "bg-blue-700 text-white"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setActiveTab("register")}
            className={`w-1/2 py-2 font-semibold ${
              activeTab === "register"
                ? "bg-blue-700 text-white"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            Register
          </button>
        </div>

        {activeTab === "login" ? <LoginForm /> : <RegisterForm />}
      </div>
    </div>
  );
};

export default AuthPage;
