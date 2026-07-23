/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { GetBulkAdminUsers } from "@/lib/api/AdminEndpoint";
import AppLoader from "@/components/ui/AppLoader";



import { useQuery } from "@tanstack/react-query";

const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: authUser } = useAuth();

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

  const userId = getUserId();
  const isViewingOtherUser = !!userId;
  const initialUserData = location.state && (location.state as any).user ? (location.state as any).user : null;

  const { data: displayUser, isLoading: loading } = useQuery({
    queryKey: ["userProfile", userId],
    queryFn: async () => {
      if (initialUserData) return initialUserData;
      if (!userId) return null;
      const [userData] = await GetBulkAdminUsers([userId]);
      if (!userData) throw new Error("User not found");
      return userData;
    },
    enabled: !!userId && !initialUserData,
    initialData: initialUserData || (userId ? undefined : authUser),
  });

  useEffect(() => {
    if (userId && !loading && !displayUser && !initialUserData) {
      navigate("/user-management");
    }
  }, [userId, loading, displayUser, initialUserData, navigate]);

  const handleBack = () => {
    navigate("/user-management");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 p-4 sm:p-5">
        <div className="max-w-4xl mx-auto">
          <AppLoader fullScreen={false} />
        </div>
      </div>
    );
  }

  if (!displayUser) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 p-4 sm:p-5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center text-gray-600 dark:text-gray-400">
            User not found
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 p-4 sm:p-5">
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
