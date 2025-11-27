import { motion } from "framer-motion";
import { WarningCircle, ArrowsClockwise } from "@phosphor-icons/react";
import { GlassCard } from "./GlassCard";
import { GlassButton } from "./GlassButton";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  loading?: boolean;
  fullScreen?: boolean;
}

export default function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
  loading = false,
  fullScreen = false,
}: ErrorStateProps) {
  const containerClass = fullScreen
    ? "fixed inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 z-50"
    : "flex items-center justify-center min-h-[calc(100vh-148px)] p-6";

  return (
    <div className={containerClass}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <GlassCard className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="mb-6"
          >
            <div className="w-20 h-20 mx-auto rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center">
              <WarningCircle
                size={48}
                weight="duotone"
                className="text-red-600 dark:text-red-400"
              />
            </div>
          </motion.div>

          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            {title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            {message}
          </p>

          {onRetry && (
            <GlassButton
              onClick={onRetry}
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl shadow-lg transition-all"
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <ArrowsClockwise size={18} weight="bold" />
                </motion.div>
              ) : (
                <ArrowsClockwise size={18} weight="bold" />
              )}
              Try Again
            </GlassButton>
          )}
        </GlassCard>
      </motion.div>
    </div>
  );
}
