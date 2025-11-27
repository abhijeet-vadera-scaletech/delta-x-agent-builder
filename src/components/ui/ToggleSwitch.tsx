type TailwindColor =
  | "slate"
  | "gray"
  | "zinc"
  | "neutral"
  | "stone"
  | "red"
  | "orange"
  | "amber"
  | "yellow"
  | "lime"
  | "green"
  | "emerald"
  | "teal"
  | "cyan"
  | "sky"
  | "blue"
  | "indigo"
  | "violet"
  | "purple"
  | "fuchsia"
  | "pink"
  | "rose"
  | "primary";

interface ToggleSwitchProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  label?: string;
  disabled?: boolean;
  color?: TailwindColor;
}

const colorClasses: Record<
  TailwindColor,
  { bg: string; ring: string; ringDark: string }
> = {
  slate: {
    bg: "peer-checked:bg-slate-600",
    ring: "peer-focus:ring-slate-300",
    ringDark: "dark:peer-focus:ring-slate-800",
  },
  gray: {
    bg: "peer-checked:bg-gray-600",
    ring: "peer-focus:ring-gray-300",
    ringDark: "dark:peer-focus:ring-gray-800",
  },
  zinc: {
    bg: "peer-checked:bg-zinc-600",
    ring: "peer-focus:ring-zinc-300",
    ringDark: "dark:peer-focus:ring-zinc-800",
  },
  neutral: {
    bg: "peer-checked:bg-neutral-600",
    ring: "peer-focus:ring-neutral-300",
    ringDark: "dark:peer-focus:ring-neutral-800",
  },
  stone: {
    bg: "peer-checked:bg-stone-600",
    ring: "peer-focus:ring-stone-300",
    ringDark: "dark:peer-focus:ring-stone-800",
  },
  red: {
    bg: "peer-checked:bg-red-600",
    ring: "peer-focus:ring-red-300",
    ringDark: "dark:peer-focus:ring-red-800",
  },
  orange: {
    bg: "peer-checked:bg-orange-600",
    ring: "peer-focus:ring-orange-300",
    ringDark: "dark:peer-focus:ring-orange-800",
  },
  amber: {
    bg: "peer-checked:bg-amber-600",
    ring: "peer-focus:ring-amber-300",
    ringDark: "dark:peer-focus:ring-amber-800",
  },
  yellow: {
    bg: "peer-checked:bg-yellow-600",
    ring: "peer-focus:ring-yellow-300",
    ringDark: "dark:peer-focus:ring-yellow-800",
  },
  lime: {
    bg: "peer-checked:bg-lime-600",
    ring: "peer-focus:ring-lime-300",
    ringDark: "dark:peer-focus:ring-lime-800",
  },
  green: {
    bg: "peer-checked:bg-green-600",
    ring: "peer-focus:ring-green-300",
    ringDark: "dark:peer-focus:ring-green-800",
  },
  emerald: {
    bg: "peer-checked:bg-emerald-600",
    ring: "peer-focus:ring-emerald-300",
    ringDark: "dark:peer-focus:ring-emerald-800",
  },
  teal: {
    bg: "peer-checked:bg-teal-600",
    ring: "peer-focus:ring-teal-300",
    ringDark: "dark:peer-focus:ring-teal-800",
  },
  cyan: {
    bg: "peer-checked:bg-cyan-600",
    ring: "peer-focus:ring-cyan-300",
    ringDark: "dark:peer-focus:ring-cyan-800",
  },
  sky: {
    bg: "peer-checked:bg-sky-600",
    ring: "peer-focus:ring-sky-300",
    ringDark: "dark:peer-focus:ring-sky-800",
  },
  blue: {
    bg: "peer-checked:bg-blue-600",
    ring: "peer-focus:ring-blue-300",
    ringDark: "dark:peer-focus:ring-blue-800",
  },
  indigo: {
    bg: "peer-checked:bg-indigo-600",
    ring: "peer-focus:ring-indigo-300",
    ringDark: "dark:peer-focus:ring-indigo-800",
  },
  violet: {
    bg: "peer-checked:bg-violet-600",
    ring: "peer-focus:ring-violet-300",
    ringDark: "dark:peer-focus:ring-violet-800",
  },
  purple: {
    bg: "peer-checked:bg-purple-600",
    ring: "peer-focus:ring-purple-300",
    ringDark: "dark:peer-focus:ring-purple-800",
  },
  fuchsia: {
    bg: "peer-checked:bg-fuchsia-600",
    ring: "peer-focus:ring-fuchsia-300",
    ringDark: "dark:peer-focus:ring-fuchsia-800",
  },
  pink: {
    bg: "peer-checked:bg-pink-600",
    ring: "peer-focus:ring-pink-300",
    ringDark: "dark:peer-focus:ring-pink-800",
  },
  rose: {
    bg: "peer-checked:bg-rose-600",
    ring: "peer-focus:ring-rose-300",
    ringDark: "dark:peer-focus:ring-rose-800",
  },
  primary: {
    bg: "peer-checked:bg-primary dark:peer-checked:bg-gray-900",
    ring: "peer-focus:ring-secondary",
    ringDark: "dark:peer-focus:ring-secondary",
  },
};

export const ToggleSwitch = ({
  enabled,
  onChange,
  label,
  disabled = false,
  color = "blue",
}: ToggleSwitchProps) => {
  const colorClass = colorClasses[color];

  return (
    <div className="flex items-center gap-2">
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => !disabled && onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only peer"
        />
        <div
          className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 ${colorClass.ring} ${colorClass.ringDark} rounded-full dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 ${colorClass.bg} peer-disabled:opacity-50 peer-disabled:cursor-not-allowed`}
        ></div>
        {label && (
          <span className="ms-3 text-sm font-medium text-gray-900 dark:text-white">
            {label}
          </span>
        )}
      </label>
    </div>
  );
};
