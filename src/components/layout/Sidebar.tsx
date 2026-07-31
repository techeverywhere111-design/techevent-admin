/* eslint-disable @typescript-eslint/no-explicit-any */
import { NavLink, useLocation } from "react-router-dom";
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
  Percent,
  Shield,
  UserRoundCog, ClipboardPenLine
} from "lucide-react";
import { useState } from "react";
import Logo from "@/assets/PlutoEvent_Logo.png";
import {
  ROUTE_PERMISSIONS,
  type PermissionRequirement,
} from "@/lib/permissions";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

interface NavItem {
  name: string;
  path?: string;
  activePaths?: string[];
  icon: any;
  permission?: PermissionRequirement;
  subItems?: {
    name: string;
    path: string;
    activePaths?: string[];
    permission?: PermissionRequirement;
  }[];
}

const navItems: NavItem[] = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard, permission: ROUTE_PERMISSIONS.dashboard },
  {
    name: "Client Management",
    icon: Users,
    subItems: [
      { name: "All Clients", path: "/client-management", permission: ROUTE_PERMISSIONS.clients },

    ],
  },
  {
    name: "Audit Logs", path: "/audit-logs",
    icon: ClipboardPenLine,
    permission: ROUTE_PERMISSIONS.auditLogs
  },
  {
    name: "Event Management",
    icon: Calendar1,
    subItems: [{ name: "Category", path: "/event-category", permission: ROUTE_PERMISSIONS.eventCategories }],
  },
  { name: "Payment History", path: "/payments", icon: CreditCard, permission: ROUTE_PERMISSIONS.paymentHistory },
  {
    name: "Analytics and Insight",
    path: "/analytics-and-insight",
    icon: BarChart2,
    permission: ROUTE_PERMISSIONS.analytics,
  },
  { name: "Plans", path: "/plans", activePaths: ["/plans", "/plan-creation"], icon: Gem, permission: ROUTE_PERMISSIONS.plans },
  { name: "Enquires", path: "/enquiries", icon: ShieldQuestionMark, permission: ROUTE_PERMISSIONS.enquiries },
  { name: "User Management", path: "/user-management", icon: ShieldUser, permission: ROUTE_PERMISSIONS.adminUsers },
  {
    name: "Discount Management",
    icon: Percent,
    subItems: [{ name: "Promo Code", path: "/promo-code", permission: ROUTE_PERMISSIONS.promoCodes }],
  },
  {
    name: "Roles and Permission",
    icon: UserRoundCog,
    subItems: [
      { name: "Roles", path: "/roles", permission: ROUTE_PERMISSIONS.roles },
      { name: "Permission", path: "/permissions", permission: ROUTE_PERMISSIONS.permissions }
    ],
  },
  {
    name: "Suspicious Users/Activity",
    path: "/suspicious-users-activity",
    icon: Shield,
    permission: ROUTE_PERMISSIONS.suspiciousUsers,
  },
];

export default function Sidebar({ isOpen, toggleSidebar }: SidebarProps) {
  const location = useLocation();
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>(
    {}
  );

  const hasPermission = (_permission?: PermissionRequirement): boolean => {
    return true;
  };

  const isPathActive = (path?: string, activePaths: string[] = []) =>
    path === location.pathname || activePaths.includes(location.pathname);

  const toggleDropdown = (name: string) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const filteredNavItems = navItems
    .filter((item) => hasPermission(item.permission))
    .map((item) => {
      if (!item.subItems) return item;
      const filteredSubs = item.subItems.filter((sub) =>
        hasPermission(sub.permission)
      );
      if (filteredSubs.length === 0) return null;
      return { ...item, subItems: filteredSubs };
    })
    .filter(Boolean) as NavItem[];

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 bg-black/30 z-20 md:hidden ${isOpen ? "block" : "hidden"
          }`}
        onClick={toggleSidebar}
      />

      <aside
        className={`fixed md:static z-30 inset-y-0 left-0 w-72 bg-[#0B1E36] text-white flex flex-col transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
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
        <nav className="flex-1 mt-6 space-y-1 overflow-y-auto custom-scrollbar pb-6">
          {filteredNavItems.map(({ name, path, activePaths, icon: Icon, subItems }) => {

            const isSubItemActive = subItems?.some(
              (sub) => isPathActive(sub.path, sub.activePaths)
            );

            if (subItems) {
              const isDropdownOpen = openDropdowns[name];

              return (
                <div key={name}>
                  <button
                    onClick={() => toggleDropdown(name)}
                    className={`flex items-center justify-between gap-3 w-full px-6 py-3 text-sm transition- rounded-lg whitespace-nowrap ${isSubItemActive
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
                    className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${isDropdownOpen ? "max-h-60" : "max-h-0"
                      }`}
                  >
                    {subItems.map((sub) => (
                      <NavLink
                        key={sub.name}
                        to={sub.path}
                        className={({ isActive }) =>
                          `flex items-center gap-3 pl-12 py-2 text-sm transition-colors rounded-lg whitespace-nowrap ${isActive || isPathActive(sub.path, sub.activePaths)
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
                  `flex items-center gap-3 px-6 py-3 text-sm transition-colors rounded-lg whitespace-nowrap ${isActive || isPathActive(path, activePaths)
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

