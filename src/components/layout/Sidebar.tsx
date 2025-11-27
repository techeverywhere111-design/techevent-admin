/* eslint-disable @typescript-eslint/no-explicit-any */
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
  ChevronRight,
  ChevronDown,
  ShieldQuestionMark,
} from "lucide-react";
import { useState } from "react";
import Logo from "@/assets/PlutoEvent_Logo.png";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

interface NavItem {
  name: string;
  path?: string;
  icon: any;
  subItems?: { name: string; path: string }[];
}

const navItems: NavItem[] = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Client Management", path: "/client-management", icon: Users },
  {
    name: "Event Management",
    icon: Calendar1,
    subItems: [{ name: "Category", path: "/event-category" }],
  },
  { name: "Payment History", path: "/payments", icon: CreditCard },
  {
    name: "Analytics and Insight",
    path: "/analytics-and-insight",
    icon: BarChart2,
  },
  { name: "Plans", path: "/plans", icon: Gem },
  { name: "Enquires", path: "/enquires", icon: ShieldQuestionMark },
  { name: "User Management", path: "/user-management", icon: ShieldUser },
];

export default function Sidebar({ isOpen, toggleSidebar }: SidebarProps) {
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>(
    {}
  );

  const toggleDropdown = (name: string) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

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
        {/* Logo */}
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
          {navItems.map(({ name, path, icon: Icon, subItems }) => {
            // Determine if any sub-item is active
            const isSubItemActive = subItems?.some(
              (sub) => sub.path === window.location.pathname
            );

            if (subItems) {
              const isDropdownOpen = openDropdowns[name];

              return (
                <div key={name}>
                  <button
                    onClick={() => toggleDropdown(name)}
                    className={`flex items-center justify-between gap-3 w-full px-6 py-3 text-sm transition- rounded-lg ${
                      isSubItemActive
                        ? "bg-blue-600 text-white"
                        : "text-gray-300 hover:bg-blue-800 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={18} />
                      {name}
                    </div>
                    {isDropdownOpen ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                  </button>

                  <div
                    className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${
                      isDropdownOpen ? "max-h-60" : "max-h-0"
                    }`}
                  >
                    {subItems.map((sub) => (
                      <NavLink
                        key={sub.name}
                        to={sub.path}
                        className={({ isActive }) =>
                          `flex items-center gap-3 pl-12 py-2 text-sm transition-colors rounded-lg ${
                            isActive
                              ? "bg-[#081A30] text-[#237BE6] "
                              : "text-gray-300 hover:bg-blue-700 hover:text-white"
                          }`
                        }
                        onClick={toggleSidebar}
                      >
                        {sub.name}
                      </NavLink>
                    ))}
                  </div>
                </div>
              );
            }

            return (
              <NavLink
                key={name}
                to={path!}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-6 py-3 text-sm transition-colors rounded-lg ${
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
            );
          })}
        </nav>
      </aside>
    </>
  );
}
