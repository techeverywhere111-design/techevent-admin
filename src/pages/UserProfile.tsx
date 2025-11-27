/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
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

interface ProfileFormState {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface ProfileErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
}

const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<AdminUser | null>(null);

  const [formData, setFormData] = useState<ProfileFormState>({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
  });

  const [errors, setErrors] = useState<ProfileErrors>({});
  const [successMessage, setSuccessMessage] = useState("");

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
      try {
        setLoading(true);
        const userId = getUserId();

        if (!userId) {
          navigate("/user-management");
          return;
        }

        if (location.state && (location.state as any).user) {
          const userData = (location.state as any).user as AdminUser;
          setUser(userData);
          setFormData({
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            role: userData.roleType,
          });
        } else {
          const [userData] = await GetBulkAdminUsers([userId]);
          if (!userData) {
            navigate("/user-management");
            return;
          }
          setUser(userData);
          setFormData({
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            role: userData.roleType,
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        navigate("/user-management");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [location, navigate]);

  const handleBack = () => {
    navigate("/user-management");
  };

  const handleInputChange = (field: keyof ProfileFormState, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
    setSuccessMessage("");
  };

  const validateForm = (): boolean => {
    const newErrors: ProfileErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.role.trim()) {
      newErrors.role = "Role is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSaving(true);

      console.log("Update user payload:", {
        userId: user?.id,
        ...formData,
      });

      setSuccessMessage("Profile updated successfully!");
      setTimeout(() => {
        navigate("/user-management");
      }, 2000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setErrors({ firstName: "Failed to update profile. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-8">
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
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
        </div>

        {/* Profile Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sm:p-8">
          {successMessage && (
            <div className="mb-6 p-4 bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-200 rounded-lg">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSaveChanges}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  placeholder="Jane"
                  value={formData.firstName}
                  onChange={(e) =>
                    handleInputChange("firstName", e.target.value)
                  }
                  className={`w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-900 border rounded-lg focus:outline-none focus:ring-2 text-gray-900 dark:text-gray-100 ${
                    errors.firstName
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 dark:border-gray-700 focus:ring-blue-500"
                  }`}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.firstName}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(e) =>
                    handleInputChange("lastName", e.target.value)
                  }
                  className={`w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-900 border rounded-lg focus:outline-none focus:ring-2 text-gray-900 dark:text-gray-100 ${
                    errors.lastName
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 dark:border-gray-700 focus:ring-blue-500"
                  }`}
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                )}
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
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-900 border rounded-lg focus:outline-none focus:ring-2 text-gray-900 dark:text-gray-100 ${
                    errors.email
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 dark:border-gray-700 focus:ring-blue-500"
                  }`}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* Role as dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => handleInputChange("role", e.target.value)}
                  className={`w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-900 border rounded-lg focus:outline-none focus:ring-2 text-gray-900 dark:text-gray-100 ${
                    errors.role
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 dark:border-gray-700 focus:ring-blue-500"
                  }`}
                >
                  <option value="">Select</option>
                  <option value="ADMIN">Admin</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                  <option value="MANAGER">Manager</option>
                </select>
                {errors.role && (
                  <p className="text-red-500 text-sm mt-1">{errors.role}</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
