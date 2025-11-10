import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  House,
  Lightning,
  BookOpen,
  Wrench,
  Palette,
  ChartBar,
  List,
  X,
  SignOut,
  CaretRight,
  Rocket,
  Briefcase,
  Robot,
} from "phosphor-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { getGradientDiagonal, getContrastTextColor } from "../config/theme";

// MenuItem Component
function MenuItem({
  item,
  isActive,
  theme,
}: {
  item: any;
  isActive: boolean;
  theme: "light" | "dark";
}) {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = item.icon;

  return (
    <Link
      to={item.path}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group relative ${
        isActive
          ? "bg-gray-100 dark:bg-gray-700"
          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
      }`}
      style={
        isActive
          ? {
              backgroundImage: `linear-gradient(to right, ${
                theme === "light"
                  ? "rgba(0,0,0,0.05)"
                  : "rgba(255,255,255,0.05)"
              }, transparent)`,
            }
          : {}
      }
    >
      <motion.div
        animate={
          isHovered ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }
        }
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <Icon
          size={20}
          weight="duotone"
          className={
            isActive
              ? "text-gray-900 dark:text-white"
              : "text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300"
          }
        />
      </motion.div>
      <span
        className={`font-medium text-sm ${
          isActive
            ? "text-gray-900 dark:text-white"
            : "text-gray-700 dark:text-gray-300"
        }`}
      >
        {item.label}
      </span>
      {isActive && (
        <motion.div
          layoutId="activeIndicator"
          className="ml-auto"
          initial={{ x: -10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <CaretRight
            size={18}
            weight="bold"
            className="text-gray-900 dark:text-white"
          />
        </motion.div>
      )}
    </Link>
  );
}

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const { theme } = useTheme();
  const location = useLocation();

  const menuItems = [
    {
      label: "Overview",
      icon: House,
      path: "/dashboard",
    },
    {
      label: "Agents",
      icon: Lightning,
      path: "/agents",
      children: [
        {
          label: "Agent Builder",
          icon: Wrench,
          path: "/agent-space",
        },
      ],
    },
    {
      label: "Knowledge Base",
      icon: BookOpen,
      path: "/knowledge-base",
    },
    {
      label: "Services",
      icon: Briefcase,
      path: "/services",
    },
    {
      label: "Personalization",
      icon: Palette,
      path: "/personalization",
    },
    {
      label: "Test & Deploy",
      icon: Rocket,
      path: "/test-deploy",
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2  text-gray-900 dark:text-white rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 transition-colors"
      >
        {isOpen ? (
          <X size={24} weight="duotone" />
        ) : (
          <List size={24} weight="duotone" />
        )}
      </button>

      {/* Sidebar */}
      <div className="h-full flex flex-col overflow-y-auto">
        {/* Logo Section */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <motion.div
              className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg"
              style={{
                backgroundImage: getGradientDiagonal(theme, "primary"),
                color: getContrastTextColor(theme),
              }}
              whileHover={{ scale: 1.05, rotate: 360 }}
              transition={{ type: "spring", stiffness: 50, damping: 10 }}
            >
              <Robot />
            </motion.div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                DeltaX
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Agent Builder
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {/* <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2 mb-3">
            Main
          </p> */}
          {menuItems.map((item) => (
            <MenuItem
              key={item.path}
              item={item}
              isActive={
                isActive(item.path) ||
                (item.children?.some((child) => isActive(child.path)) ?? false)
              }
              theme={theme}
            />
          ))}
        </nav>

        {/* Divider */}
        {/* <div className="mx-4 my-4 border-t border-gray-100 dark:border-gray-700" /> */}

        {/* Bottom Section */}
        {/* <div className="p-4 space-y-1">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2 mb-3">
            Tools
          </p>
          <AnalyticsLink isActive={isActive("/analytics")} theme={theme} />
        </div> */}
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

// Analytics Link Component
export function AnalyticsLink({
  isActive,
  theme,
}: {
  isActive: boolean;
  theme: "light" | "dark";
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      <Link
        to="/analytics"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${
          isActive
            ? "bg-gray-100 dark:bg-gray-700"
            : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
        }`}
        style={
          isActive
            ? {
                backgroundImage: `linear-gradient(to right, ${
                  theme === "light"
                    ? "rgba(0,0,0,0.05)"
                    : "rgba(255,255,255,0.05)"
                }, transparent)`,
              }
            : {}
        }
      >
        <motion.div
          animate={
            isHovered ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }
          }
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <ChartBar
            size={20}
            weight="duotone"
            className={
              isActive
                ? "text-gray-900 dark:text-white"
                : "text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300"
            }
          />
        </motion.div>
        <span
          className={`font-medium text-sm ${
            isActive
              ? "text-gray-900 dark:text-white"
              : "text-gray-700 dark:text-gray-300"
          }`}
        >
          Analytics
        </span>
        {isActive && (
          <motion.div
            layoutId="activeIndicator"
            className="ml-auto"
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <CaretRight
              size={18}
              weight="bold"
              className="text-gray-900 dark:text-white"
            />
          </motion.div>
        )}
      </Link>

      <LogoutButton />
    </>
  );
}

// Logout Button Component
function LogoutButton() {
  const { logout } = useAuth();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => {
        logout();
        window.location.href = "/auth";
      }}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all group"
    >
      <motion.div
        animate={isHovered ? { x: 3 } : { x: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <SignOut
          size={20}
          weight="duotone"
          className="text-gray-400 dark:text-gray-500 group-hover:text-red-600 dark:group-hover:text-red-400"
        />
      </motion.div>
      <span className="font-medium text-sm">Logout</span>
    </button>
  );
}
