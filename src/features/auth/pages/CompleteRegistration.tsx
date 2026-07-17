/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Cookies from "js-cookie";
import Logo from "@/assets/PlutoEvent_Logo.png";
import { CompleteAdminInvite, GetAdmin } from "@/lib/api/AdminEndpoint";
import { showErrorToast } from "@/lib/utils/toast";

type PageState = "form" | "success" | "error";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

const getParam = (searchParams: URLSearchParams, ...keys: string[]) => {
  for (const key of keys) {
    const value = searchParams.get(key);
    if (value) return value;
  }
  return "";
};

const CompleteRegistration: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteId = getParam(searchParams, "ixxd", "id");
  const fallbackFirstName = getParam(searchParams, "firstName", "firstname");
  const fallbackLastName = getParam(searchParams, "lastName", "lastname");
  const fallbackEmail = getParam(searchParams, "email");

  const [pageState, setPageState] = useState<PageState>("form");
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [fetchingInvite, setFetchingInvite] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    let isMounted = true;

    Cookies.remove("PLUTO_EVENT_ADMIN_TOKEN", { path: "/" });
    Cookies.remove("PLUTO_EVENT_ADMIN_USER", { path: "/" });

    if (!inviteId) {
      setErrorMessage("No invitation reference found. Please use the invite link from your email.");
      setPageState("error");
      return;
    }

    const hydrateInvite = async () => {
      setFetchingInvite(true);
      setErrorMessage("");
      setPageState("form");
      setErrors({});

      try {
        const admin = await GetAdmin(inviteId);
        if (!isMounted) return;

        setFormData((prev) => ({
          ...prev,
          firstName: admin.firstName || "",
          lastName: admin.lastName || "",
          email: admin.email,
          password: "",
          confirmPassword: "",
        }));
      } catch (err: any) {
        if (!isMounted) return;

        if (fallbackEmail) {
          setFormData((prev) => ({
            ...prev,
            firstName: fallbackFirstName,
            lastName: fallbackLastName,
            email: fallbackEmail,
            password: "",
            confirmPassword: "",
          }));
          showErrorToast(
            err.response?.data?.message ||
              "Could not refresh invitation details. Please review the fields before continuing."
          );
          return;
        }

        setErrorMessage(
          err.response?.data?.message ||
            "We could not find this invitation. Please use the latest invite link from your email."
        );
        setPageState("error");
      } finally {
        if (isMounted) {
          setFetchingInvite(false);
        }
      }
    };

    hydrateInvite();

    return () => {
      isMounted = false;
    };
  }, [fallbackEmail, fallbackFirstName, fallbackLastName, inviteId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required.";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email.";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required.";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fix the errors in the form.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteId) {
      setErrorMessage("No invitation reference found. Please use the invite link from your email.");
      setPageState("error");
      return;
    }

    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await CompleteAdminInvite({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      setPageState("success");
      toast.success(response.message || "Account activated successfully!");
      setTimeout(() => navigate("/"), 3000);
    } catch (err: any) {
      showErrorToast(
        err.response?.data?.message || "Activation failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field: keyof FormErrors) =>
    `w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent ${
      errors[field] ? "border-red-500 focus:ring-red-500" : "border-gray-300"
    }`;

  if (pageState === "success") {
    return (
      <div className="flex flex-col md:flex-row h-screen overflow-hidden">
        <BrandPanel />
        <div className="flex w-full md:w-1/2 justify-center items-center bg-white p-6 md:p-12">
          <div className="w-full max-w-xs sm:max-w-sm text-center space-y-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-green-600">
              Account Activated
            </h2>
            <p className="text-gray-500 text-sm">
              Your administrator account is ready. Redirecting to sign in...
            </p>
            <Loader2 size={20} className="text-sky-500 animate-spin mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  if (pageState === "error") {
    return (
      <div className="flex flex-col md:flex-row h-screen overflow-hidden">
        <BrandPanel />
        <div className="flex w-full md:w-1/2 justify-center items-center bg-white p-6 md:p-12">
          <div className="w-full max-w-xs sm:max-w-sm text-center space-y-4">
            <h2 className="text-xl sm:text-2xl font-semibold">
              Invalid Invitation Link
            </h2>
            <p className="text-gray-500 text-sm">{errorMessage}</p>
            <button
              onClick={() => navigate("/")}
              className="w-full bg-sky-500 hover:bg-sky-600 text-white py-2 rounded-md transition"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden">
      <BrandPanel />

      <div className="flex w-full md:w-1/2 justify-center items-start md:items-center bg-white p-6 md:p-12 overflow-y-auto">
        <div className="w-full max-w-xs sm:max-w-sm">
          <div className="flex flex-col items-center mb-6 md:hidden">
            <img
              src={Logo}
              alt="Logo"
              className="h-20 w-auto mb-2 animate-fadeInLogo"
            />
            <p className="text-gray-500 italic text-sm tracking-wide text-center animate-fadeInTagline">
              Manage. Monitor. Control.
            </p>
          </div>

          <h2 className="text-xl sm:text-2xl font-semibold text-center mb-2">
            Complete Invitation
          </h2>
          <p className="text-center text-gray-500 mb-4 sm:mb-6 text-sm">
            Use the email address that received the invite and set your
            password.
          </p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={inputClass("firstName")}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.firstName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={inputClass("lastName")}
                />
                {errors.lastName && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.lastName}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                readOnly
                aria-readonly="true"
                className={`${inputClass("email")} bg-gray-100 text-gray-600 cursor-not-allowed`}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Minimum 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                  className={inputClass("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Repeat your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={inputClass("confirmPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || fetchingInvite}
              className="w-full bg-sky-500 hover:bg-sky-600 text-white py-2 rounded-md transition disabled:opacity-70"
            >
              {fetchingInvite
                ? "Loading invite..."
                : loading
                  ? "Activating..."
                  : "Activate Account"}
            </button>

            <p className="text-center text-sm text-gray-500">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/")}
                className="text-sky-500 hover:underline"
              >
                Sign In
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

const BrandPanel = () => (
  <div className="hidden md:flex relative w-1/2 flex-col justify-center items-center text-white bg-[#0B1739] clip-path-custom">
    <div className="text-center space-y-2">
      <img src={Logo} alt="Logo" className="h-20 w-auto mx-auto" />
      <p className="text-gray-300 italic text-sm tracking-wide">
        Manage. Monitor. Control.
      </p>
    </div>
  </div>
);

export default CompleteRegistration;
