import { motion } from "framer-motion";
import {
  CheckCircle,
  Copy,
  GitBranch,
  Flask,
  Rocket,
  ArrowSquareOut,
  Code,
  Circle,
} from "phosphor-react";
import { useState } from "react";
import { GlassCard } from "../components/GlassCard";
import { GlassButton } from "../components/GlassButton";
import { getGradient } from "../config/theme";
import { useGetAgents } from "../hooks";
import type { Agent } from "../types";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { showToast } from "../utils/toast";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorState from "../components/ErrorState";

type TabType = "versions" | "test" | "deploy";

export default function TestDeploy() {
  const { currentUser } = useAuth();
  const { theme } = useTheme();
  const gradientBg = getGradient(theme, "primary");
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("versions");
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [testChecklist, setTestChecklist] = useState({
    queries: false,
    knowledge: false,
    services: false,
    personalization: false,
    devices: false,
  });

  // Fetch agents from API
  const { data: agents = [], isLoading, error } = useGetAgents();

  // Filter agents for current user
  const userAgents = agents.filter((a: Agent) => a.userId === currentUser?.id);
  const selectedAgentData = userAgents.find(
    (a: Agent) => a.id === selectedAgent
  );

  const handleDeploy = () => {
    if (!selectedAgent) {
      showToast.error("Please select an agent");
      return;
    }
    // TODO: Implement deploy API call
    showToast.success("Agent deployed to production! 🚀");
  };

  const handleCreateTestVersion = () => {
    if (!selectedAgent) {
      showToast.error("Please select an agent");
      return;
    }
    // TODO: Implement create test version API call
    showToast.success("Test version created! 🧪");
  };

  const handleCopyUrl = (agentId: string) => {
    const url = `${window.location.origin}/agent/${agentId}`;
    navigator.clipboard.writeText(url);
    setCopiedUrl(agentId);
    showToast.success("URL copied to clipboard! 📋");
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleOpenPublicUrl = (agentId: string) => {
    const url = `${window.location.origin}/agent/${agentId}`;
    window.open(url, "_blank");
    showToast.info("Opening agent in new tab...");
  };

  const handleCopyEmbedCode = (agentId: string) => {
    const embedCode = `<iframe src="${window.location.origin}/agent/${agentId}" width="100%" height="600px"></iframe>`;
    navigator.clipboard.writeText(embedCode);
    setCopiedEmbed(true);
    showToast.success("Embed code copied! 📋");
    setTimeout(() => setCopiedEmbed(false), 2000);
  };

  const toggleChecklistItem = (key: keyof typeof testChecklist) => {
    setTestChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-148px)] overflow-hidden">
        <LoadingSpinner message="Loading agents..." />
      </div>
    );
  }

  // Show error state
  if (error) {
    return <ErrorState message="Failed to load agents" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex justify-between items-start"
      >
        <div>
          <h1
            className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r"
            style={{ backgroundImage: gradientBg }}
          >
            Test & Deploy
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage agent versions, test, and deploy to production
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agent Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="lg:col-span-1"
        >
          <GlassCard>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Select Agent
            </h2>
            <div className="space-y-2">
              {userAgents.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No agents created yet
                </p>
              ) : (
                userAgents.map((agent) => (
                  <motion.button
                    key={agent.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedAgent(agent.id)}
                    className={`w-full text-left p-3 rounded-xl transition-all ${
                      selectedAgent === agent.id
                        ? "bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 border-2 border-blue-500 dark:border-blue-400"
                        : "bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500"
                    }`}
                  >
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {agent.name}
                    </p>
                    {agent.description && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-1">
                        {agent.description}
                      </p>
                    )}
                    <span
                      className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-semibold ${
                        agent.isDeleted
                          ? "bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300"
                          : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300"
                      }`}
                    >
                      {agent.isDeleted ? "Inactive" : "Active"}
                    </span>
                  </motion.button>
                ))
              )}
            </div>
          </GlassCard>
        </motion.div>

        {/* Main Content with Tabs */}
        <div className="lg:col-span-2">
          {selectedAgentData ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <GlassCard>
                {/* Tab Navigation */}
                <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
                  {[
                    {
                      key: "versions" as TabType,
                      label: "Versions",
                      icon: <GitBranch size={18} weight="duotone" />,
                    },
                    {
                      key: "test" as TabType,
                      label: "Test",
                      icon: <Flask size={18} weight="duotone" />,
                    },
                    {
                      key: "deploy" as TabType,
                      label: "Deploy",
                      icon: <Rocket size={18} weight="duotone" />,
                    },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex items-center gap-2 px-4 py-2 font-semibold transition-all ${
                        activeTab === tab.key
                          ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                          : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      }`}
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                {activeTab === "versions" && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        Version History
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Manage different versions of your agent
                      </p>
                    </div>

                    {/* Version List */}
                    <div className="space-y-3">
                      {[
                        {
                          version: 3,
                          status: "deployed",
                          created: "05/11/2025, 16:00:33",
                          deployed: "05/11/2025, 16:00:33",
                        },
                        {
                          version: 2,
                          status: "testing",
                          created: "05/11/2025, 16:00:28",
                          deployed: null,
                        },
                        {
                          version: 1,
                          status: "deployed",
                          created: "05/11/2025, 16:14:42",
                          deployed: "05/11/2025, 18:18:12",
                        },
                      ].map((v) => (
                        <div
                          key={v.version}
                          className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-gray-900 dark:text-white">
                                Version {v.version}
                              </span>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  v.status === "deployed"
                                    ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300"
                                    : "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                                }`}
                              >
                                {v.status}
                              </span>
                            </div>
                            {v.status === "deployed" && (
                              <CheckCircle
                                size={20}
                                weight="fill"
                                className="text-emerald-600 dark:text-emerald-400"
                              />
                            )}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                            <p>Created: {v.created}</p>
                            {v.deployed && <p>Deployed: {v.deployed}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "test" && (
                  <div className="space-y-6">
                    {/* Test Environment Info */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-start gap-3">
                        <Flask
                          size={24}
                          weight="duotone"
                          className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1"
                        />
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                            Test Environment
                          </h3>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            Test your agent before deploying to production
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                            Test mode allows you to interact with your agent
                            without affecting production data
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Create Test Version Button */}
                    <GlassButton
                      onClick={handleCreateTestVersion}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3"
                    >
                      <Flask size={20} weight="duotone" />
                      Create Test Version
                    </GlassButton>

                    {/* Test Checklist */}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                        Test Checklist
                      </h3>
                      <div className="space-y-3">
                        {[
                          {
                            key: "queries",
                            label:
                              "Verify agent responds correctly to common queries",
                          },
                          {
                            key: "knowledge",
                            label: "Test knowledge base integration",
                          },
                          {
                            key: "services",
                            label: "Validate service requests work properly",
                          },
                          {
                            key: "personalization",
                            label: "Check personalization displays correctly",
                          },
                          {
                            key: "devices",
                            label: "Test on different devices/browsers",
                          },
                        ].map((item) => (
                          <label
                            key={item.key}
                            className="flex items-center gap-3 cursor-pointer group"
                          >
                            <div
                              onClick={() =>
                                toggleChecklistItem(
                                  item.key as keyof typeof testChecklist
                                )
                              }
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                testChecklist[
                                  item.key as keyof typeof testChecklist
                                ]
                                  ? "bg-blue-600 border-blue-600"
                                  : "border-gray-300 dark:border-gray-600 group-hover:border-blue-400"
                              }`}
                            >
                              {testChecklist[
                                item.key as keyof typeof testChecklist
                              ] && (
                                <CheckCircle
                                  size={16}
                                  weight="fill"
                                  className="text-white"
                                />
                              )}
                            </div>
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {item.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "deploy" && (
                  <div className="space-y-6">
                    {/* Deploy Info */}
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg border border-emerald-200 dark:border-emerald-800">
                      <div className="flex items-start gap-3">
                        <Rocket
                          size={24}
                          weight="duotone"
                          className="text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-1"
                        />
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                            Deploy to Production
                          </h3>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            Make your agent live and accessible to users
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                            Version 3 is currently deployed
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Deploy Button */}
                    {!selectedAgentData.isDeleted ? (
                      <div className="bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-200 dark:border-emerald-800 rounded-lg p-6 flex items-center gap-4">
                        <CheckCircle
                          size={32}
                          weight="fill"
                          className="text-emerald-600 dark:text-emerald-400"
                        />
                        <div>
                          <p className="font-semibold text-emerald-900 dark:text-emerald-100">
                            Agent is Active
                          </p>
                          <p className="text-sm text-emerald-700 dark:text-emerald-300">
                            Your agent is currently active and accessible
                          </p>
                        </div>
                      </div>
                    ) : (
                      <GlassButton
                        onClick={handleDeploy}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3"
                      >
                        <Rocket size={20} weight="duotone" />
                        Activate Agent
                      </GlassButton>
                    )}

                    {/* Agent URL */}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        Agent URL
                      </h3>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={`${window.location.origin}/agent/${selectedAgentData.id}`}
                          readOnly
                          className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-mono text-gray-900 dark:text-white"
                        />
                        <button
                          onClick={() => handleCopyUrl(selectedAgentData.id)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                          title="Copy URL"
                        >
                          <Copy
                            size={18}
                            weight={
                              copiedUrl === selectedAgentData.id
                                ? "fill"
                                : "regular"
                            }
                            className={
                              copiedUrl === selectedAgentData.id
                                ? "text-emerald-600"
                                : "text-gray-600 dark:text-gray-400"
                            }
                          />
                        </button>
                        <button
                          onClick={() =>
                            handleOpenPublicUrl(selectedAgentData.id)
                          }
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                          title="Open in new tab"
                        >
                          <ArrowSquareOut
                            size={18}
                            className="text-gray-600 dark:text-gray-400"
                          />
                        </button>
                      </div>
                    </div>

                    {/* Embed Code */}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        Embed Code
                      </h3>
                      <div className="relative">
                        <pre className="bg-gray-900 dark:bg-gray-950 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto">
                          <code>{`<iframe\n  src="${window.location.origin}/agent/${selectedAgentData.id}"\n  width="100%"\n  height="600px"\n></iframe>`}</code>
                        </pre>
                        <button
                          onClick={() =>
                            handleCopyEmbedCode(selectedAgentData.id)
                          }
                          className="absolute top-2 right-2 p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                          title="Copy Embed Code"
                        >
                          <Code
                            size={16}
                            weight={copiedEmbed ? "fill" : "regular"}
                            className={
                              copiedEmbed ? "text-emerald-400" : "text-gray-400"
                            }
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </GlassCard>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <GlassCard className="p-12 text-center">
                <Circle
                  size={48}
                  weight="duotone"
                  className="mx-auto text-gray-400 dark:text-gray-600 mb-4"
                />
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  Select an agent to get started
                </p>
              </GlassCard>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
