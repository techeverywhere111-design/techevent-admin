import { useAuth } from "@/context/AuthContext";

const UserProfile: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 p-4 sm:p-5">
      <div className="max-w-4xl ">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sm:p-8">
          <div className="mb-6">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              My Profile
            </h1>
          </div>

          <form>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  placeholder="Jane"
                  value={user?.firstName || ""}
                  className={`w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-900 border rounded-lg focus:outline-none focus:ring-2 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 focus:ring-blue-500
                  `}
                  disabled
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  placeholder="Doe"
                  value={user?.lastName || ""}
                  className={`w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-900 border rounded-lg focus:outline-none focus:ring-2 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 focus:ring-blue-500
                  `}
                  disabled
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="janedoe123@gmail.com"
                  value={user?.email || ""}
                  className={`w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-900 border rounded-lg focus:outline-none focus:ring-2 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 focus:ring-blue-500
                  `}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Role
                </label>
                <select
                  value={user?.roleType || ""}
                  className={`w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-900 border rounded-lg focus:outline-none focus:ring-2 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 focus:ring-blue-500
                  `}
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
