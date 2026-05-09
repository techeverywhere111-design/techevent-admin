import { Menu, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import ThemeToggle from "./ThemeToggle";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

interface NavbarProps {
  toggleSidebar: () => void;
}

export default function Navbar({ toggleSidebar }: NavbarProps) {
  const { toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    document.cookie =
      "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    setShowLogoutModal(false);
    navigate("/");
  };

  return (
    <header className="flex items-center justify-between bg-white dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700 relative">
      <div className="flex items-center gap-2">
        <button
          onClick={toggleSidebar}
          className="md:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Menu size={22} />
        </button>
      </div>

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen((prev) => !prev)}
          className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          <div className="text-right text-sm">
            <p className="font-semibold">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-gray-500 text-xs">{user?.email}</p>
          </div>
          <ChevronDown size={16} />
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md z-50">
            <button
              onClick={() => navigate(`/profile`)}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              View Profile
            </button>

            <div
              onClick={toggleTheme}
              className="w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
            >
              <span>Theme</span>
              <ThemeToggle />
            </div>

            <button
              onClick={() => setShowLogoutModal(true)}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Log Out
            </button>
          </div>
        )}
      </div>

      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-blue-100/20 backdrop-blur-sm dark:bg-blue-900/30"
            onClick={() => setShowLogoutModal(false)}
          ></div>

          <div className="relative w-112 md:w-96 rounded-lg overflow-hidden shadow-xl bg-white dark:bg-gray-800 transform transition-transform duration-300 scale-100">
            <div className="flex items-center justify-between px-4 py-2 bg-[#0B1E36] dark:bg-blue-900">
              <h3 className="text-white font-semibold text-lg">Log Out?</h3>
              <button
                className="text-white font-bold text-lg"
                onClick={() => setShowLogoutModal(false)}
              >
                ×
              </button>
            </div>

            <div className="p-6 py-16 text-center">
              <p className="text-gray-800 dark:text-gray-200 mb-14">
                Are you sure you want to log out?
              </p>

              <div className="flex justify-center gap-12">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="px-8 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                >
                  Cancel
                </button>

                <button
                  onClick={handleLogout}
                  className="px-8 py-2 bg-blue-500 rounded-md text-white font-semibold hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 transition"
                >
                  Log Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
