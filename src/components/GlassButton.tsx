import { ReactNode, ButtonHTMLAttributes } from "react";
import { cn } from "../lib/utils";
import { useTheme } from "../context/ThemeContext";
import { getGradient } from "../config/theme";

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  className?: string;
  variant?: "default" | "primary" | "secondary" | "accent1" | "accent2" | "danger" | "gradient";
  useGradient?: boolean;
}

export function GlassButton({
  children,
  className,
  variant = "default",
  useGradient = false,
  disabled,
  ...props
}: GlassButtonProps) {
  const { theme } = useTheme();

  const variantStyles = {
    default: "",
    primary:
      "border-blue-300/80 dark:border-blue-600/80 ring-blue-200/40 dark:ring-blue-500/20",
    secondary:
      "border-purple-300/80 dark:border-purple-600/80 ring-purple-200/40 dark:ring-purple-500/20",
    accent1:
      "border-emerald-300/80 dark:border-emerald-600/80 ring-emerald-200/40 dark:ring-emerald-500/20",
    accent2:
      "border-orange-300/80 dark:border-orange-600/80 ring-orange-200/40 dark:ring-orange-500/20",
    danger:
      "border-red-300/80 dark:border-red-600/80 ring-red-200/40 dark:ring-red-500/20",
    gradient: "",
  };

  // Get gradient based on variant
  const getVariantGradient = () => {
    if (variant === "gradient" || useGradient) {
      return getGradient(theme, "primary");
    }
    if (variant === "secondary") {
      return getGradient(theme, "secondary");
    }
    if (variant === "accent1") {
      return getGradient(theme, "accent1");
    }
    if (variant === "accent2") {
      return getGradient(theme, "accent2");
    }
    return null;
  };

  const gradientBg = getVariantGradient();
  const isGradientButton = variant === "gradient" || useGradient;

  return (
    <button
      disabled={disabled}
      className={cn(
        "relative rounded-xl",
        // Enhanced borders for better distinction
        !isGradientButton && "border-2 border-gray-200/80 dark:border-gray-700/80",
        !isGradientButton && "ring-1 ring-white/40 dark:ring-white/10",
        // Glass effect
        !isGradientButton && "bg-white/90 dark:bg-gray-800/90",
        !isGradientButton && "backdrop-blur-xl backdrop-saturate-150",
        // Enhanced shadows for depth
        "shadow-xl shadow-gray-300/30 dark:shadow-black/40",
        // Hover effects
        "transition-all duration-300",
        !disabled &&
          "hover:shadow-2xl hover:shadow-gray-400/40 dark:hover:shadow-black/60 hover:-translate-y-1",
        !disabled && !isGradientButton && "hover:border-gray-300/80 dark:hover:border-gray-600/80",
        // Active state
        !disabled && "active:translate-y-0 active:shadow-lg",
        // Disabled state
        disabled && "opacity-50 cursor-not-allowed",
        // Padding
        "px-4 py-2.5",
        // Text color for gradient buttons
        isGradientButton && "text-white dark:text-gray-900 font-semibold",
        // Variant styles
        variantStyles[variant],
        className
      )}
      style={gradientBg ? { backgroundImage: gradientBg } : undefined}
      {...props}
    >
      {/* Inner glow effect - enhanced */}
      {!isGradientButton && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/50 to-transparent dark:from-white/10 dark:to-transparent pointer-events-none"></div>
      )}

      {/* Subtle top highlight */}
      {!isGradientButton && (
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/60 dark:via-white/20 to-transparent pointer-events-none"></div>
      )}

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </div>
    </button>
  );
}
