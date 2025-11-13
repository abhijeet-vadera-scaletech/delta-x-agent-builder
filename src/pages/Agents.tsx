import { motion } from "framer-motion";
import {
  Lightning,
  ChartLine,
  Robot,
  Plus,
  Trash,
  Eye,
  CopySimple,
  PencilSimple,
  ArrowsClockwise,
  Play,
  Pause,
} from "phosphor-react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { showToast } from "../utils/toast";
import { Toaster } from "react-hot-toast";
import { useGetAgents, useGetAgentStats, useDeleteAgent, useActivateAgent, useDeactivateAgent } from "../hooks";
import { useConfirmation } from "../hooks/useConfirmation";
import type { Agent } from "../types";
import { useTheme } from "../context/ThemeContext";
import { getGradient } from "../config/theme";
import { StatCard, SectionCard, GlassCard } from "../components/GlassCard";
import { GlassButton } from "../components/GlassButton";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorState from "../components/ErrorState";
import ConfirmationModal from "../components/ConfirmationModal";

export default function Agents() {
  const { currentUser } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [pendingAgentId, setPendingAgentId] = useState<string | null>(null);

  // Fetch agents from API
  const { data: agents = [], isLoading, error, refetch } = useGetAgents();
  const { data: agentStats } = useGetAgentStats();
  const deleteAgentMutation = useDeleteAgent();
  const activateAgentMutation = useActivateAgent();
  const deactivateAgentMutation = useDeactivateAgent();
  const { confirmationState, showConfirmation, hideConfirmation } = useConfirmation();

  // Filter agents for current user
  const userAgents = agents.filter((a: Agent) => a.userId === currentUser?.id);

  const handleCopyPublicUrl = (agentId: string) => {
    const url = `${window.location.origin}/agent/${agentId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(agentId);
    showToast.success("URL copied to clipboard! 📋");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteAgent = (agentId: string, agentName: string) => {
    showConfirmation(
      {
        title: "Delete Agent",
        message: `Are you sure you want to delete "${agentName}"? This action cannot be undone.`,
        confirmText: "Delete",
        cancelText: "Cancel",
        variant: "danger",
      },
      async () => {
        await deleteAgentMutation.mutateAsync(agentId);
      }
    );
  };

  const handleActivateAgent = (agentId: string) => {
    setPendingAgentId(agentId);
    activateAgentMutation.mutate(agentId, {
      onSettled: () => setPendingAgentId(null)
    });
  };

  const handleDeactivateAgent = (agentId: string) => {
    setPendingAgentId(agentId);
    deactivateAgentMutation.mutate(agentId, {
      onSettled: () => setPendingAgentId(null)
    });
  };

  // Use API stats if available, fallback to calculated stats
  const statCards = [
    {
      label: "Total Agents",
      value: agentStats?.totalAgents ?? userAgents.length,
      icon: Robot,
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      label: "Active Agents",
      value: agentStats?.activeAgents ?? userAgents.filter((a: Agent) => a.isActive && !a.isDeleted).length,
      icon: Lightning,
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      label: "Inactive Agents",
      value: agentStats?.inactiveAgents ?? userAgents.filter((a: Agent) => !a.isActive && !a.isDeleted).length,
      icon: ChartLine,
      gradient: "from-gray-400 to-gray-500",
    },
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-148px)] overflow-hidden">
        <LoadingSpinner message="Loading agents..." />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <ErrorState
        title="Failed to load agents"
        message={error.message || "Unable to fetch agents. Please try again."}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <>
      <Toaster />
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="text-3xl max-w-fit font-bold bg-clip-text text-transparent bg-gradient-to-r"
              style={{
                backgroundImage: getGradient(theme, "primary"),
              }}
            >
              My Agents
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage and monitor your AI agents
            </p>
          </div>
          <div className="flex gap-3">
            <GlassButton onClick={() => refetch()} disabled={isLoading}>
              <ArrowsClockwise
                size={18}
                weight="bold"
                className={isLoading ? "animate-spin" : ""}
              />
              <span className="text-sm font-medium">Refresh</span>
            </GlassButton>
            <Link
              to="/agent-space"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white dark:text-primary-foreground shadow-lg hover:shadow-xl transition-all"
              style={{
                backgroundImage: getGradient(theme, "primary"),
              }}
            >
              <Plus size={18} weight="bold" /> Create Agent
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <StatCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              icon={<Icon size={24} weight="duotone" />}
              gradient={stat.gradient}
            />
          );
        })}
      </div>

      {/* Agents Section */}
      <SectionCard
        title="Agents List"
        description={`${userAgents.length} total agents`}
        className="overflow-hidden"
      >
        <GlassCard noPadding hover={false} className="overflow-hidden border-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50/50 to-gray-100/50 dark:from-gray-900/50 dark:to-gray-800/50 border-b border-gray-200/50 dark:border-gray-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Agent
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Status
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Created
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/50 dark:divide-gray-700/50">
                {userAgents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Robot
                          size={40}
                          weight="duotone"
                          className="text-gray-300 dark:text-gray-600 mb-3"
                        />
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-1">
                          No agents yet
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mb-3">
                          Create your first AI agent to get started
                        </p>
                        <Link
                          to="/agent-space"
                          className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                        >
                          Create Agent →
                        </Link>
                      </div>
                    </td>
                  </tr>
                ) : (
                  userAgents.map((agent, index) => (
                    <motion.tr
                      key={agent.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="hover:bg-gradient-to-r transition-all duration-200"
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {agent.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                            {agent.description || "No description"}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            agent.isDeleted
                              ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                              : agent.isActive
                              ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {agent.isDeleted ? "Deleted" : agent.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">
                        {new Date(agent.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {!agent.isDeleted && (
                            <>
                              {agent.isActive ? (
                                <button
                                  onClick={() => handleDeactivateAgent(agent.id)}
                                  title="Deactivate agent"
                                  disabled={pendingAgentId === agent.id}
                                  className="p-1.5 hover:bg-orange-50 dark:hover:bg-orange-900/30 rounded-lg transition-colors disabled:opacity-50"
                                >
                                  <Pause
                                    size={16}
                                    weight="duotone"
                                    className="text-orange-600 dark:text-orange-400"
                                  />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleActivateAgent(agent.id)}
                                  title="Activate agent"
                                  disabled={pendingAgentId === agent.id}
                                  className="p-1.5 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors disabled:opacity-50"
                                >
                                  <Play
                                    size={16}
                                    weight="duotone"
                                    className="text-green-600 dark:text-green-400"
                                  />
                                </button>
                              )}
                            </>
                          )}
                          <button
                            onClick={() =>
                              navigate(`/agent-space?edit=${agent.id}`)
                            }
                            title="Edit agent"
                            className="p-1.5 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                          >
                            <PencilSimple
                              size={16}
                              weight="duotone"
                              className="text-purple-600 dark:text-purple-400"
                            />
                          </button>
                          <button
                            onClick={() => handleCopyPublicUrl(agent.id)}
                            title="Copy public URL"
                            className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          >
                            <CopySimple
                              size={16}
                              weight="duotone"
                              className={
                                copiedId === agent.id
                                  ? "text-green-600"
                                  : "text-blue-600 dark:text-blue-400"
                              }
                            />
                          </button>
                          <button
                            onClick={() =>
                              window.open(`/agent/${agent.id}`, "_blank")
                            }
                            title="View public page"
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                          >
                            <Eye
                              size={16}
                              weight="duotone"
                              className="text-gray-600 dark:text-gray-400"
                            />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteAgent(agent.id, agent.name)
                            }
                            title="Delete agent"
                            disabled={deleteAgentMutation.isPending}
                            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
                          >
                            <Trash
                              size={16}
                              weight="duotone"
                              className="text-red-600 dark:text-red-400"
                            />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </SectionCard>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationState.isOpen}
        onClose={hideConfirmation}
        onConfirm={confirmationState.onConfirm}
        title={confirmationState.title}
        message={confirmationState.message}
        confirmText={confirmationState.confirmText}
        cancelText={confirmationState.cancelText}
        variant={confirmationState.variant}
        isLoading={confirmationState.isLoading}
      />
    </>
  );
}
