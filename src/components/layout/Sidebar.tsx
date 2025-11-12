import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  BarChart2,
  Gem,
  Calendar1,
  ShieldUser,
  X,
} from "lucide-react";
import Logo from "@/assets/PlutoEvent_Logo.png";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const navItems = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Client Management", path: "/client-management", icon: Users },
  { name: "Event Management", path: "/event-management", icon: Calendar1 },
  { name: "Payment History", path: "/payments", icon: CreditCard },
  {
    name: "Analytics and Insight",
    path: "/analytics-and-insight",
    icon: BarChart2,
  },
  { name: "Plans", path: "/plans", icon: Gem },
  { name: "Admin Management", path: "/admin-management", icon: ShieldUser },
];

export default function Sidebar({ isOpen, toggleSidebar }: SidebarProps) {
  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 bg-black/30 z-20 md:hidden ${
          isOpen ? "block" : "hidden"
        }`}
        onClick={toggleSidebar}
      />

      <aside
        className={`fixed md:static z-30 inset-y-0 left-0 w-64 bg-[#0B1E36] text-white flex flex-col transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <img src={Logo} alt="Logo" className="h-12 w-auto" />
          </div>
          <button className="md:hidden" onClick={toggleSidebar}>
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 mt-6 space-y-1">
          {navItems.map(({ name, path, icon: Icon }) => (
            <NavLink
              key={name}
              to={path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-6 py-3 text-sm transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-blue-800 hover:text-white"
                }`
              }
              onClick={toggleSidebar}
            >
              <Icon size={18} />
              {name}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
