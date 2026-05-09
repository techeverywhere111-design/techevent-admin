import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";
import Logo from "@/assets/PlutoEvent_Logo.png";
import {
  AdminUserCreate,
  type AdminUserPayload,
} from "@/lib/api/AdminEndpoint";

const Signup: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<AdminUserPayload>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "SUPER_ADMIN",
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof AdminUserPayload, string>>
  >({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors((prev) => ({ ...prev, [name]: undefined })); // clear error
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};
    const { firstName, lastName, email, password, confirmPassword } = formData;

    if (!firstName.trim()) newErrors.firstName = "First name is required.";
    if (!lastName.trim()) newErrors.lastName = "Last name is required.";
    if (!email.trim()) newErrors.email = "Email is required.";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email))
      newErrors.email = "Enter a valid email address.";

    if (!password) newErrors.password = "Password is required.";
    else {
      if (password.length < 6)
        newErrors.password = "Password must be at least 6 characters.";
      if (password.toLowerCase().includes(email.split("@")[0].toLowerCase()))
        newErrors.password =
          "Password should not be too similar to your email.";

      const complexityRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=<>?{}[\]~]).+$/;
      if (!complexityRegex.test(password))
        newErrors.password =
          "Password must include an uppercase letter, number, and special character.";
    }

    if (password !== confirmPassword)
      newErrors.confirmPassword = "Passwords do not match.";

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
      await AdminUserCreate(formData);
      toast.success("Account created successfully!");
      navigate("/");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Signup failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field: keyof AdminUserPayload) =>
    `w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent ${
      errors[field] ? "border-red-500 focus:ring-red-500" : "border-gray-300"
    }`;

  const renderPasswordField = (
    name: "password" | "confirmPassword",
    value: string,
    show: boolean,
    setShow: React.Dispatch<React.SetStateAction<boolean>>
  ) => (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        name={name}
        value={value}
        placeholder="Enter your password"
        onChange={handleChange}
        className={inputClass(name)}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
      {errors[name] && (
        <p className="text-red-500 text-xs mt-1">{errors[name]}</p>
      )}
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left Panel */}
      <div
        className="relative w-1/2 flex flex-col justify-center items-center text-white bg-[#0B1739]"
        style={{ clipPath: "polygon(70% 100%, 0% 100%, 0 0, 85% 0 )" }}
      >
        <div className="text-center space-y-2">
          <img src={Logo} alt="Logo" className="h-24 w-auto" />
          <p className="text-gray-300 italic text-sm tracking-wide">
            Manage. Monitor. Control.
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex w-full md:w-1/2 justify-center items-center bg-white">
        <div className="w-full max-w-md px-6">
          <h2 className="text-2xl font-semibold text-center mb-2">
            Create Admin Account
          </h2>
          <p className="text-center text-gray-500 mb-6 text-sm">
            Fill in your details to get started.
          </p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Name fields */}
            <div className="grid grid-cols-2 gap-3">
              {["firstName", "lastName"].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium mb-1 text-gray-700 capitalize">
                    {field.replace(/([A-Z])/g, " $1")}
                  </label>
                  <input
                    type="text"
                    name={field}
                    value={formData[field as keyof AdminUserPayload]}
                    onChange={handleChange}
                    className={inputClass(field as keyof AdminUserPayload)}
                  />
                  {errors[field as keyof AdminUserPayload] && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors[field as keyof AdminUserPayload]}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="Enter your mail"
                value={formData.email}
                onChange={handleChange}
                className={inputClass("email")}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Password
              </label>
              {renderPasswordField(
                "password",
                formData.password,
                showPassword,
                setShowPassword
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Confirm Password
              </label>
              {renderPasswordField(
                "confirmPassword",
                formData.confirmPassword,
                showConfirmPassword,
                setShowConfirmPassword
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-sky-500 hover:bg-sky-600 text-white py-2 rounded-md transition disabled:opacity-70"
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>

            <p className="text-sm text-center text-gray-600 mt-2">
              Already have an account?{" "}
              <a href="/" className="text-sky-600 hover:underline font-medium">
                Sign in
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
