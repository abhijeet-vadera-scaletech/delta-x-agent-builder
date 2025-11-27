import { motion } from "framer-motion";
import {
  Buildings,
  EnvelopeSimple,
  File,
  FloppyDisk,
  UserCircle,
  Camera,
} from "@phosphor-icons/react";
import { useState, useEffect } from "react";
import ErrorState from "../components/ErrorState";
import { GlassButton } from "../components/GlassButton";
import { GlassCard } from "../components/GlassCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { getGradient } from "../config/theme";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  useGetProfile,
  useUpdateProfile,
  useUploadProfileImage,
} from "../hooks";
import { showToast } from "../utils/toast";

export default function Profile() {
  const { currentUser } = useAuth();
  const { theme } = useTheme();
  const gradientBg = getGradient(theme, "primary");

  // API hooks
  const { data: profile, isLoading, error, refetch } = useGetProfile();
  const updateProfileMutation = useUpdateProfile();
  const uploadImageMutation = useUploadProfileImage();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    profileImage: "",
    email: "",
    company: "",
    bio: "",
  });

  // State for image upload loading
  const [isImageUploading, setIsImageUploading] = useState(false);

  // Update form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || "",
        profileImage: profile.profileImage || "",
        lastName: profile.lastName || "",
        email: profile.email || "",
        company: profile.company || "",
        bio: profile.bio || "",
      });
    }
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updateData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      company: formData.company,
      bio: formData.bio,
    };

    updateProfileMutation.mutate(updateData, {
      onSuccess: () => {
        showToast.success("Profile updated successfully! ✅");
      },
      onError: () => {
        showToast.error("Failed to update profile");
      },
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Start loading immediately
      setIsImageUploading(true);

      uploadImageMutation.mutate(
        { image: file },
        {
          onSuccess: (res: any) => {
            showToast.success("Profile image uploaded successfully! 📸");
            setFormData({
              ...formData,
              profileImage: res.data.imageUrl,
            });
            setIsImageUploading(false);
          },
          onError: () => {
            showToast.error("Failed to upload image");
            setIsImageUploading(false);
          },
        }
      );
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-148px)] overflow-hidden">
        <LoadingSpinner message="Loading profile..." />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <ErrorState
        message="Failed to load profile data"
        onRetry={refetch}
        loading={isLoading}
      />
    );
  }

  const displayUser = profile || currentUser;

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
            <div className="relative">
              {/* Display profile image, loading state, or initials */}
              {isImageUploading || updateProfileMutation.isPending ? (
                <div className="w-24 h-24 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 shadow-lg">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-gray-800 dark:border-t-gray-100 dark:border-gray-800"></div>
                </div>
              ) : formData.profileImage ? (
                <img
                  src={formData.profileImage}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover shadow-lg"
                />
              ) : (
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center text-white dark:text-gray-900 font-bold text-4xl shadow-lg"
                  style={{
                    background: gradientBg,
                  }}
                >
                  {displayUser?.firstName?.charAt(0).toUpperCase() ||
                    displayUser?.email?.charAt(0).toUpperCase()}
                </div>
              )}
              <label
                htmlFor="profile-image"
                className={`absolute bottom-0 right-0 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg transition-colors ${
                  isImageUploading
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <Camera
                  size={16}
                  className="text-gray-600 dark:text-gray-400"
                />
                <input
                  id="profile-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isImageUploading}
                  className="hidden"
                />
              </label>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {displayUser?.firstName} {displayUser?.lastName}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {displayUser?.email}
              </p>
              {displayUser?.company && (
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                  {displayUser.company}
                </p>
              )}
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                Member since{" "}
                {new Date(displayUser?.createdAt || "").toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <UserCircle size={18} weight="duotone" />
                  First Name
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <UserCircle size={18} weight="duotone" />
                  Last Name
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <EnvelopeSimple size={18} weight="duotone" />
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-700 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Email cannot be changed
                </p>
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
              <GlassButton
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="flex items-center gap-2"
              >
                <FloppyDisk size={20} weight="duotone" />
                {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
              </GlassButton>
            </div>
          </form>
        </GlassCard>
      </motion.div>
    </div>
  );
}
