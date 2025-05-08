import { useState } from "react";
import { FaTools, FaBox, FaUsers, FaChartBar, FaCog } from "react-icons/fa";
import { NavLink } from "react-router-dom";
import { AiOutlinePlus } from "react-icons/ai";
import { RiFileList2Line } from "react-icons/ri";
import { MdInventory2 } from "react-icons/md";
import { TbBoxOff } from "react-icons/tb";
import { FaPowerOff } from "react-icons/fa";
import { BsPersonStanding } from "react-icons/bs";
import { FiUser } from "react-icons/fi";
import { SiCashapp } from "react-icons/si";
import { TbReorder } from "react-icons/tb";
import { LiaCaretSquareDownSolid } from "react-icons/lia";
import { FaCarSide } from "react-icons/fa";
import { FaPlus } from "react-icons/fa";
import { FaSupple } from "react-icons/fa";
import { FaFileSignature, FaFileInvoiceDollar } from "react-icons/fa";

const userRaw = localStorage.getItem("user");
const user = userRaw ? JSON.parse(userRaw) : null;

console.log("user from localStorage:", user);

const Sidebar = () => {
  const [isInventoryOpen, setInventoryOpen] = useState(false);

  const [isUsersOpen, setUsersOpen] = useState(false);
  const [isVehiclesOpen, setVehiclesOpen] = useState(false);

  const [isQuotationsOpen, setQuotationsOpen] = useState(false);
  const [isInvoicesOpen, setInvoicesOpen] = useState(false);

  return (
    <aside className="top-0 left-0 z-50 w-80 h-screen bg-[#24397b] text-white flex flex-col shadow-md overflow-y-auto">
      {/* Logo Icon */}
      <div className="flex items-center justify-center py-4">
        <div className="flex items-center justify-center gap-4 py-4">
          <img
            src="/logos/uas-motors-logo.png"
            alt="UAS Motors Logo"
            className="w-auto h-20"
          />
          {/* <img
            src="/logos/garage-logo.png"
            alt="Second Logo"
            className="w-auto h-20"
          /> */}
        </div>
      </div>

      {/* Title */}
      <div className="px-4 pb-3 text-center border-b border-gray-700">
        <div className="text-xl font-semibold">Garage Management System</div>
        {user && (
          <>
            <div className="mt-1 text-sm text-gray-300">{user.username}</div>
            <div className="text-xs text-gray-400">{user.email}</div>
          </>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex flex-col p-4 space-y-2">
        {/* Dashboard */}
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex items-center p-2 rounded hover:bg-[#6886b8] transition ${
              isActive ? "bg-gray-700" : ""
            }`
          }
        >
          <FaChartBar className="mr-3" /> Dashboard
        </NavLink>

        {/* Inventory (collapsible) */}
        <div
          onClick={() => setInventoryOpen(!isInventoryOpen)}
          className="flex items-center p-2 transition rounded cursor-pointer hover:bg-gray-700"
        >
          <FaBox className="mr-3" />
          <span className="flex-1">Inventory</span>
          <LiaCaretSquareDownSolid
            className={`text-lg transition-transform duration-200 ${
              isInventoryOpen ? "rotate-180" : "rotate-0"
            }`}
          />
        </div>

        {/* Inventory sub-items (visible only if isInventoryOpen is true) */}
        {isInventoryOpen && (
          <div className="flex flex-col ml-8 space-y-1">
            <NavLink
              to="/inventory/add"
              className={({ isActive }) =>
                `flex items-center text-sm p-2 rounded hover:bg-gray-700 transition ${
                  isActive ? "bg-gray-700" : ""
                }`
              }
            >
              <AiOutlinePlus className="mr-2 text-lg" />
              Add Inventory
            </NavLink>

            {/* <NavLink
              to="/inventory/edit"
              className={({ isActive }) =>
                `flex items-center text-sm p-2 rounded hover:bg-gray-700 transition ${
                  isActive ? "bg-gray-700" : ""
                }`
              }
            >
              <MdEdit className="mr-2 text-lg" /> Update Inventory
            </NavLink> */}

            <NavLink
              to="/inventory/list"
              className={({ isActive }) =>
                `flex items-center text-sm p-2 rounded hover:bg-gray-700 transition ${
                  isActive ? "bg-gray-700" : ""
                }`
              }
            >
              <RiFileList2Line className="mr-2 text-lg" /> Inventory List
            </NavLink>

            <NavLink
              to="/inventory/stock"
              className={({ isActive }) =>
                `flex items-center text-sm p-2 rounded hover:bg-gray-700 transition ${
                  isActive ? "bg-gray-700" : ""
                }`
              }
            >
              <MdInventory2 className="mr-2 text-lg" /> Stock Levels
            </NavLink>

            <NavLink
              to="/inventory/damaged"
              className={({ isActive }) =>
                `flex items-center text-sm p-2 rounded hover:bg-gray-700 transition ${
                  isActive ? "bg-gray-700" : ""
                }`
              }
            >
              <TbBoxOff className="mr-2 text-lg" />
              Damaged Items
            </NavLink>

            <NavLink
              to="/inventory/reorder"
              className={({ isActive }) =>
                `flex items-center text-sm p-2 rounded hover:bg-gray-700 transition ${
                  isActive ? "bg-gray-700" : ""
                }`
              }
            >
              <TbReorder className="mr-2 tetx-lg" /> Reorder Requests
            </NavLink>

            <NavLink
              to="/inventory/suppliers"
              className={({ isActive }) =>
                `flex items-center  text-sm p-2 rounded hover:bg-gray-700 transition ${
                  isActive ? "bg-gray-700" : ""
                }`
              }
            >
              <FaSupple className="mr-2 text-lg " /> Suppliers
            </NavLink>
          </div>
        )}

        {/* Users */}
        {/* Users (collapsible) */}
        <div
          onClick={() => setUsersOpen(!isUsersOpen)}
          className="flex items-center p-2 transition rounded cursor-pointer hover:bg-gray-700"
        >
          <FaUsers className="mr-3" />
          <span className="flex-1">Users</span>
          <LiaCaretSquareDownSolid
            className={`text-lg transition-transform duration-200 ${
              isInventoryOpen ? "rotate-180" : "rotate-0"
            }`}
          />
        </div>
        {isUsersOpen && (
          <div className="flex flex-col ml-8 space-y-1">
            <NavLink
              to="/users/customers/add"
              className={({ isActive }) =>
                `flex items-center text-sm p-2 rounded hover:bg-gray-700 transition ${
                  isActive ? "bg-gray-700" : ""
                }`
              }
            >
              <FiUser className="mr-2 text-lg" />
              Add Customer
            </NavLink>

            <NavLink
              to="/users/customers/debtors"
              className={({ isActive }) =>
                `flex items-center text-sm p-2 rounded hover:bg-gray-700 transition ${
                  isActive ? "bg-gray-700" : ""
                }`
              }
            >
              <FiUser className="mr-2 text-lg" />
              Debtors List
            </NavLink>

            <NavLink
              to="/users/employees"
              className={({ isActive }) =>
                `flex items-center text-sm p-2 rounded hover:bg-gray-700 transition ${
                  isActive ? "bg-gray-700" : ""
                }`
              }
            >
              <BsPersonStanding className="mr-2 text-lg" /> Employees
            </NavLink>

            <NavLink
              to="/users/accounts"
              className={({ isActive }) =>
                `flex items-center text-sm p-2 rounded hover:bg-gray-700 transition ${
                  isActive ? "bg-gray-700" : ""
                }`
              }
            >
              <SiCashapp className="mr-2 text-lg" /> Accountants
            </NavLink>
          </div>
        )}

        <div
          onClick={() => setVehiclesOpen(!isVehiclesOpen)}
          className="flex items-center p-2 transition rounded cursor-pointer hover:bg-gray-700"
        >
          <FaCarSide className="mr-3" />
          <span className="flex-1">Vehicles</span>
          <LiaCaretSquareDownSolid
            className={`text-lg transition-transform duration-200 ${
              isInventoryOpen ? "rotate-180" : "rotate-0"
            }`}
          />
        </div>

        {/* Vehicle sub-links */}
        {isVehiclesOpen && (
          <div className="flex flex-col ml-8 space-y-1">
            <NavLink
              to="/vehicles/add"
              className={({ isActive }) =>
                `flex items-center text-sm p-2 rounded hover:bg-gray-700 transition ${
                  isActive ? "bg-gray-700" : ""
                }`
              }
            >
              <FaPlus className="mr-2" />
              Add Vehicle
            </NavLink>

            {/* <NavLink
              to="/vehicles/list"
              className={({ isActive }) =>
                `flex items-center text-sm p-2 rounded hover:bg-gray-700 transition ${
                  isActive ? "bg-gray-700" : ""
                }`
              }
            >
              <FaList className="mr-2" />
              Vehicle List
            </NavLink>

            <NavLink
              to="/vehicles/types"
              className={({ isActive }) =>
                `flex items-center text-sm p-2 rounded hover:bg-gray-700 transition ${
                  isActive ? "bg-gray-700" : ""
                }`
              }
            >
              <FaCogs className="mr-2" />
              Vehicle Types
            </NavLink> */}
          </div>
        )}

        {/* Quotations */}
        <div
          onClick={() => setQuotationsOpen(!isQuotationsOpen)}
          className="flex items-center p-2 transition rounded cursor-pointer hover:bg-gray-700"
        >
          <FaFileSignature className="mr-3" />
          <span className="flex-1">Quotations</span>
          <LiaCaretSquareDownSolid
            className={`text-lg transition-transform duration-200 ${
              isQuotationsOpen ? "rotate-180" : "rotate-0"
            }`}
          />
        </div>

        {isQuotationsOpen && (
          <div className="flex flex-col ml-8 space-y-1">
            <NavLink
              to="/quotations/create"
              className={({ isActive }) =>
                `flex items-center text-sm p-2 rounded hover:bg-gray-700 transition ${
                  isActive ? "bg-gray-700" : ""
                }`
              }
            >
              Create Quotation
            </NavLink>
            {/* <NavLink
              to="/quotations"
              className={({ isActive }) =>
                `flex items-center text-sm p-2 rounded hover:bg-gray-700 transition ${
                  isActive ? "bg-gray-700" : ""
                }`
              }
            >
              Quotation List
            </NavLink> */}
          </div>
        )}

        {/* Invoices */}
        <div
          onClick={() => setInvoicesOpen(!isInvoicesOpen)}
          className="flex items-center p-2 transition rounded cursor-pointer hover:bg-gray-700"
        >
          <FaFileInvoiceDollar className="mr-3" />
          <span className="flex-1">Invoices</span>
          <LiaCaretSquareDownSolid
            className={`text-lg transition-transform duration-200 ${
              isInvoicesOpen ? "rotate-180" : "rotate-0"
            }`}
          />
        </div>

        {isInvoicesOpen && (
          <div className="flex flex-col ml-8 space-y-1">
            {/* <NavLink
              to="/invoices/create"
              className={({ isActive }) =>
                `flex items-center text-sm p-2 rounded hover:bg-gray-700 transition ${
                  isActive ? "bg-gray-700" : ""
                }`
              }
            >
              Create Invoice
            </NavLink> */}
            <NavLink
              to="/invoices/details"
              className={({ isActive }) =>
                `flex items-center text-sm p-2 rounded hover:bg-gray-700 transition ${
                  isActive ? "bg-gray-700" : ""
                }`
              }
            >
              Invoice List
            </NavLink>

            {/* <NavLink
              to="/invoices"
              className={({ isActive }) =>
                `flex items-center text-sm p-2 rounded hover:bg-gray-700 transition ${
                  isActive ? "bg-gray-700" : ""
                }`
              }
            >
              Invoice List
            </NavLink> */}
          </div>
        )}

        {/*Vehicles*/}
        {/* 
        <div
          onClick={() => setVehiclesOpen(!isVehiclesOpen)}
          className="flex items-center p-2 transition rounded cursor-pointer hover:bg-gray-700"
        >
          <FaCarSide className="mr-3" />
          <span className="flex-1">Vehicles</span>
          <LiaCaretSquareDownSolid
            className={`text-lg transition-transform duration-200 ${
              isInventoryOpen ? "rotate-180" : "rotate-0"
            }`}
          />
        </div> */}

        {/* Vehicle sub-links */}

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

        {/* Settings */}
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
      <div className="p-4 mt-auto">
        <button
          onClick={() => console.log("Logging out...")}
          className="flex items-center w-full p-2 text-sm text-red-400 transition rounded hover:bg-red-700 hover:text-white"
        >
          <FaPowerOff className="mr-2 text-lg" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
