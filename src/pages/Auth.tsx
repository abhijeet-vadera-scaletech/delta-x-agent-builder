import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { showToast } from "../utils/toast";
import { Toaster } from "react-hot-toast";
import {
  EnvelopeSimple,
  LockKey,
  User as UserIcon,
  SignIn,
  UserPlus,
  Eye,
  EyeSlash,
} from "phosphor-react";
import {
  getGradient,
  getGradientDiagonal,
  getContrastTextColor,
} from "../config/theme";
import { httpService } from "../services/httpService";
import { API_CONFIG } from "../shared/constants";
import { encryptData } from "../utils/encryption";
import type { User } from "../types";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { setCurrentUser } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        const response = await httpService.post<{
          access_token: string;
          user: User;
        }>(API_CONFIG.path.login, { email, password });
        // Store token using encryption
        localStorage.setItem(
          "access_token",
          encryptData(response.access_token)
        );

        // Store user data
        httpService.setUserData(response.user);

        // Map API User to ConsultantProfile
        const consultantProfile = {
          ...response.user,
          name: `${response.user.firstName} ${response.user.lastName}`,
          primaryColor: "#2563eb",
          secondaryColor: "#9333ea",
          font: "Inter",
          socialLinks: {},
        };
        setCurrentUser(consultantProfile);
        showToast.success("Welcome back! 👋");

        // Check if there's a redirect path saved
        const redirectPath = sessionStorage.getItem("redirectAfterLogin");
        if (redirectPath) {
          sessionStorage.removeItem("redirectAfterLogin");
          navigate(redirectPath);
        } else {
          navigate("/dashboard");
        }
      } else {
        if (!firstName.trim() || !lastName.trim()) {
          throw new Error("Please enter your first and last name");
        }
        const response = await httpService.post<{
          access_token: string;
          user: User;
        }>(API_CONFIG.path.register, { firstName, lastName, email, password });
        // Store token using encryption
        localStorage.setItem(
          "access_token",
          encryptData(response.access_token)
        );

        // Store user data
        httpService.setUserData(response.user);

        // Map API User to ConsultantProfile
        const consultantProfile = {
          ...response.user,
          name: `${response.user.firstName} ${response.user.lastName}`,
          primaryColor: "#2563eb",
          secondaryColor: "#9333ea",
          font: "Inter",
          socialLinks: {},
        };
        setCurrentUser(consultantProfile);
        showToast.success("Account created successfully! 🎉");

        // Check if there's a redirect path saved
        const redirectPath = sessionStorage.getItem("redirectAfterLogin");
        if (redirectPath) {
          sessionStorage.removeItem("redirectAfterLogin");
          navigate(redirectPath);
        } else {
          navigate("/dashboard");
        }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "An error occurred";
      setError(errorMsg);
      showToast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 flex items-center justify-center px-4">
      <Toaster />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center text-2xl font-bold"
            style={{
              backgroundImage: getGradientDiagonal(theme, "primary"),
              color: getContrastTextColor(theme),
            }}
            whileHover={{ scale: 1.05, rotate: 360 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            C
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            DeltaX Platform
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Create and Deploy AI Agents Without Code
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
          {/* Tabs */}
          <div className="flex gap-3 mb-8 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <button
              onClick={() => {
                setIsLogin(true);
                setError("");
              }}
              className="flex-1 py-2.5 font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
              style={
                isLogin
                  ? {
                      backgroundImage: getGradient(theme, "primary"),
                      color: getContrastTextColor(theme),
                    }
                  : {}
              }
            >
              <SignIn size={18} weight="duotone" />
              <span
                className={!isLogin ? "text-gray-700 dark:text-gray-300" : ""}
              >
                Sign In
              </span>
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setError("");
              }}
              className="flex-1 py-2.5 font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
              style={
                !isLogin
                  ? {
                      backgroundImage: getGradient(theme, "primary"),
                      color: getContrastTextColor(theme),
                    }
                  : {}
              }
            >
              <UserPlus size={18} weight="duotone" />
              <span
                className={isLogin ? "text-gray-700 dark:text-gray-300" : ""}
              >
                Sign Up
              </span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-5"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    First Name
                  </label>
                  <div className="relative">
                    <UserIcon
                      size={20}
                      weight="duotone"
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                    />
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="John"
                      required={!isLogin}
                      className="w-full pl-11 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Last Name
                  </label>
                  <div className="relative">
                    <UserIcon
                      size={20}
                      weight="duotone"
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                    />
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                      required={!isLogin}
                      className="w-full pl-11 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 transition-colors"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <EnvelopeSimple
                  size={20}
                  weight="duotone"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-11 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <LockKey
                  size={20}
                  weight="duotone"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-11 pr-11 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeSlash size={20} weight="duotone" />
                  ) : (
                    <Eye size={20} weight="duotone" />
                  )}
                </button>
              </div>
              {!isLogin && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                  At least 6 characters
                </p>
              )}
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
              >
                <p className="text-sm text-red-700 dark:text-red-400">
                  {error}
                </p>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{
                backgroundImage: getGradient(theme, "primary"),
                color: getContrastTextColor(theme),
              }}
            >
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
                  />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  {isLogin ? (
                    <SignIn size={20} weight="duotone" />
                  ) : (
                    <UserPlus size={20} weight="duotone" />
                  )}
                  <span>
                    {isLogin ? "Sign In to Dashboard" : "Create Account"}
                  </span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-600 dark:text-gray-400 text-sm mt-6">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
            className="text-gray-900 dark:text-white hover:underline font-semibold"
          >
            {isLogin ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
