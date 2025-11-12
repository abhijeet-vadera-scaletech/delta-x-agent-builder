import { motion } from "framer-motion";
import { Lock, Bell, Trash, FloppyDisk, UserCircle, Palette } from "phosphor-react";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { showToast } from "../utils/toast";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { getGradient } from "../config/theme";
import { GlassCard } from "../components/GlassCard";
import { GlassButton } from "../components/GlassButton";

export default function Settings() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const gradientBg = getGradient(theme, "primary");

  const [activeTab, setActiveTab] = useState<
    "account" | "notifications" | "security" | "personalization"
  >("account");
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast.error("Passwords do not match");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      showToast.error("Password must be at least 6 characters");
      return;
    }
    // Update password in localStorage
    const passwords = JSON.parse(
      localStorage.getItem("coachAi_passwords") || "{}"
    );
    passwords[currentUser?.email || ""] = passwordData.newPassword;
    localStorage.setItem("coachAi_passwords", JSON.stringify(passwords));

    showToast.success("Password changed successfully! 🔒");
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleDeleteAccount = () => {
    if (
      window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      // Remove user from localStorage
      const users = JSON.parse(localStorage.getItem("coachAi_users") || "[]");
      const filteredUsers = users.filter(
        (u: { id: string }) => u.id !== currentUser?.id
      );
      localStorage.setItem("coachAi_users", JSON.stringify(filteredUsers));

      // Remove passwords
      const passwords = JSON.parse(
        localStorage.getItem("coachAi_passwords") || "{}"
      );
      delete passwords[currentUser?.email || ""];
      localStorage.setItem("coachAi_passwords", JSON.stringify(passwords));

      logout();
      showToast.success("Account deleted successfully");
      navigate("/auth");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1
          className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r"
          style={{ backgroundImage: gradientBg }}
        >
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage your account settings and preferences
        </p>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex gap-3 flex-wrap"
      >
        {(["account", "notifications", "security", "personalization"] as const).map((tab) => (
          <motion.button
            key={tab}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl font-semibold transition-all ${
              activeTab === tab
                ? "text-white dark:text-gray-900 shadow-lg"
                : "bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500"
            }`}
            style={
              activeTab === tab ? { backgroundImage: gradientBg } : undefined
            }
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </motion.button>
        ))}
      </motion.div>

      {/* Account Tab */}
      {activeTab === "account" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-6"
        >
          <GlassCard>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <UserCircle size={24} weight="duotone" />
              Account Information
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Email
                </p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {currentUser?.email}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Account ID
                </p>
                <p className="font-mono text-sm text-gray-900 dark:text-white">
                  {currentUser?.id}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Member Since
                </p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {new Date(currentUser?.createdAt || "").toLocaleDateString()}
                </p>
              </div>
            </div>
          </GlassCard>

          {/* Danger Zone */}
          <GlassCard className="border-2 border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10">
            <h3 className="text-lg font-bold text-red-900 dark:text-red-400 mb-2 flex items-center gap-2">
              <Trash size={24} weight="duotone" />
              Danger Zone
            </h3>
            <p className="text-sm text-red-700 dark:text-red-400 mb-4">
              Once you delete your account, there is no going back. Please be
              certain.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDeleteAccount}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors shadow-lg"
            >
              Delete Account
            </motion.button>
          </GlassCard>
        </motion.div>
      )}

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <GlassCard>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Bell size={24} weight="duotone" />
              Notification Preferences
            </h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl cursor-pointer transition-colors border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-800">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    Email Notifications
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Receive email updates about your agents
                  </p>
                </div>
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded accent-blue-600"
                  defaultChecked
                />
              </label>
              <label className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl cursor-pointer transition-colors border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-800">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    High Intent Alerts
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Get notified when high-intent users interact
                  </p>
                </div>
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded accent-blue-600"
                  defaultChecked
                />
              </label>
              <label className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl cursor-pointer transition-colors border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-800">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    Weekly Reports
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Receive weekly analytics summaries
                  </p>
                </div>
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded accent-blue-600"
                />
              </label>
            </div>
            <div className="flex justify-end mt-6">
              <GlassButton
                onClick={() => showToast.success("Preferences saved! ✅")}
                className="flex items-center gap-2"
              >
                <FloppyDisk size={20} weight="duotone" />
                Save Preferences
              </GlassButton>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <GlassCard>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Lock size={24} weight="duotone" />
              Change Password
            </h3>
            <form onSubmit={handleChangePassword} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all"
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  At least 6 characters
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all"
                  required
                />
              </div>
              <div className="flex justify-end pt-2">
                <GlassButton type="submit" className="flex items-center gap-2">
                  <Lock size={20} weight="duotone" />
                  Update Password
                </GlassButton>
              </div>
            </form>
          </GlassCard>
        </motion.div>
      )}

      {/* Personalization Tab */}
      {activeTab === "personalization" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <GlassCard>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Palette size={24} weight="duotone" />
              Chat Personalizations
            </h3>
            <div className="text-center py-8">
              <Palette
                size={48}
                weight="duotone"
                className="mx-auto text-gray-400 dark:text-gray-600 mb-4"
              />
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Personalization Management
              </h4>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Create and manage chat personalizations for your agents
              </p>
              <GlassButton
                onClick={() => navigate("/personalization")}
                className="flex items-center gap-2 mx-auto"
                variant="gradient"
              >
                <Palette size={20} weight="duotone" />
                Manage Personalizations
              </GlassButton>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </div>
  );
}
