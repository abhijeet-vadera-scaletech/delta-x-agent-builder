import { motion } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "../lib/utils";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  noPadding?: boolean;
  onClick?: () => void;
  glassBodyClassName?: string;
}

export function GlassCard({
  children,
  className,
  hover = true,
  noPadding = false,
  onClick,
  glassBodyClassName,
}: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      className={cn(
        "relative rounded-2xl",
        // Enhanced borders for better distinction
        "border-2 border-gray-200/80 dark:border-gray-700/80",
        "ring-1 ring-white/40 dark:ring-white/10",
        // Glass effect
        "bg-white/90 dark:bg-gray-800/90",
        "backdrop-blur-xl backdrop-saturate-150",
        // Enhanced shadows for depth
        "shadow-xl shadow-gray-300/30 dark:shadow-black/40",
        // Hover effects
        hover &&
          "transition-all duration-300 hover:shadow-2xl hover:shadow-gray-400/40 dark:hover:shadow-black/60 hover:-translate-y-1 hover:border-gray-300/80 dark:hover:border-gray-600/80",
        !noPadding && "p-6",
        className
      )}
    >
      {/* Inner glow effect - enhanced */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/50 to-transparent dark:from-white/10 dark:to-transparent pointer-events-none"></div>

      {/* Subtle top highlight */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/60 dark:via-white/20 to-transparent pointer-events-none"></div>

      {/* Content */}
      <div className={`relative z-10 ${glassBodyClassName || ""}`}>
        {children}
      </div>
    </motion.div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  gradient?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  onClick?: () => void;
}

export function StatCard({
  label,
  value,
  icon,
  gradient = "from-blue-500 to-cyan-500",
  trend,
  onClick,
}: StatCardProps) {
  const isClickable = !!onClick;

  return (
    <motion.div
      whileHover={isClickable ? { scale: 1.02, y: -5 } : {}}
      transition={{ type: "spring", stiffness: 300 }}
      onClick={onClick}
      className={isClickable ? "cursor-pointer" : "cursor-default"}
    >
      <GlassCard hover={isClickable} className="overflow-hidden">
        {/* Gradient Background */}
        <div
          className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-10 blur-2xl rounded-full -mr-16 -mt-16`}
        ></div>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              {label}
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold bg-gradient-to-br bg-clip-text text-transparent from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
                {value}
              </p>
              {trend && (
                <span
                  className={cn(
                    "text-xs font-semibold px-2 py-0.5 rounded-full",
                    trend.isPositive
                      ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                      : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                  )}
                >
                  {trend.isPositive ? "+" : ""}
                  {trend.value}%
                </span>
              )}
            </div>
          </div>

          {/* Icon Container */}
          <div
            className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}
          >
            <div className="text-white">{icon}</div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

interface SectionCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function SectionCard({
  title,
  description,
  children,
  action,
  className,
}: SectionCardProps) {
  return (
    <GlassCard className={className} hover={false}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
            {title}
          </h2>
          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>

      {/* Content */}
      <div>{children}</div>
    </GlassCard>
  );
}
