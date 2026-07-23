import { Menu, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import ThemeToggle from "./ThemeToggle";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { usePermissionStore } from "@/store/permissionStore";

interface NavbarProps {
  toggleSidebar: () => void;
}

export default function Navbar({ toggleSidebar }: NavbarProps) {
  const { toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const clearPermissions = usePermissionStore((s) => s.clearPermissions);

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
    clearPermissions();
    logout();
    document.cookie =
      "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    setShowLogoutModal(false);
    navigate("/");
  };

  return (
    <header className="relative flex min-w-0 items-center justify-between border-b border-gray-200 bg-white px-3 py-3 dark:border-gray-700 dark:bg-gray-800 sm:px-4">
      <div className="flex items-center gap-2">
        <button
          onClick={toggleSidebar}
          className="md:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Menu size={22} />
        </button>
      </div>

      <div className="relative min-w-0" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen((prev) => !prev)}
          className="flex max-w-[calc(100vw-4rem)] items-center gap-2 rounded-md px-2 py-2 hover:bg-gray-200 dark:hover:bg-gray-600 sm:max-w-none sm:px-4"
        >
          <div className="min-w-0 text-right text-sm">
            <p className="truncate font-semibold">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="truncate text-xs text-gray-500">{user?.email}</p>
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

          <div className="relative w-[calc(100%-2rem)] max-w-md rounded-lg overflow-hidden shadow-xl bg-white dark:bg-gray-800 transform transition-transform duration-300 scale-100">
            <div className="flex items-center justify-between px-4 py-2 bg-[#0B1E36] dark:bg-blue-900">
              <h3 className="text-white font-semibold text-lg">Log Out?</h3>
              <button
                className="text-white font-bold text-lg"
                onClick={() => setShowLogoutModal(false)}
              >
                ×
              </button>
            </div>

            <div className="p-6 text-center sm:py-12">
              <p className="mb-8 text-gray-800 dark:text-gray-200 sm:mb-12">
                Are you sure you want to log out?
              </p>

              <div className="flex flex-col-reverse justify-center gap-3 sm:flex-row sm:gap-6">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="w-full rounded-md border border-red-500 px-6 py-2 text-red-500 transition hover:bg-red-50 dark:hover:bg-red-900/20 sm:w-auto"
                >
                  Cancel
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full rounded-md bg-blue-500 px-6 py-2 font-semibold text-white transition hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 sm:w-auto"
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
