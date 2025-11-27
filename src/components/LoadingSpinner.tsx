import { motion } from "framer-motion";
import { Brain } from "@phosphor-icons/react";
import { useTheme } from "../context/ThemeContext";
import { getGradient } from "../config/theme";

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function LoadingSpinner({
  message = "Loading...",
  fullScreen = false,
  size = "md",
}: LoadingSpinnerProps) {
  const { theme } = useTheme();

  const containerClass = fullScreen
    ? "fixed inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 z-50"
    : "flex items-center justify-center p-12";

  const bubbleSize = size === "sm" ? 30 : size === "md" ? 70 : 110;
  const iconSize = size === "sm" ? 22 : size === "md" ? 38 : 54;

  return (
    <div className={containerClass}>
      <div className="text-center">
        {/* Floating Gradient Bubbles Loader */}
        <div className="relative flex items-center justify-center mb-8">
          {/* Animated Gradient Bubbles */}
          {[0, 1, 2].map((index) => (
            <motion.div
              key={`bubble-${index}`}
              className="absolute rounded-full blur-2xl"
              style={{
                width: bubbleSize,
                height: bubbleSize,
              }}
              animate={{
                x: [
                  0,
                  Math.cos((index * 2 * Math.PI) / 3) * 40,
                  Math.cos((index * 2 * Math.PI) / 3 + Math.PI) * 40,
                  0,
                ],
                y: [
                  0,
                  Math.sin((index * 2 * Math.PI) / 3) * 40,
                  Math.sin((index * 2 * Math.PI) / 3 + Math.PI) * 40,
                  0,
                ],
                scale: [1, 1.2, 0.8, 1],
                opacity: [0.4, 0.8, 0.4, 0.4],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.4,
              }}
            >
              <div
                className={`w-full h-full rounded-full ${
                  index === 0
                    ? "bg-gradient-to-br from-blue-400 to-blue-600"
                    : index === 1
                    ? "bg-gradient-to-br from-purple-400 to-purple-600"
                    : "bg-gradient-to-br from-cyan-400 to-cyan-600"
                }`}
              />
            </motion.div>
          ))}

          {/* Central Glass Card with Brain Icon */}
          <motion.div
            className="relative z-10"
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <motion.div
              className="relative rounded-3xl bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border-2 border-white/40 dark:border-gray-700/40 shadow-2xl p-6"
              style={{
                width: bubbleSize * 1.2,
                height: bubbleSize * 1.2,
              }}
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {/* Inner glow */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/50 to-transparent dark:from-white/10 pointer-events-none" />

              {/* Brain Icon */}
              <div className="relative flex items-center justify-center h-full">
                <motion.div
                  animate={{
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  style={{
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  <Brain size={iconSize} weight="duotone" />
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Loading Text */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-2"
        >
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {message}
          </p>
          <motion.p
            className="text-sm text-gray-600 dark:text-gray-400"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            AI is thinking...
          </motion.p>
        </motion.div>

        {/* Smooth Progress Bar */}
        <motion.div
          className="mt-6 w-64 h-1 bg-gray-200/50 dark:bg-gray-700/50 rounded-full overflow-hidden backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div
            className="h-full rounded-full"
            animate={{
              x: ["-100%", "200%"],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              width: "50%",
              background: getGradient(theme, "primary"),
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}

// Compact inline loader for buttons and small spaces
export function InlineLoader({ size = 16 }: { size?: number }) {
  return (
    <motion.div
      className="inline-flex items-center justify-center"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    >
      <Brain size={size} weight="duotone" className="text-current" />
    </motion.div>
  );
}

// Skeleton loader for content
export function SkeletonLoader({ className = "" }: { className?: string }) {
  return (
    <motion.div
      className={`bg-gray-200 dark:bg-gray-700 rounded-lg ${className}`}
      animate={{
        opacity: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}
