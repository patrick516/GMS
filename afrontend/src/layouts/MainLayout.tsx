import { ReactNode } from "react";
import Sidebar from "@components/layout/Sidebar";

const MainLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex min-h-screen w-screen bg-gray-100 text-white">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <main className="flex-grow p-4">
        <div className="w-full h-full bg-green-600 rounded-xl p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
