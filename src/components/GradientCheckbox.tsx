import { useTheme } from "../context/ThemeContext";
import { getGradient } from "../config/theme";

interface GradientCheckboxProps {
  checked: boolean;
  onChange: () => void;
  className?: string;
}

export function GradientCheckbox({
  checked,
  onChange,
  className = "",
}: GradientCheckboxProps) {
  const { theme } = useTheme();
  const gradientBg = getGradient(theme, "primary");

  return (
    <div className={`relative ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only peer"
      />
      <div
        onClick={onChange}
        className={`w-5 h-5 rounded border-2 cursor-pointer transition-all duration-200 flex items-center justify-center ${
          checked
            ? "border-transparent shadow-md"
            : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500"
        }`}
        style={
          checked
            ? {
                backgroundImage: gradientBg,
              }
            : undefined
        }
      >
        {checked && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            fill="white"
            viewBox="0 0 256 256"
            className="animate-in zoom-in duration-200"
          >
            <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"></path>
          </svg>
        )}
      </div>
    </div>
  );
}
