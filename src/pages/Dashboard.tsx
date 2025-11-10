import { motion } from "framer-motion";
import {
  ChartBar,
  Clock,
  Lightning,
  Sparkle,
  Star,
  Target,
  TrendUp,
  Users,
} from "phosphor-react";
import { useEffect, useState } from "react";
import ErrorState from "../components/ErrorState";
import { GlassCard, StatCard } from "../components/GlassCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { getGradient } from "../config/theme";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useGetAgents } from "../hooks";
import type { Agent } from "../types";

interface Session {
  id: string;
  consultantId: string;
  userId: string;
  agentId: string;
  intentLevel: "high" | "medium" | "low";
  duration: number;
  createdAt: string;
}

export default function Dashboard() {
  const { currentUser } = useAuth();
  const { theme } = useTheme();
  const gradientBg = getGradient(theme, "primary");
  const { data: agents = [], isLoading, error, refetch } = useGetAgents();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [intentFilter, setIntentFilter] = useState<
    "all" | "high" | "medium" | "low"
  >("all");

  // Load sessions from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("coachAi_sessions");
    if (stored) {
      const all = JSON.parse(stored);
      const userSessions = all.filter(
        (s: Session) => s.consultantId === currentUser?.id
      );
      setSessions(userSessions);
    }
  }, [currentUser?.id]);

  // Calculate stats
  const userAgents = agents.filter((a: Agent) => a.userId === currentUser?.id);
  const totalSessions = sessions.length;
  const uniqueUsers = new Set(sessions.map((s) => s.userId)).size;
  const highIntentUsers = sessions.filter(
    (s) => s.intentLevel === "high"
  ).length;
  const avgIntentScore =
    sessions.length > 0
      ? Math.round((highIntentUsers / sessions.length) * 100)
      : 0;

  // Filter sessions
  const filteredSessions =
    intentFilter === "all"
      ? sessions
      : sessions.filter((s) => s.intentLevel === intentFilter);

  // Recent sessions
  const recentSessions = filteredSessions
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 10);

  // High intent users
  const highIntentSessions = sessions
    .filter((s) => s.intentLevel === "high")
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  const getIntentColor = (level: string) => {
    switch (level) {
      case "high":
        return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300";
      case "medium":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300";
      case "low":
        return "bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300";
      default:
        return "bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300";
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-148px)] overflow-hidden">
        <LoadingSpinner message="Loading analytics..." />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <ErrorState message="Failed to load analytics data" onRetry={refetch} />
    );
  }

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <GlassCard className="relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute -top-[26px] right-[calc(50%-180px)] w-32 h-32 opacity-5">
            <motion.div
              animate={{
                scale: [1, 1.5, 1],
                x: [-5, 5, -5, 5, -5, 5, 0],
                y: [-5, 5, -5, 5, -5, 5, 0],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
                x: {
                  duration: 0.5,
                  repeat: Infinity,
                  repeatDelay: 3,
                },
                y: {
                  duration: 0.5,
                  repeat: Infinity,
                  repeatDelay: 3,
                },
              }}
            >
              <Lightning size={128} weight="duotone" />
            </motion.div>
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="flex items-center gap-3 mb-2"
                >
                  <div
                    className="p-2 rounded-xl"
                    style={{ backgroundImage: gradientBg }}
                  >
                    <Sparkle
                      size={24}
                      weight="duotone"
                      className="text-white dark:text-gray-900"
                    />
                  </div>
                  <h1
                    className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r"
                    style={{ backgroundImage: gradientBg }}
                  >
                    {getGreeting()}, {currentUser?.name || "User"}!
                  </h1>
                </motion.div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="text-gray-600 dark:text-gray-400 text-lg"
                >
                  Welcome to your Analytics Dashboard. Here's what's happening
                  with your AI agents.
                </motion.p>
              </div>

              {/* Quick Stats Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="hidden md:block"
              >
                <div
                  className="px-6 py-4 rounded-2xl text-white shadow-lg"
                  style={{ backgroundImage: getGradient(theme, "secondary") }}
                >
                  <div className="flex items-center gap-3">
                    <Lightning size={32} weight="duotone" />
                    <div className="flex items-center gap-2">
                      <p className="text-sm opacity-90">Active Today</p>
                      <p className="text-2xl font-bold">{userAgents.length}</p>
                      <p className="text-xs opacity-75">AI Agents</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <motion.div
          whileHover={{ scale: 1.02, y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <StatCard
            label="Total Sessions"
            value={totalSessions}
            icon={<ChartBar size={28} weight="duotone" />}
            gradient="from-blue-500 to-cyan-500"
          />
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.02, y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <StatCard
            label="Unique Users"
            value={uniqueUsers}
            icon={<Users size={28} weight="duotone" />}
            gradient="from-purple-500 to-pink-500"
          />
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.02, y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <StatCard
            label="Avg Intent Score"
            value={`${avgIntentScore}%`}
            icon={<TrendUp size={28} weight="duotone" />}
            gradient="from-emerald-500 to-teal-500"
          />
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.02, y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <StatCard
            label="High Intent Users"
            value={highIntentUsers}
            icon={<Star size={28} weight="duotone" />}
            gradient="from-orange-500 to-red-500"
          />
        </motion.div>
      </motion.div>

      {/* Intent Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <GlassCard>
          <div className="flex items-center gap-3 mb-4">
            <div
              className="p-2 rounded-lg"
              style={{ backgroundImage: gradientBg }}
            >
              <Target
                size={20}
                weight="duotone"
                className="text-white dark:text-gray-900"
              />
            </div>
            <h2
              className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r"
              style={{ backgroundImage: gradientBg }}
            >
              Filter by Intent Level
            </h2>
          </div>
          <div className="flex gap-3 flex-wrap">
            {(["all", "high", "medium", "low"] as const).map((level) => (
              <motion.button
                key={level}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIntentFilter(level)}
                className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                  intentFilter === level
                    ? "text-white dark:text-gray-900 shadow-lg"
                    : "bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500"
                }`}
                style={
                  intentFilter === level
                    ? { backgroundImage: gradientBg }
                    : undefined
                }
              >
                {level === "all"
                  ? "All Users"
                  : `${level.charAt(0).toUpperCase() + level.slice(1)} Intent`}
                {level !== "all" &&
                  ` (${
                    sessions.filter((s) => s.intentLevel === level).length
                  })`}
              </motion.button>
            ))}
          </div>
        </GlassCard>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* High Intent Users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <GlassCard>
            <div className="flex items-center gap-3 mb-2">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundImage: getGradient(theme, "accent2") }}
              >
                <Star size={24} weight="duotone" className="text-white" />
              </div>
              <h2
                className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r"
                style={{ backgroundImage: getGradient(theme, "accent2") }}
              >
                High Intent Users (75%+)
              </h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Users most likely to convert - prioritize follow-up
            </p>

            <div className="space-y-3">
              {highIntentSessions.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No high intent users yet
                </p>
              ) : (
                highIntentSessions.map((session) => (
                  <motion.div
                    key={session.id}
                    whileHover={{ scale: 1.02, x: 5 }}
                    className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-2 border-emerald-200 dark:border-emerald-800 rounded-xl"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div
                          className="p-2 rounded-lg mt-1"
                          style={{
                            backgroundImage: getGradient(theme, "accent1"),
                          }}
                        >
                          <Lightning
                            size={16}
                            weight="duotone"
                            className="text-white"
                          />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">
                            User_{session.userId.slice(0, 8)}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              Sessions:{" "}
                              {
                                sessions.filter(
                                  (s) => s.userId === session.userId
                                ).length
                              }
                            </p>
                            <span className="text-gray-400">•</span>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {new Date(session.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div
                        className="px-3 py-1 text-white text-xs font-bold rounded-full shadow-md"
                        style={{
                          backgroundImage: getGradient(theme, "accent1"),
                        }}
                      >
                        High Intent
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </GlassCard>
        </motion.div>

        {/* Recent Sessions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
        >
          <GlassCard>
            <div className="flex items-center gap-3 mb-2">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundImage: getGradient(theme, "primary") }}
              >
                <Clock
                  size={24}
                  weight="duotone"
                  className="text-white dark:text-gray-900"
                />
              </div>
              <h2
                className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r"
                style={{ backgroundImage: getGradient(theme, "primary") }}
              >
                Recent Sessions
              </h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Latest interactions with your agents
            </p>

            <div className="space-y-3">
              {recentSessions.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No sessions yet
                </p>
              ) : (
                recentSessions.map((session) => {
                  const agent = userAgents.find(
                    (a) => a.id === session.agentId
                  );
                  return (
                    <motion.div
                      key={session.id}
                      whileHover={{ scale: 1.02, x: 5 }}
                      className="p-4 bg-gray-50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700 rounded-xl backdrop-blur-sm"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">
                            {agent?.name || "Unknown Agent"}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              User_{session.userId.slice(0, 8)}
                            </p>
                            <span className="text-gray-400">•</span>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {new Date(session.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 text-xs font-bold rounded-full ${getIntentColor(
                            session.intentLevel
                          )}`}
                        >
                          {session.intentLevel.charAt(0).toUpperCase() +
                            session.intentLevel.slice(1)}
                        </span>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
