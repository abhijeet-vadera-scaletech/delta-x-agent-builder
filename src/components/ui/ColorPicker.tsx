import React, { useRef } from "react";
import { Palette } from "@phosphor-icons/react";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label: string;
  className?: string;
}

export function ColorPicker({
  value,
  onChange,
  label,
  className = "",
}: ColorPickerProps) {
  const colorInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    // Trigger the native color picker
    colorInputRef.current?.click();
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={`relative ${className}`}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>

      {/* Color Preview Button */}
      <button
        type="button"
        onClick={handleButtonClick}
        className="w-full h-12 rounded-lg border-2 border-gray-300 dark:border-gray-700 flex items-center gap-3 px-3 hover:border-primary dark:hover:border-white transition-colors"
        style={{ backgroundColor: value }}
      >
        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-md px-2 py-1 border border-gray-700">
          <Palette size={16} className="text-gray-600" />
          <span className="text-sm font-medium text-gray-800">
            {value.toUpperCase()}
          </span>
        </div>
      </button>

      {/* Hidden Native Color Input - positioned near button */}
      <input
        ref={colorInputRef}
        type="color"
        value={value}
        onChange={handleColorChange}
        className="absolute opacity-0 pointer-events-none w-0 h-0"
        style={{ top: "100%", left: 0 }}
      />
    </div>
  );
}
