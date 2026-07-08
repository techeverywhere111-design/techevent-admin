/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  AlertTriangle, 
  Loader2, 
  CheckCircle2, 
  KeyRound,
  Mail,
  Shield,
  ArrowRight,
  Sparkles,
  Lock
} from "lucide-react";
import Logo from "@/assets/PlutoEvent_Logo.png";

interface InvitedUser {
  firstName: string;
  lastName: string;
  email: string;
  roleType: string;
}

type PageState = "loading" | "form" | "success" | "error";

interface FormData {
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  password?: string;
  confirmPassword?: string;
}

const CompleteRegistration: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [pageState, setPageState] = useState<PageState>("loading");
  const [invitedUser, setInvitedUser] = useState<InvitedUser | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState<FormData>({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Real-time password requirements checking
  const [pwdMetrics, setPwdMetrics] = useState({
    length: false,
    number: false,
    special: false,
    upperLower: false,
  });

  useEffect(() => {
    const pwd = formData.password;
    setPwdMetrics({
      length: pwd.length >= 8,
      number: /[0-9]/.test(pwd),
      special: /[^A-Za-z0-9]/.test(pwd),
      upperLower: /[a-z]/.test(pwd) && /[A-Z]/.test(pwd),
    });
  }, [formData.password]);

  const strengthCount = Object.values(pwdMetrics).filter(Boolean).length;
  const strengthColor = 
    strengthCount === 0 ? "bg-slate-200 dark:bg-slate-700" :
    strengthCount <= 2 ? "bg-rose-500" :
    strengthCount === 3 ? "bg-amber-500" : "bg-emerald-500";

  const strengthLabel = 
    strengthCount === 0 ? "None" :
    strengthCount <= 2 ? "Weak" :
    strengthCount === 3 ? "Medium" : "Strong";

  useEffect(() => {
    if (!token) {
      setErrorMessage("No invitation token found. Please check your email link.");
      setPageState("error");
      return;
    }

    const validateToken = async () => {
      try {
        // Simulated API call delay for design preview
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setInvitedUser({
          firstName: "Alexander",
          lastName: "Kovalski",
          email: "alexander.kovalski@plutospace.com",
          roleType: "SUPER_ADMIN",
        });
        setPageState("form");
      } catch (err: any) {
        const message =
          err.response?.data?.message ||
          "This invitation link is invalid or has expired.";
        setErrorMessage(message);
        setPageState("error");
      }
    };

    validateToken();
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

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
      toast.error("Please satisfy all password requirements.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setPageState("success");
      toast.success("Account activated successfully!");
      setTimeout(() => navigate("/"), 3000);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Activation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatRole = (role: string) =>
    role
      .split("_")
      .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
      .join(" ");

  // Initials for avatar
  const getInitials = (user: InvitedUser) => {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  };

  // Loading state
  if (pageState === "loading") {
    return (
      <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-300">
        <div className="hidden lg:flex relative w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-[#060B26] via-[#0B1739] to-[#12235A] overflow-hidden text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.08),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.08),transparent_50%)]" />
          <div className="relative z-10">
            <img src={Logo} alt="Logo" className="h-12 w-auto" />
          </div>
          <div className="relative z-10 max-w-md space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold">
              <Sparkles size={12} /> SECURE GATEWAY
            </div>
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent leading-tight">
              Access the Next Generation of Event Management
            </h1>
            <p className="text-slate-400 leading-relaxed text-sm">
              Plutospace Event Admin panel provides you with state-of-the-art instruments to schedule, organize, scale, and analyze events worldwide.
            </p>
          </div>
          <div className="relative z-10 text-xs text-slate-500">
            &copy; 2026 PlutospaceEvents. Premium Enterprise Portal.
          </div>
        </div>
        <div className="flex w-full lg:w-1/2 justify-center items-center p-6 bg-slate-50 dark:bg-slate-950">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-sky-500/20 blur-md animate-pulse" />
              <Loader2 size={44} className="text-sky-500 animate-spin relative z-10" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mt-2">Checking Credentials</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs">Verifying your secure invitation key. Please stand by...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (pageState === "error") {
    return (
      <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-300">
        <div className="hidden lg:flex relative w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-[#060B26] via-[#0B1739] to-[#12235A] overflow-hidden text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.08),transparent_50%)]" />
          <div className="relative z-10">
            <img src={Logo} alt="Logo" className="h-12 w-auto" />
          </div>
          <div className="relative z-10 max-w-md space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-white leading-tight">
              Oops, something went wrong.
            </h1>
            <p className="text-slate-400 leading-relaxed text-sm">
              If you think this was a mistake, please reach out to your main system administrator.
            </p>
          </div>
          <div className="relative z-10 text-xs text-slate-500">
            &copy; 2026 PlutospaceEvents. All rights reserved.
          </div>
        </div>
        <div className="flex w-full lg:w-1/2 justify-center items-center p-6 bg-slate-50 dark:bg-slate-950">
          <div className="w-full max-w-md bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 backdrop-blur-sm text-center shadow-xl dark:shadow-none">
            <div className="mx-auto w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-6">
              <AlertTriangle size={32} className="text-rose-500" />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-slate-800 dark:text-slate-100">
              Invalid or Expired Link
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 leading-relaxed">
              {errorMessage}
            </p>
            <button
              onClick={() => navigate("/")}
              className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white py-3 rounded-xl transition-all duration-300 font-semibold shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2"
            >
              Back to Sign In <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (pageState === "success") {
    return (
      <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-300">
        <div className="hidden lg:flex relative w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-[#060B26] via-[#0B1739] to-[#12235A] overflow-hidden text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.08),transparent_50%)]" />
          <div className="relative z-10">
            <img src={Logo} alt="Logo" className="h-12 w-auto" />
          </div>
          <div className="relative z-10 max-w-md space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-white leading-tight">
              Registration Completed!
            </h1>
            <p className="text-slate-400 leading-relaxed text-sm">
              Your profile is verified and ready. Prepare to launch dynamic spaces.
            </p>
          </div>
          <div className="relative z-10 text-xs text-slate-500">
            &copy; 2026 PlutospaceEvents.
          </div>
        </div>
        <div className="flex w-full lg:w-1/2 justify-center items-center p-6 bg-slate-50 dark:bg-slate-950">
          <div className="w-full max-w-md bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 backdrop-blur-sm text-center space-y-6 shadow-xl dark:shadow-none">
            <div className="mx-auto w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-2">
              <CheckCircle2 size={40} className="text-emerald-500 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Setup Successful</h2>
              <p className="text-slate-550 dark:text-slate-400 text-sm mt-2 leading-relaxed">
                Your administrator account is now activated. You will be redirected to the sign-in page shortly.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs text-slate-400 dark:text-slate-500">
              <Loader2 size={14} className="animate-spin text-sky-500" />
              Redirecting...
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Form state
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-300">
      
      {/* Decorative Left Panel */}
      <div className="hidden lg:flex relative w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-[#060B26] via-[#0B1739] to-[#12235A] overflow-hidden text-white">
        {/* Subtle blur circles */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-sky-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
        
        {/* Tech Grid Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.015)_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3">
          <img src={Logo} alt="Logo" className="h-11 w-auto" />
        </div>

        <div className="relative z-10 max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles size={13} className="text-sky-400" /> Welcome to Plutospace Admin
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white leading-tight">
            Complete Registration & Secure Your Account
          </h1>
          <p className="text-slate-350 leading-relaxed text-sm">
            Set up your credentials below to access administrative features. This invitation provides customized role permissions to help manage event pipelines.
          </p>

          <div className="space-y-3.5 pt-4 border-t border-slate-800/80">
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <ShieldCheck size={16} className="text-emerald-400" /> High-security encryption enabled (AES-256)
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <ShieldCheck size={16} className="text-emerald-400" /> Instant sync with role-based access tokens
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-500">
          &copy; 2026 PlutospaceEvents. Internal Administration System.
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex w-full lg:w-1/2 justify-center items-center p-6 bg-slate-50 dark:bg-slate-950 overflow-y-auto">
        <div className="w-full max-w-md space-y-8 py-8">
          
          {/* Logo only on mobile */}
          <div className="flex flex-col items-center lg:hidden mb-2">
            <img src={Logo} alt="Logo" className="h-12 w-auto mb-2" />
            <p className="text-sky-500 dark:text-sky-400 text-xs tracking-widest font-semibold uppercase">
              PLUTOSPACE EVENTS
            </p>
          </div>

          <div className="text-center lg:text-left space-y-2">
            <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-800 dark:text-white">
              Activate Admin Access
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Please define a secure password to activate your privileges.
            </p>
          </div>

          {/* Invited User Profile Card */}
          {invitedUser && (
            <div className="relative group overflow-hidden bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 flex items-center gap-4 transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-700/80 shadow-sm dark:shadow-none">
              <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-xl pointer-events-none" />
              
              {/* Initials Avatar */}
              <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-gradient-to-br dark:from-sky-400/20 dark:to-indigo-600/20 border border-sky-200 dark:border-sky-500/25 flex items-center justify-center text-sky-600 dark:text-sky-400 font-bold tracking-wider text-sm shadow-inner shrink-0">
                {getInitials(invitedUser)}
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {invitedUser.firstName} {invitedUser.lastName}
                  </h4>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-sky-550/10 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-400/25">
                    <Shield size={10} /> {formatRole(invitedUser.roleType)}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-1.5">
                  <Mail size={12} className="text-slate-400 dark:text-slate-500" /> {invitedUser.email}
                </p>
              </div>
            </div>
          )}

          {/* Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                New Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-sky-500 dark:group-focus-within:text-sky-400 transition-colors">
                  <KeyRound size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Minimum 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full bg-white dark:bg-slate-900 border ${
                    errors.password ? "border-rose-500/60 focus:ring-rose-500/20" : "border-slate-200 dark:border-slate-800 focus:border-sky-500/60 focus:ring-sky-500/20 dark:focus:ring-sky-500/10"
                  } rounded-xl pl-10 pr-10 py-3 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-4 transition-all duration-200 shadow-sm dark:shadow-none`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-rose-500 dark:text-rose-400 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                Confirm Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-sky-500 dark:group-focus-within:text-sky-400 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Repeat your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full bg-white dark:bg-slate-900 border ${
                    errors.confirmPassword ? "border-rose-500/60 focus:ring-rose-500/20" : "border-slate-200 dark:border-slate-800 focus:border-sky-500/60 focus:ring-sky-500/20 dark:focus:ring-sky-500/10"
                  } rounded-xl pl-10 pr-10 py-3 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-4 transition-all duration-200 shadow-sm dark:shadow-none`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-rose-500 dark:text-rose-400 text-xs mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Premium Password Strength Indicators */}
            {formData.password && (
              <div className="bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-900 rounded-xl p-3.5 space-y-3.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Password strength:</span>
                  <span className={`font-semibold ${
                    strengthCount <= 2 ? "text-rose-550 dark:text-rose-400" :
                    strengthCount === 3 ? "text-amber-550 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"
                  }`}>{strengthLabel}</span>
                </div>
                
                {/* Progress bar */}
                <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${strengthColor} transition-all duration-300`} 
                    style={{ width: `${(strengthCount / 4) * 100}%` }}
                  />
                </div>

                {/* Subcheck list */}
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${pwdMetrics.length ? "bg-emerald-500 dark:bg-emerald-400" : "bg-slate-300 dark:bg-slate-700"}`} />
                    8+ Characters
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${pwdMetrics.upperLower ? "bg-emerald-500 dark:bg-emerald-400" : "bg-slate-300 dark:bg-slate-700"}`} />
                    Aa and a-z
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${pwdMetrics.number ? "bg-emerald-500 dark:bg-emerald-400" : "bg-slate-300 dark:bg-slate-700"}`} />
                    At least one number
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${pwdMetrics.special ? "bg-emerald-500 dark:bg-emerald-400" : "bg-slate-300 dark:bg-slate-700"}`} />
                    Special character
                  </div>
                </div>
              </div>
            )}

            {/* Action button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white py-3 rounded-xl transition-all duration-300 font-semibold shadow-lg shadow-sky-500/10 hover:shadow-sky-500/20 disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin text-white" />
                  Activating Account...
                </>
              ) : (
                <>
                  Activate Account
                  <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
              >
                Sign in to another account
              </button>
            </div>

          </form>
        </div>
      </div>

    </div>
  );
};

export default CompleteRegistration;
