import { Menu } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  BarChart2,
  Gem,
} from "lucide-react";

interface NavbarProps {
  toggleSidebar: () => void;
}

// Your route definitions
const routes = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Client Management", path: "/clients", icon: Users },
  { name: "Payment History", path: "/payments", icon: CreditCard },
  { name: "Analytics and Insight", path: "/analytics", icon: BarChart2 },
  { name: "Plans", path: "/plans", icon: Gem },
];

export default function Navbar({ toggleSidebar }: NavbarProps) {
  const location = useLocation();

  // Find the current route based on pathname
  const currentRoute = routes.find((route) => route.path === location.pathname);

  return (
    <header className="flex items-center justify-between bg-white dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2">
        <button
          onClick={toggleSidebar}
          className="md:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Menu size={22} />
        </button>
        <h1 className="text-lg font-semibold">
          {currentRoute ? currentRoute.name : "Page"}
        </h1>
      </div>
      <ThemeToggle />
    </header>
  );
}
