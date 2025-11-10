import { motion } from "framer-motion";
import {
  Buildings,
  EnvelopeSimple,
  File,
  FloppyDisk,
  UserCircle,
} from "phosphor-react";
import { useState } from "react";
import { GlassButton } from "../components/GlassButton";
import { GlassCard } from "../components/GlassCard";
import { getGradient } from "../config/theme";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { showToast } from "../utils/toast";

export default function Profile() {
  const { currentUser } = useAuth();
  const { theme } = useTheme();
  const gradientBg = getGradient(theme, "primary");

  const [formData, setFormData] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    company: currentUser?.company || "",
    bio: currentUser?.bio || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // setCurrentUser(formData);
    showToast.success("Profile updated successfully! ✅");
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
          className="text-3xl max-w-fit font-bold bg-clip-text text-transparent bg-gradient-to-r"
          style={{
            backgroundImage: gradientBg,
          }}
        >
          Profile
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage your account information
        </p>
      </motion.div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <GlassCard>
          {/* Profile Header */}
          <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
            <div
              className="w-24 h-24  rounded-full flex items-center justify-center text-white dark:text-gray-900 font-bold text-4xl shadow-lg"
              style={{
                background: gradientBg,
              }}
            >
              {currentUser?.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {currentUser?.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {currentUser?.email}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                Member since{" "}
                {new Date(currentUser?.createdAt || "").toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <UserCircle size={18} weight="duotone" />
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all"
                  required
                />
              </div>

              <div>
                <label className=" text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <EnvelopeSimple size={18} weight="duotone" />
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <Buildings size={18} weight="duotone" />
                  Company
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) =>
                    setFormData({ ...formData, company: e.target.value })
                  }
                  placeholder="Your company name"
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white mb-2">
                <File size={18} weight="duotone" />
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                placeholder="Tell us about yourself..."
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none transition-all"
              />
            </div>

            <div className="flex justify-end pt-4">
              <GlassButton type="submit" className="flex items-center gap-2">
                <FloppyDisk size={20} weight="duotone" />
                Save Changes
              </GlassButton>
            </div>
          </form>
        </GlassCard>
      </motion.div>
    </div>
  );
}
