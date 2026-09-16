/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, Lock } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "@/context/AuthContext";
import {
  GetBulkAdminUsers,
  UpdateSelfAdminUser,
  ChangeAdminPassword,
} from "@/lib/api/AdminEndpoint";
import AppLoader from "@/components/ui/AppLoader";
import { showErrorToast } from "@/lib/utils/toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const validatePasswordStrength = (password: string): string | null => {
  if (password.length < 6) {
    return "Password must be at least 6 characters long.";
  }
  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter.";
  }
  if (!/[0-9]/.test(password)) {
    return "Password must contain at least one number.";
  }
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    return "Password must contain at least one special character.";
  }
  return null;
};

const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: authUser, login } = useAuth();
  const queryClient = useQueryClient();

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
  const initialUserData =
    location.state && (location.state as any).user
      ? (location.state as any).user
      : null;

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

  const currentUser = isViewingOtherUser
    ? displayUser
    : authUser || displayUser;

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFirstName(currentUser.firstName || "");
      setLastName(currentUser.lastName || "");
    }
  }, [currentUser]);

  useEffect(() => {
    if (userId && !loading && !displayUser && !initialUserData) {
      navigate("/user-management");
    }
  }, [userId, loading, displayUser, initialUserData, navigate]);

  const initialFirstName = currentUser?.firstName || "";
  const initialLastName = currentUser?.lastName || "";

  const isNameChanged =
    firstName.trim() !== initialFirstName ||
    lastName.trim() !== initialLastName;

  const isNameValid =
    firstName.trim().length > 0 && lastName.trim().length > 0;

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      return await UpdateSelfAdminUser({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
    },
    onSuccess: (updatedUser) => {
      login(updatedUser);
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      toast.success("Profile updated successfully");
    },
    onError: (err: any) => {
      showErrorToast(err, "Failed to update profile");
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async () => {
      return await ChangeAdminPassword({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      });
    },
    onSuccess: (res) => {
      toast.success(res?.message || "Password changed successfully");
      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordErrors({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    },
    onError: (err: any) => {
      showErrorToast(err?.response?.data?.message || err?.message || "Failed to change password");
    },
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isNameChanged || !isNameValid || isViewingOtherUser) return;
    updateProfileMutation.mutate();
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors = { oldPassword: "", newPassword: "", confirmPassword: "" };
    let hasError = false;

    if (!passwordForm.oldPassword.trim()) {
      errors.oldPassword = "Old password is required";
      hasError = true;
    }
    if (!passwordForm.newPassword.trim()) {
      errors.newPassword = "New password is required";
      hasError = true;
    } else if (passwordForm.oldPassword && passwordForm.oldPassword === passwordForm.newPassword) {
      errors.newPassword = "Old Password cannot be equal to new password";
      hasError = true;
    } else {
      const strengthErr = validatePasswordStrength(passwordForm.newPassword);
      if (strengthErr) {
        errors.newPassword = strengthErr;
        hasError = true;
      }
    }
    if (!passwordForm.confirmPassword.trim()) {
      errors.confirmPassword = "Confirm password is required";
      hasError = true;
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
      hasError = true;
    }

    setPasswordErrors(errors);
    if (!hasError) {
      changePasswordMutation.mutate();
    }
  };

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

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 p-4 sm:p-5">
        <div className="max-w-4xl mx-auto text-center text-gray-600 dark:text-gray-400">
          User not found
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 p-4 sm:p-5">
      <div className="max-w-4xl">
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

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sm:p-8 mb-8">
          <form onSubmit={handleProfileSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  placeholder="Enter first name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={isViewingOtherUser}
                  className={`w-full px-4 py-2.5 rounded-lg border text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 ${
                    isViewingOtherUser
                      ? "bg-gray-100 dark:bg-gray-900 border-gray-300 dark:border-gray-700 cursor-not-allowed"
                      : "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:ring-blue-500"
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  placeholder="Enter last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={isViewingOtherUser}
                  className={`w-full px-4 py-2.5 rounded-lg border text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 ${
                    isViewingOtherUser
                      ? "bg-gray-100 dark:bg-gray-900 border-gray-300 dark:border-gray-700 cursor-not-allowed"
                      : "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:ring-blue-500"
                  }`}
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
                  placeholder="email@domain.com"
                  value={currentUser?.email || ""}
                  disabled
                  className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-900 border rounded-lg text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Role
                </label>
                <select
                  value={currentUser?.roleType || ""}
                  disabled
                  className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-900 border rounded-lg appearance-none text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 cursor-not-allowed"
                >
                  <option value="">Select</option>
                  <option value="ADMIN">Admin</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                  <option value="MANAGER">Manager</option>
                </select>
              </div>
            </div>

            {!isViewingOtherUser && (
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={
                    !isNameChanged ||
                    !isNameValid ||
                    updateProfileMutation.isPending
                  }
                  className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updateProfileMutation.isPending
                    ? "Updating..."
                    : "Save Changes"}
                </button>
              </div>
            )}
          </form>
        </div>

        {!isViewingOtherUser && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-6">
              <Lock className="text-gray-700 dark:text-gray-300" size={20} />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Change Password
              </h2>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Old Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showOldPassword ? "text" : "password"}
                    placeholder="Enter old password"
                    value={passwordForm.oldPassword}
                    onChange={(e) => {
                      setPasswordForm((prev) => ({
                        ...prev,
                        oldPassword: e.target.value,
                      }));
                      setPasswordErrors((prev) => ({
                        ...prev,
                        oldPassword: "",
                      }));
                    }}
                    className={`w-full px-4 py-2.5 pr-10 rounded-lg border text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 ${
                      passwordErrors.oldPassword
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 dark:border-gray-700 focus:ring-blue-500"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {passwordErrors.oldPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {passwordErrors.oldPassword}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    New Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={passwordForm.newPassword}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPasswordForm((prev) => ({
                          ...prev,
                          newPassword: val,
                        }));
                        if (!val.trim()) {
                          setPasswordErrors((prev) => ({
                            ...prev,
                            newPassword: "",
                          }));
                        } else if (
                          passwordForm.oldPassword &&
                          passwordForm.oldPassword === val
                        ) {
                          setPasswordErrors((prev) => ({
                            ...prev,
                            newPassword: "Old Password cannot be equal to new password",
                          }));
                        } else {
                          const strengthErr = validatePasswordStrength(val);
                          setPasswordErrors((prev) => ({
                            ...prev,
                            newPassword: strengthErr || "",
                          }));
                        }
                      }}
                      className={`w-full px-4 py-2.5 pr-10 rounded-lg border text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 ${
                        passwordErrors.newPassword
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 dark:border-gray-700 focus:ring-blue-500"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      {showNewPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                  {passwordErrors.newPassword ? (
                    <p className="text-red-500 text-xs mt-1">
                      {passwordErrors.newPassword}
                    </p>
                  ) : (
                    <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                      Must be min. 6 characters, contain 1 uppercase letter, 1 number & 1 special character.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => {
                        setPasswordForm((prev) => ({
                          ...prev,
                          confirmPassword: e.target.value,
                        }));
                        setPasswordErrors((prev) => ({
                          ...prev,
                          confirmPassword: "",
                        }));
                      }}
                      className={`w-full px-4 py-2.5 pr-10 rounded-lg border text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 ${
                        passwordErrors.confirmPassword
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 dark:border-gray-700 focus:ring-blue-500"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                  {passwordErrors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">
                      {passwordErrors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={changePasswordMutation.isPending}
                  className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {changePasswordMutation.isPending
                    ? "Changing Password..."
                    : "Change Password"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
