import { ReactNode } from "react";
import Sidebar from "@components/layout/Sidebar";

const MainLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex h-screen w-screen bg-gray-100 text-gray-900 overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-grow overflow-hidden">
        <header className="sticky top-0 z-10 bg-white shadow px-6 py-4 ml-5 mr-5">
          <h1 className="text-xl font-bold text-gray-800 text-center uppercase">
            Uas Motors Garage Inventory Management System
          </h1>
        </header>

        {/* Scrollable content area */}
        <main className="flex-grow overflow-y-auto p-6">
          <div className="bg-white rounded-xl shadow p-6 min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
