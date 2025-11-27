import { motion } from "framer-motion";
import {
  ChartBar,
  Clock,
  Lightning,
  Robot,
  Sparkle,
  Star,
  Target,
  TrendUp,
  Users,
} from "@phosphor-icons/react";
import { useState } from "react";
import ErrorState from "../components/ErrorState";
import { GlassCard, StatCard } from "../components/GlassCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { Modal } from "../components/Modal";
import { getGradient } from "../config/theme";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  useGetAgents,
  useGetAgentStats,
  useGetCompleteAnalytics,
} from "../hooks";
import type { Agent, IntentLevel } from "../types";

export default function Dashboard() {
  const { currentUser } = useAuth();
  const { theme } = useTheme();
  const gradientBg = getGradient(theme, "primary");
  const { data } = useGetAgents();
  const { data: agentStats } = useGetAgentStats();
  const [intentFilter, setIntentFilter] = useState<IntentLevel>("all");
  const [showSessionsModal, setShowSessionsModal] = useState(false);

  const agents = data?.items || [];
  // Fetch complete analytics data
  const {
    data: analytics,
    isLoading,
    error,
    refetch,
  } = useGetCompleteAnalytics({ intentLevel: intentFilter });
  // Extract data from analytics
  const stats = analytics?.stats || {
    totalSessions: 0,
    uniqueUsers: 0,
    avgIntentScore: 0,
    highIntentUsers: 0,
  };

  const recentSessions = analytics?.recentSessions || [];
  const highIntentUsers = analytics?.highIntentUsers || [];
  const aiInsights = analytics?.aiInsights || [];

  // User agents for display
  const userAgents = agents.filter((a: Agent) => a.userId === currentUser?.id);

  const getIntentColor = (score: number) => {
    if (score >= 70) {
      return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300";
    } else if (score >= 40) {
      return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300";
    } else {
      return "bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300";
    }
  };

  const getIntentLabel = (score: number) => {
    if (score >= 70) return "High";
    if (score >= 40) return "Medium";
    return "Low";
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "engagement":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300";
      case "conversion":
        return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300";
      case "performance":
        return "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300";
      case "recommendation":
        return "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300";
      default:
        return "bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300";
    }
  };

  // Show loading state
  // if (isLoading) {
  //   return (
  //     <div className="flex justify-center items-center min-h-[calc(100vh-148px)] overflow-hidden">
  //       <LoadingSpinner message="Loading analytics..." />
  //     </div>
  //   );
  // }

  // Show error state
  if (error) {
    return (
      <ErrorState
        message="Failed to load analytics data"
        onRetry={refetch}
        loading={isLoading}
      />
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
              {!isLoading && (
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
                        <p className="text-2xl font-bold">
                          {userAgents.length}
                        </p>
                        <p className="text-xs opacity-75">AI Agents</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Intent Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <GlassCard className="flex justify-between items-center">
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
                className={`px-4 py-2 rounded-xl font-semibold transition-all border-2 ${
                  intentFilter === level
                    ? "text-white dark:text-gray-900 shadow-lg"
                    : "bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm  border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500"
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
              </motion.button>
            ))}
          </div>
        </GlassCard>
      </motion.div>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[calc(100vh-472px)] overflow-hidden">
          <LoadingSpinner message="Loading analytics..." />
        </div>
      ) : (
        <>
          {/* Analytics Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <StatCard
              label="Total Sessions"
              value={stats.totalSessions}
              icon={<ChartBar size={28} weight="duotone" />}
              gradient="from-blue-500 to-cyan-500"
              onClick={() => setShowSessionsModal(true)}
            />
            <StatCard
              label="Unique Users"
              value={stats.uniqueUsers}
              icon={<Users size={28} weight="duotone" />}
              gradient="from-purple-500 to-pink-500"
            />
            <StatCard
              label="Avg Intent Score"
              value={`${stats.avgIntentScore}%`}
              icon={<TrendUp size={28} weight="duotone" />}
              gradient="from-emerald-500 to-teal-500"
            />
            <StatCard
              label="High Intent Users"
              value={stats.highIntentUsers}
              icon={<Star size={28} weight="duotone" />}
              gradient="from-orange-500 to-red-500"
            />
          </motion.div>

          {/* Agent Stats Grid */}
          {agentStats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              <StatCard
                label="Total Agents"
                value={agentStats.totalAgents}
                icon={<Robot size={28} weight="duotone" />}
                gradient="from-indigo-500 to-blue-500"
              />
              <StatCard
                label="Active Agents"
                value={agentStats.activeAgents}
                icon={<Lightning size={28} weight="duotone" />}
                gradient="from-emerald-500 to-green-500"
              />
              <StatCard
                label="Inactive Agents"
                value={agentStats.inactiveAgents}
                icon={<Clock size={28} weight="duotone" />}
                gradient="from-gray-400 to-gray-500"
              />
              <StatCard
                label="With File Search"
                value={agentStats.withFileSearch}
                icon={<Target size={28} weight="duotone" />}
                gradient="from-cyan-500 to-teal-500"
              />
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* AI Insights Section */}
            {aiInsights.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <GlassCard>
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="p-2 rounded-lg"
                      style={{ backgroundImage: getGradient(theme, "accent1") }}
                    >
                      <Sparkle
                        size={20}
                        weight="duotone"
                        className="text-white"
                      />
                    </div>
                    <h2
                      className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r"
                      style={{ backgroundImage: getGradient(theme, "accent1") }}
                    >
                      AI Insights
                    </h2>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    AI-powered recommendations based on your analytics data
                  </p>

                  <div>
                    {aiInsights.map((insight, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl"
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className={`px-2 py-1 text-xs font-bold rounded-full ${getCategoryColor(
                              insight.category
                            )}`}
                          >
                            {insight.category.charAt(0).toUpperCase() +
                              insight.category.slice(1)}
                          </span>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900 dark:text-white font-medium">
                              {insight.insight}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                                <div
                                  className="h-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                                  style={{ width: `${insight.confidence}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {insight.confidence}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>
            )}
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
                  {highIntentUsers.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      No high intent users yet
                    </p>
                  ) : (
                    highIntentUsers.map((user) => (
                      <motion.div
                        key={user.userId}
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
                                {user.userName}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                  Sessions: {user.sessionCount}
                                </p>
                                <span className="text-gray-400">•</span>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                  Score: {user.avgIntentScore}%
                                </p>
                                <span className="text-gray-400">•</span>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                  {new Date(
                                    user.lastInteraction
                                  ).toLocaleDateString()}
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
                            {user.avgIntentScore}% Intent
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </GlassCard>
            </motion.div>
          </div>

          {/* Recent Sessions Modal */}
          <Modal
            isOpen={showSessionsModal}
            onClose={() => setShowSessionsModal(false)}
            title="Recent Sessions"
            maxWidth="3xl"
          >
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {recentSessions.length === 0 ? (
                <div className="text-center py-12">
                  <Clock
                    size={64}
                    weight="duotone"
                    className="mx-auto text-gray-400 dark:text-gray-600 mb-4"
                  />
                  <p className="text-gray-500 dark:text-gray-400 text-lg">
                    No sessions yet
                  </p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                    Sessions will appear here once users interact with your
                    agents
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentSessions.map((session) => {
                    const agent = userAgents.find(
                      (a) => a.id === session.agentId
                    );
                    return (
                      <motion.div
                        key={session.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.01, x: 5 }}
                        className="p-4 bg-gray-50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700 rounded-xl backdrop-blur-sm transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div
                                className="p-1.5 rounded-lg"
                                style={{
                                  backgroundImage: getGradient(
                                    theme,
                                    "primary"
                                  ),
                                }}
                              >
                                <Robot
                                  size={16}
                                  weight="duotone"
                                  className="text-white dark:text-gray-900"
                                />
                              </div>
                              <p className="font-bold text-gray-900 dark:text-white">
                                {agent?.name || "Unknown Agent"}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                              <Users size={14} weight="duotone" />
                              <span>User_{session.userId.slice(0, 8)}</span>
                              <span className="text-gray-400">•</span>
                              <Clock size={14} weight="duotone" />
                              <span>
                                {new Date(session.createdAt).toLocaleString()}
                              </span>
                              <span className="text-gray-400">•</span>
                              <ChartBar size={14} weight="duotone" />
                              <span>{session.messageCount} messages</span>
                            </div>
                          </div>
                          <span
                            className={`px-3 py-1 text-xs font-bold rounded-full whitespace-nowrap ml-4 ${getIntentColor(
                              session.intentScore
                            )}`}
                          >
                            {getIntentLabel(session.intentScore)} (
                            {session.intentScore}
                            %)
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </Modal>
        </>
      )}
    </div>
  );
}
