/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import Logo from "@/assets/PlutoEvent_Logo.png";
import { CompleteAdminPasswordReset } from "@/lib/api/AdminEndpoint";
import { showErrorToast } from "@/lib/utils/toast";

type PageState = "form" | "success" | "error";

interface ResetPasswordForm {
  newPassword: string;
  confirmPassword: string;
}

interface ResetPasswordErrors {
  newPassword?: string;
  confirmPassword?: string;
}

const CompleteResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("xxyqwe") || "";
  const token = searchParams.get("szeyu") || "";
  const [formData, setFormData] = useState<ResetPasswordForm>({
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<ResetPasswordErrors>({});
  const [pageState, setPageState] = useState<PageState>(
    email && token ? "form" : "error"
  );
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (field: keyof ResetPasswordForm, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const validateForm = () => {
    const nextErrors: ResetPasswordErrors = {};

    if (!formData.newPassword) {
      nextErrors.newPassword = "New password is required.";
    } else if (formData.newPassword.length < 8) {
      nextErrors.newPassword = "Password must be at least 8 characters.";
    }

    if (!formData.confirmPassword) {
      nextErrors.confirmPassword = "Please confirm your new password.";
    } else if (formData.newPassword !== formData.confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email || !token) {
      setPageState("error");
      return;
    }

    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await CompleteAdminPasswordReset({
        email,
        token,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });

      setPageState("success");
      toast.success(response.message || "Password reset successfully.");
      setTimeout(() => navigate("/"), 3000);
    } catch (error: any) {
      showErrorToast(
        error.response?.data?.message ||
          "Password reset failed. Please request a new reset link."
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field: keyof ResetPasswordErrors) =>
    `w-full rounded-md border px-3 py-2 pr-10 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-sky-500 ${
      errors[field] ? "border-red-500 focus:ring-red-500" : "border-gray-300"
    }`;

  if (pageState === "success") {
    return (
      <AuthPage>
        <div className="space-y-4 text-center">
          <h1 className="text-xl font-semibold text-green-600 sm:text-2xl">
            Password Reset Successful
          </h1>
          <p className="text-sm text-gray-500">
            Your password has been updated. Redirecting to sign in...
          </p>
          <Loader2 size={20} className="mx-auto animate-spin text-sky-500" />
        </div>
      </AuthPage>
    );
  }

  if (pageState === "error") {
    return (
      <AuthPage>
        <div className="space-y-4 text-center">
          <h1 className="text-xl font-semibold sm:text-2xl">Invalid Reset Link</h1>
          <p className="text-sm text-gray-500">
            This password reset link is incomplete or invalid. Please request a new link.
          </p>
          <button
            onClick={() => navigate("/")}
            className="w-full rounded-md bg-sky-500 py-2 text-white transition hover:bg-sky-600"
          >
            Back to Sign In
          </button>
        </div>
      </AuthPage>
    );
  }

  return (
    <AuthPage>
      <div className="mb-6 flex flex-col items-center md:hidden">
        <img src={Logo} alt="PlutoEvent" className="mb-2 h-20 w-auto" />
        <p className="text-center text-sm italic tracking-wide text-gray-500">
          Manage. Monitor. Control.
        </p>
      </div>

      <h1 className="mb-2 text-center text-xl font-semibold sm:text-2xl">
        Reset Password
      </h1>
      <p className="mb-6 text-center text-sm text-gray-500">
        Create a new password for your administrator account.
      </p>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            readOnly
            aria-readonly="true"
            className="w-full cursor-not-allowed rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-gray-600"
          />
        </div>

        <PasswordField
          label="New Password"
          placeholder="Minimum 8 characters"
          value={formData.newPassword}
          error={errors.newPassword}
          visible={showNewPassword}
          inputClass={inputClass("newPassword")}
          onChange={(value) => handleChange("newPassword", value)}
          onToggleVisibility={() => setShowNewPassword((visible) => !visible)}
        />

        <PasswordField
          label="Confirm New Password"
          placeholder="Repeat your new password"
          value={formData.confirmPassword}
          error={errors.confirmPassword}
          visible={showConfirmPassword}
          inputClass={inputClass("confirmPassword")}
          onChange={(value) => handleChange("confirmPassword", value)}
          onToggleVisibility={() => setShowConfirmPassword((visible) => !visible)}
        />

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-sky-500 py-2 text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading && <Loader2 size={18} className="animate-spin" />}
          {loading ? "Resetting Password..." : "Reset Password"}
        </button>

        <p className="text-center text-sm text-gray-500">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="text-sky-500 hover:underline"
          >
            Back to Sign In
          </button>
        </p>
      </form>
    </AuthPage>
  );
};

interface PasswordFieldProps {
  label: string;
  placeholder: string;
  value: string;
  error?: string;
  visible: boolean;
  inputClass: string;
  onChange: (value: string) => void;
  onToggleVisibility: () => void;
}

const PasswordField: React.FC<PasswordFieldProps> = ({
  label,
  placeholder,
  value,
  error,
  visible,
  inputClass,
  onChange,
  onToggleVisibility,
}) => (
  <div>
    <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={inputClass}
      />
      <button
        type="button"
        onClick={onToggleVisibility}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
        aria-label={visible ? `Hide ${label}` : `Show ${label}`}
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);

const AuthPage: React.FC<React.PropsWithChildren> = ({ children }) => (
  <div className="flex min-h-screen min-w-0 flex-col overflow-y-auto md:h-screen md:flex-row md:overflow-hidden">
    <div className="relative hidden w-1/2 flex-col items-center justify-center bg-[#0B1739] text-white md:flex clip-path-custom">
      <div className="space-y-2 text-center">
        <img src={Logo} alt="PlutoEvent" className="mx-auto h-20 w-auto" />
        <p className="text-sm italic tracking-wide text-gray-300">
          Manage. Monitor. Control.
        </p>
      </div>
    </div>
    <main className="flex w-full items-center justify-center bg-white p-6 md:w-1/2 md:p-12">
      <div className="w-full max-w-xs sm:max-w-sm">{children}</div>
    </main>
  </div>
);

export default CompleteResetPassword;
