import { ReactNode } from "react";
import Sidebar from "@components/layout/Sidebar";

const MainLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar on the left */}
      <Sidebar />

      {/* Main content on the right */}
      <main className="flex-grow p-6 bg-gray-100 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
