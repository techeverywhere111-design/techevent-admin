/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { GetBulkAdminUsers } from "@/lib/api/AdminEndpoint";

interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isPendingUser: boolean;
  roleType: string;
  lastLogin: string;
  createdOn: string;
}

const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: authUser } = useAuth();

  const [loading, setLoading] = useState(false);
  const [displayUser, setDisplayUser] = useState<AdminUser | null>(null);
  const [isViewingOtherUser, setIsViewingOtherUser] = useState(false);

  const getUserId = (): string | null => {
    if (location.state && (location.state as any).user) {
      return (location.state as any).user.id;
    }
    const query = location.search;
    if (query.startsWith("?") && query.length > 1) {
      return query.substring(1);
    }
    return null;
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const userId = getUserId();

      if (userId) {
        setIsViewingOtherUser(true);
        setLoading(true);

        try {
          if (location.state && (location.state as any).user) {
            const userData = (location.state as any).user as AdminUser;
            setDisplayUser(userData);
          } else {
            const [userData] = await GetBulkAdminUsers([userId]);
            if (!userData) {
              navigate("/user-management");
              return;
            }
            setDisplayUser(userData);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          navigate("/user-management");
        } finally {
          setLoading(false);
        }
      } else {
        setIsViewingOtherUser(false);
        setDisplayUser(authUser);
      }
    };

    fetchUserData();
  }, [location, navigate, authUser]);

  const handleBack = () => {
    navigate("/user-management");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 p-4 sm:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!displayUser) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 p-4 sm:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center text-gray-600 dark:text-gray-400">
            User not found
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 p-4 sm:p-8">
      <div className="max-w-4xl ">
        <div className="mb-6">
          {isViewingOtherUser ? (
            <>
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                User Management
              </h1>
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition mb-4"
              >
                <ArrowLeft size={20} />
                <span className="text-base font-medium">View Profile</span>
              </button>
            </>
          ) : (
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              My Profile
            </h1>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sm:p-8">
          <form>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  placeholder="Jane"
                  value={displayUser?.firstName || ""}
                  className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-900 border rounded-lg focus:outline-none focus:ring-2 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 focus:ring-blue-500"
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  placeholder="Doe"
                  value={displayUser?.lastName || ""}
                  className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-900 border rounded-lg focus:outline-none focus:ring-2 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 focus:ring-blue-500"
                  disabled
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="janedoe123@gmail.com"
                  value={displayUser?.email || ""}
                  className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-900 border rounded-lg focus:outline-none focus:ring-2 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 focus:ring-blue-500"
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Role
                </label>
                <select
                  value={displayUser?.roleType || ""}
                  className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-900 border rounded-lg appearance-none pr-8 focus:outline-none focus:ring-2 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 focus:ring-blue-500 no-arrow"
                  disabled
                >
                  <option value="">Select</option>
                  <option value="ADMIN">Admin</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                  <option value="MANAGER">Manager</option>
                </select>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
