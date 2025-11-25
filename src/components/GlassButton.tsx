import { ReactNode, ButtonHTMLAttributes } from "react";
import { cn } from "../lib/utils";
import { useTheme } from "../context/ThemeContext";
import { getGradient } from "../config/theme";

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  className?: string;
  variant?:
    | "default"
    | "primary"
    | "secondary"
    | "accent1"
    | "accent2"
    | "danger"
    | "gradient";
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
        // Base styles
        "relative rounded-xl px-4 py-2.5 shadow-xl shadow-gray-300/30 dark:shadow-black/40 transition-all duration-300",
        // Glass effect styles (non-gradient buttons)
        !isGradientButton && [
          "border-2 border-gray-200/80 dark:border-gray-700/80",
          "ring-1 ring-white/40 dark:ring-white/10",
          "bg-white/90 dark:bg-gray-800/90",
          "backdrop-blur-xl backdrop-saturate-150",
        ],
        // Gradient button styles
        isGradientButton && "text-white dark:text-gray-900 font-semibold",
        // Hover effects (enabled state)
        !disabled && [
          "hover:shadow-2xl hover:shadow-gray-600/40 dark:hover:shadow-black/80",
          !isGradientButton &&
            "hover:border-gray-300/80 dark:hover:border-gray-600/80",
        ],
        // Disabled state
        disabled && "opacity-50 cursor-not-allowed",
        // Variant styles
        variantStyles[variant],
        className
      )}
      style={gradientBg ? { backgroundImage: gradientBg } : undefined}
      {...props}
    >
      {/* Content */}
      <div className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </div>
    </button>
  );
}
