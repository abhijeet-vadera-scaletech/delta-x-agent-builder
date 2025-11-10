import {
  Bell,
  MagnifyingGlass,
  User as UserIcon,
  SignOut,
  Gear,
  Sun,
  Moon,
} from "phosphor-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { showToast } from "../utils/toast";
import { getGradientDiagonal, getContrastTextColor } from "../config/theme";

export default function TopBar() {
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="px-6 py-4 flex items-center justify-between">
      {/* Left Section */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <MagnifyingGlass
            size={18}
            weight="duotone"
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
          />
          <input
            type="text"
            placeholder="Search agents, documents..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4 ml-6">
        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors group"
          title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
          {theme === "light" ? (
            <Moon
              size={20}
              weight="duotone"
              className="text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
            />
          ) : (
            <Sun
              size={20}
              weight="duotone"
              className="text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
            />
          )}
        </button>

        {/* Notifications */}
        <button className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors group">
          <Bell
            size={20}
            weight="duotone"
            className="text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
          />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />

        {/* User Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
              style={{
                backgroundImage: getGradientDiagonal(theme, "primary"),
                color: getContrastTextColor(theme),
              }}
            >
              {currentUser?.name.charAt(0).toUpperCase()}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {currentUser?.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Consultant
              </p>
            </div>
          </button>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-[100]"
            >
              {/* User Info */}
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {currentUser?.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {currentUser?.email}
                </p>
              </div>

              {/* Menu Items */}
              <button
                onClick={() => {
                  navigate("/profile");
                  setShowUserMenu(false);
                }}
                className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
              >
                <UserIcon size={16} weight="duotone" />
                Profile
              </button>
              <button
                onClick={() => {
                  navigate("/settings");
                  setShowUserMenu(false);
                }}
                className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
              >
                <Gear size={16} weight="duotone" />
                Settings
              </button>

              <hr className="my-1 border-gray-200 dark:border-gray-700" />

              <button
                onClick={() => {
                  logout();
                  showToast.success("Logged out successfully! 👋");
                  navigate("/auth");
                }}
                className="w-full px-4 py-2.5 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors"
              >
                <SignOut size={16} weight="duotone" />
                Logout
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
