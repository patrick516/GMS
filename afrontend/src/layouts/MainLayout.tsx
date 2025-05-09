import { ReactNode, useState } from "react";
import { FaUserTie } from "react-icons/fa6";
import Sidebar from "@components/layout/Sidebar";
import logout from "@components/constants/pages/logout";

const MainLayout = ({ children }: { children: ReactNode }) => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  const userRaw = localStorage.getItem("user");
  const user = userRaw ? JSON.parse(userRaw) : null;

  return (
    <div className="flex w-screen h-screen overflow-hidden text-gray-900 bg-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-grow overflow-hidden">
        <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 ml-5 mr-5 bg-white shadow">
          <h1 className="text-xl font-bold text-gray-800 uppercase">
            Uas Motors Garage Inventory Management System
          </h1>

          {/* User Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!isDropdownOpen)}
              className="text-gray-700 hover:text-black focus:outline-none"
            >
              <FaUserTie className="text-4xl" />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 z-50 w-64 mt-2 text-sm bg-white border rounded shadow-lg">
                <div className="px-4 py-2 border-b">
                  <div className="font-semibold text-gray-800">
                    {user?.username || "Guest"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {user?.email || "No email"}
                  </div>
                </div>
                <button
                  className="w-full px-4 py-2 text-left hover:bg-gray-100"
                  onClick={() => {
                    setDropdownOpen(false);
                    window.location.href = "/account";
                  }}
                >
                  Account Details
                </button>
                <button
                  className="w-full px-4 py-2 text-left hover:bg-gray-100"
                  onClick={() => {
                    setDropdownOpen(false);
                    window.location.href = "/settings";
                  }}
                >
                  Settings
                </button>
                <button
                  className="w-full px-4 py-2 text-left text-red-500 hover:bg-gray-100"
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Scrollable content area */}
        <main className="flex-grow p-6 overflow-y-auto">
          <div className="min-h-full p-6 bg-white shadow rounded-xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
