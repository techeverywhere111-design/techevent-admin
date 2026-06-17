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
  Percent,
  Shield,
  UserRoundCog, ClipboardPenLine
} from "lucide-react";
import { useState } from "react";
import Logo from "@/assets/PlutoEvent_Logo.png";
import { useAuth } from "@/context/AuthContext";
import { usePermissionStore } from "@/store/permissionStore";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

interface NavItem {
  name: string;
  path?: string;
  icon: any;
  permission?: string;
  subItems?: { name: string; path: string; permission?: string }[];
}

const navItems: NavItem[] = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard, permission: "view_dashboard" },
  {
    name: "Client Management",
    icon: Users,
    permission: "view_clients",
    subItems: [
      { name: "All Clients", path: "/client-management" },

    ],
  },
  {
    name: "Audit Logs", path: "/audit-logs",
    icon: ClipboardPenLine,
    permission: "view_audit_logs"
  },
  {
    name: "Event Management",
    icon: Calendar1,
    permission: "view_events",
    subItems: [{ name: "Category", path: "/event-category" }],
  },
  { name: "Payment History", path: "/payments", icon: CreditCard, permission: "view_payments" },
  {
    name: "Analytics and Insight",
    path: "/analytics-and-insight",
    icon: BarChart2,
    permission: "view_analytics",
  },
  { name: "Plans", path: "/plans", icon: Gem, permission: "view_plans" },
  { name: "Enquires", path: "/enquiries", icon: ShieldQuestionMark, permission: "view_enquiries" },
  { name: "User Management", path: "/user-management", icon: ShieldUser, permission: "view_users" },
  {
    name: "Discount Management",
    icon: Percent,
    permission: "view_discounts",
    subItems: [{ name: "Promo Code", path: "/promo-code" }],
  },
  {
    name: "Roles and Permission",
    icon: UserRoundCog,
    permission: "view_roles",
    subItems: [
      { name: "Roles", path: "/roles" },
      { name: "Permission", path: "/permissions" }
    ],
  },
  {
    name: "Suspicious Users/Activity",
    path: "/suspicious-users-activity",
    icon: Shield,
    permission: "view_security",
  },
];

export default function Sidebar({ isOpen, toggleSidebar }: SidebarProps) {
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>(
    {}
  );
  const { user } = useAuth();
  const permissions = usePermissionStore((s) => s.permissions);

  const isSuperAdmin = user?.roleType === "SUPER_ADMIN";

  const hasPermission = (permissionName?: string): boolean => {
    if (!permissionName || isSuperAdmin) return true;
    return permissions.some((p) => p.name === permissionName);
  };

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
          {filteredNavItems.map(({ name, path, icon: Icon, subItems }) => {

            const isSubItemActive = subItems?.some(
              (sub) => sub.path === window.location.pathname
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
                          `flex items-center gap-3 pl-12 py-2 text-sm transition-colors rounded-lg whitespace-nowrap ${isActive
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
                  `flex items-center gap-3 px-6 py-3 text-sm transition-colors rounded-lg whitespace-nowrap ${isActive
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

