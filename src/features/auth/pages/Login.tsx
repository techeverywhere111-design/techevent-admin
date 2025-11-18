/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";
import Logo from "@/assets/PlutoEvent_Logo.png";
import {
  AdminUserLogin,
  type AdminUserLoginPayload,
} from "@/lib/api/AdminEndpoint";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState<AdminUserLoginPayload>({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<Partial<AdminUserLoginPayload>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validateForm = () => {
    const newErrors: Partial<AdminUserLoginPayload> = {};
    if (!formData.email.trim()) newErrors.email = "Email is required.";
    if (!formData.password.trim()) newErrors.password = "Password is required.";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email))
      newErrors.email = "Enter a valid email.";

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fix the errors in the form.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const data = await AdminUserLogin(formData);
      console.log("Login successful:", data);
      login(data);
      toast.success(`Welcome back, ${data.firstName}!`);
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field: keyof AdminUserLoginPayload) =>
    `w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent ${
      errors[field] ? "border-red-500 focus:ring-red-500" : "border-gray-300"
    }`;

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden">
      <div className="hidden md:flex relative w-1/2 flex-col justify-center items-center text-white bg-[#0B1739] clip-path-custom">
        <div className="text-center space-y-2">
          <img src={Logo} alt="Logo" className="h-20 w-auto mx-auto" />
          <p className="text-gray-300 italic text-sm tracking-wide">
            Manage. Monitor. Control.
          </p>
        </div>
      </div>

      <div className="flex w-full md:w-1/2 justify-center items-start md:items-center bg-white p-6 md:p-12">
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
            Admin Sign In
          </h2>
          <p className="text-center text-gray-500 mb-4 sm:mb-6 text-sm">
            Sign in to keep everything running smoothly.
          </p>

          <form className="space-y-6 sm:space-y-10" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className={inputClass("email")}
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
                  placeholder="Enter your password"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-sky-500 hover:bg-sky-600 text-white py-2 rounded-md transition disabled:opacity-70"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

            <p className="text-sm text-center text-gray-600 mt-2">
              Don&apos;t have an account?{" "}
              <a
                href="/signup"
                className="text-sky-600 hover:underline font-medium"
              >
                Sign Up
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
