import {
  FaTools,
  FaBox,
  FaUsers,
  FaChartBar,
  FaCog,
  FaCarSide,
} from "react-icons/fa";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  return (
    <aside className="w-64 h-screen bg-gray-800 text-white flex flex-col shadow-md">
      {/* Logo Icon */}
      <div className="flex justify-center items-center py-4">
        <FaCarSide className="text-4xl text-white" />
      </div>

      {/* Title */}
      <div className="text-center text-xl font-semibold pb-3 border-b border-gray-700 px-4">
        Garage Management System
      </div>

      {/* Nav links */}
      <nav className="flex flex-col space-y-2 p-4">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex items-center p-2 rounded hover:bg-gray-700 transition ${
              isActive ? "bg-gray-700" : ""
            }`
          }
        >
          <FaChartBar className="mr-3" /> Dashboard
        </NavLink>
        <NavLink
          to="/inventory"
          className={({ isActive }) =>
            `flex items-center p-2 rounded hover:bg-gray-700 transition ${
              isActive ? "bg-gray-700" : ""
            }`
          }
        >
          <FaBox className="mr-3" /> Inventory
        </NavLink>
        <NavLink
          to="/users"
          className={({ isActive }) =>
            `flex items-center p-2 rounded hover:bg-gray-700 transition ${
              isActive ? "bg-gray-700" : ""
            }`
          }
        >
          <FaUsers className="mr-3" /> Users
        </NavLink>
        <NavLink
          to="/reports"
          className={({ isActive }) =>
            `flex items-center p-2 rounded hover:bg-gray-700 transition ${
              isActive ? "bg-gray-700" : ""
            }`
          }
        >
          <FaTools className="mr-3" /> Reports
        </NavLink>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center p-2 rounded hover:bg-gray-700 transition ${
              isActive ? "bg-gray-700" : ""
            }`
          }
        >
          <FaCog className="mr-3" /> Settings
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
