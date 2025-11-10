import { motion } from "framer-motion";
import { ArrowLeft, ChevronLeft, ChevronRight, Save } from "lucide-react";
import { Briefcase, CurrencyDollar, Heart, Rocket } from "phosphor-react";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import { GlassButton } from "../components/GlassButton";
import { getGradient } from "../config/theme";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useCreateAgent, useUpdateAgent } from "../hooks";
import { useGetAgents } from "../hooks/get/useGetAgents";
import { useGetKnowledgeBases } from "../hooks/get/useGetKnowledgeBases";
import { showToast } from "../utils/toast";

interface KnowledgeBase {
  id: string;
  name: string;
  vectorStoreId: string;
  description?: string;
  fileCount: number;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  consultantId?: string;
  files?: Array<{
    id: string;
    filename: string;
    bytes: number;
    mimeType: string;
  }>;
}

interface Service {
  id: string;
  name: string;
  consultantId?: string;
}

export default function AgentBuilder() {
  const { currentUser } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const isEditing = !!editId;

  const { data: agents = [] } = useGetAgents();

  const gradientBg = getGradient(theme);

  // React Query hooks for API calls
  const createAgentMutation = useCreateAgent();
  const updateAgentMutation = useUpdateAgent();
  const { data: knowledgeBasesData, isLoading: isLoadingKBs } =
    useGetKnowledgeBases();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  console.log("🚀 ~ AgentBuilderNew ~ services:", services);
  const [selectedKBs, setSelectedKBs] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  console.log("🚀 ~ AgentBuilderNew ~ selectedServices:", selectedServices);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    greetingMessage: "Hello! How can I help you today?",
    systemInstructions: "",
    tone: "Supportive and encouraging",
    personality: "Professional",
  });

  // Load existing agent data if editing
  useEffect(() => {
    if (isEditing && editId && agents.length > 0) {
      const agent = agents.find((a) => a.id === editId);
      if (agent) {
        setCurrentStep(2);
        setSelectedTemplate(agent.metadata?.template || "wellness");
        setFormData({
          name: agent.name,
          description: agent.description || "",
          greetingMessage:
            agent.greetingMessage || "Hello! How can I help you today?",
          systemInstructions: agent.systemInstructions || "",
          tone: agent.tone || "Supportive and encouraging",
          personality: agent.personality || "Professional",
        });

        // Extract data from metadata if available
        if (agent.metadata) {
          if (agent.metadata.knowledgeBase) {
            setSelectedKBs(
              Array.isArray(agent.metadata.knowledgeBase)
                ? agent.metadata.knowledgeBase
                : []
            );
          }
          if (agent.metadata.services) {
            setSelectedServices(
              Array.isArray(agent.metadata.services)
                ? agent.metadata.services
                : []
            );
          }
          if (agent.metadata.template) {
            setSelectedTemplate(agent.metadata.template);
          }
        }

        // If vectorStoreId exists, try to find matching knowledge base
        if (agent.vectorStoreId && knowledgeBases.length > 0) {
          const matchingKB = knowledgeBases.find(
            (kb) => kb.vectorStoreId === agent.vectorStoreId
          );
          if (matchingKB) {
            setSelectedKBs((prev) => {
              if (!prev.includes(matchingKB.id)) {
                return [...prev, matchingKB.id];
              }
              return prev;
            });
          }
        }
      }
    }
  }, [isEditing, editId, agents, knowledgeBases]);

  // Load knowledge bases from API
  useEffect(() => {
    if (knowledgeBasesData) {
      const userKBs = knowledgeBasesData
        .filter((kb) => !kb.isDeleted)
        .map((kb) => ({
          id: kb.id,
          name: kb.name,
          vectorStoreId: kb.vectorStoreId,
          description: kb.description,
          fileCount: kb.fileCount,
          createdAt: kb.createdAt,
          updatedAt: kb.updatedAt,
          isDeleted: kb.isDeleted,
          files: kb.files,
        }));
      setKnowledgeBases(userKBs);
    }
  }, [knowledgeBasesData]);

  // Load services from localStorage
  useEffect(() => {
    const svcStored = localStorage.getItem("coachAi_services");
    if (svcStored) {
      const all = JSON.parse(svcStored) as Array<
        Service & { consultantId: string }
      >;
      const userServices = all.filter(
        (s) => s.consultantId === currentUser?.id
      );
      setServices(userServices.map((s) => ({ id: s.id, name: s.name })));
    }
  }, [currentUser?.id]);

  const templates = [
    {
      id: "wellness",
      name: "Wellness Coach",
      description: "Holistic health and lifestyle improvement",
      icon: "Heart",
      tone: "Supportive and encouraging",
      personality: "Empathetic and motivating",
    },
    {
      id: "business",
      name: "Business Strategy Consultant",
      description: "Growth strategies and operational excellence",
      icon: "Briefcase",
      tone: "Professional and analytical",
      personality: "Results-oriented and strategic",
    },
    {
      id: "career",
      name: "Career Development Coach",
      description: "Career transitions and professional growth",
      icon: "Rocket",
      tone: "Motivational and practical",
      personality: "Supportive and action-oriented",
    },
    {
      id: "financial",
      name: "Financial Planning Consultant",
      description: "Wealth management and investment strategies",
      icon: "CurrencyDollar",
      tone: "Professional and informative",
      personality: "Knowledgeable and trustworthy",
    },
  ];

  // Icon mapping for templates
  const getTemplateIcon = (iconName: string) => {
    const iconProps = { size: 48, weight: "duotone" as const };
    const icons: Record<string, JSX.Element> = {
      Heart: <Heart {...iconProps} />,
      Briefcase: <Briefcase {...iconProps} />,
      Rocket: <Rocket {...iconProps} />,
      CurrencyDollar: <CurrencyDollar {...iconProps} />,
    };
    return icons[iconName] || null;
  };

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setFormData((prev) => ({
        ...prev,
        tone: template.tone,
        personality: template.personality,
      }));
    }
  };

  const handleToggleKB = (kbId: string) => {
    setSelectedKBs((prev) =>
      prev.includes(kbId) ? prev.filter((id) => id !== kbId) : [...prev, kbId]
    );
  };

  const handleCreateAgent = async () => {
    if (!selectedTemplate || !formData.name) {
      showToast.error("Please select a template and enter an agent name");
      return;
    }

    if (!formData.systemInstructions) {
      showToast.error("Please provide system instructions for your agent");
      return;
    }

    // Validate if file search is enabled but no knowledge base is selected
    if (
      selectedKBs.length > 0 &&
      !knowledgeBases.find((kb) => kb.id === selectedKBs[0])
    ) {
      showToast.error("Selected knowledge base not found");
      return;
    }

    if (isEditing && editId) {
      // Update existing agent via API
      updateAgentMutation.mutate(
        {
          id: editId,
          data: {
            name: formData.name,
            description: formData.description,
            greetingMessage: formData.greetingMessage,
            systemInstructions: formData.systemInstructions,
            tone: formData.tone,
            personality: formData.personality,
          },
        },
        {
          onSuccess: () => {
            navigate("/agents");
          },
        }
      );
    } else {
      // Create new agent via API
      // Get the first selected knowledge base's vectorStoreId if any
      const selectedKB =
        selectedKBs.length > 0
          ? knowledgeBases.find((kb) => kb.id === selectedKBs[0])
          : null;

      // Build the request payload
      const agentPayload = {
        name: formData.name,
        description: formData.description,
        greetingMessage: formData.greetingMessage,
        systemInstructions: formData.systemInstructions,
        tone: formData.tone,
        personality: formData.personality,
        model: "gpt-4o-mini" as const, // Default model
        hasFileSearch: selectedKBs.length > 0,
        ...(selectedKB &&
          selectedKBs.length > 0 && {
            vectorStoreId: selectedKB.vectorStoreId,
          }),
      };

      createAgentMutation.mutate(agentPayload, {
        onSuccess: () => {
          // // Map API Agent to AppContext Agent format
          // addAgent({
          //   id: newAgent.id,
          //   consultantId: currentUser?.id || "",
          //   name: newAgent.name,
          //   description: newAgent.description,
          //   template: selectedTemplateData?.name || "",
          //   personality: formData.personality,
          //   tone: newAgent.tone,
          //   greetingMessage: newAgent.greetingMessage,
          //   systemInstructions: newAgent.systemInstructions,
          //   knowledgeBase: selectedKBs,
          //   services: selectedServices,
          //   status: "draft" as const,
          //   createdAt: newAgent.createdAt,
          //   updatedAt: newAgent.updatedAt,
          //   users: 0,
          //   version: 1,
          // });
          navigate("/agents");
        },
      });
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      <Toaster />
      {/* Sticky Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1
                className="text-3xl max-w-fit font-bold bg-clip-text text-transparent bg-gradient-to-r"
                style={{ backgroundImage: gradientBg }}
              >
                {isEditing ? "Edit Agent" : "Agent Builder"}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {isEditing
                  ? "Update your agent configuration"
                  : "Create and configure your AI agent"}
              </p>
            </div>
            <div className="flex gap-3">
              <GlassButton
                onClick={() => navigate("/agents")}
                className="flex items-center gap-2"
              >
                <ArrowLeft size={20} />
                Back to Agents
              </GlassButton>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Wizard Steps Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-center gap-4">
          {/* Step 1 */}
          <div className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                currentStep === 1
                  ? "bg-black dark:bg-white text-white dark:text-black"
                  : currentStep > 1
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
              }`}
            >
              1
            </div>
            <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
              Template
            </span>
          </div>
          <ChevronRight className="text-gray-400" size={20} />

          {/* Step 2 */}
          <div className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                currentStep === 2
                  ? "bg-black dark:bg-white text-white dark:text-black"
                  : currentStep > 2
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
              }`}
            >
              2
            </div>
            <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
              Configuration
            </span>
          </div>
          <ChevronRight className="text-gray-400" size={20} />

          {/* Step 3 */}
          <div className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                currentStep === 3
                  ? "bg-black dark:bg-white text-white dark:text-black"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
              }`}
            >
              3
            </div>
            <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
              Knowledge Base
            </span>
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div>
        {/* Step 1: Template Selection */}
        {currentStep === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Choose a Template
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleSelectTemplate(template.id)}
                    className={`p-4 rounded-lg border-2 transition-all text-center ${
                      selectedTemplate === template.id
                        ? "border-black dark:border-white bg-gray-50 dark:bg-gray-700/50"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    }`}
                  >
                    <div className="flex justify-center mb-2 text-gray-900 dark:text-white">
                      {getTemplateIcon(template.icon)}
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                      {template.name}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {template.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
            <div className="p-6 flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700">
              <GlassButton
                onClick={() => setCurrentStep(2)}
                disabled={!selectedTemplate}
                className="flex items-center gap-2"
              >
                Next
                <ChevronRight size={20} />
              </GlassButton>
            </div>
          </motion.div>
        )}

        {/* Step 2: Basic Information */}
        {currentStep === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Basic Information
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Column 1 */}
                <div className="space-y-4">
                  {/* Agent Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Agent Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="e.g., Business Strategy Assistant"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>
                  {/* System Instructions */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                      System Instructions{" "}
                      <span className="text-red-600">*</span>
                    </label>
                    <textarea
                      value={formData.systemInstructions}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          systemInstructions: e.target.value,
                        })
                      }
                      placeholder="Define the agent's role, expertise, and interaction style..."
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>

                  {/* Tone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Tone
                    </label>
                    <input
                      type="text"
                      value={formData.tone}
                      onChange={(e) =>
                        setFormData({ ...formData, tone: e.target.value })
                      }
                      placeholder="e.g., Supportive and encouraging"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Column 2 */}
                <div className="space-y-4">
                  {/* Greeting Message */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Greeting Message
                    </label>
                    <input
                      type="text"
                      value={formData.greetingMessage}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          greetingMessage: e.target.value,
                        })
                      }
                      placeholder="e.g., Hello! How can I help you today?"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Brief description of your agent's purpose"
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>

                  {/* Personality */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Personality
                    </label>
                    <input
                      type="text"
                      value={formData.personality}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          personality: e.target.value,
                        })
                      }
                      placeholder="e.g., Professional"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 flex justify-between gap-3">
              <GlassButton
                onClick={() => setCurrentStep(1)}
                className="flex items-center gap-2"
              >
                <ChevronLeft size={20} />
                Back
              </GlassButton>
              <GlassButton
                onClick={() => setCurrentStep(3)}
                disabled={!formData.name || !formData.systemInstructions}
                className="flex items-center gap-2"
              >
                Next
                <ChevronRight size={20} />
              </GlassButton>
            </div>
          </motion.div>
        )}

        {/* Step 3: Knowledge Base */}
        {currentStep === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Knowledge Base (Optional)
              </h2>
            </div>
            <div className="p-6">
              {isLoadingKBs ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-700 dark:border-gray-400"></div>
                  <span className="ml-3 text-gray-600 dark:text-gray-400">
                    Loading knowledge bases...
                  </span>
                </div>
              ) : knowledgeBases.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No knowledge bases available. Create one first.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {knowledgeBases.map((kb) => (
                    <div
                      key={kb.id}
                      onClick={() => handleToggleKB(kb.id)}
                      className={`relative flex flex-col p-3 rounded-lg cursor-pointer transition-all border-2 ${
                        selectedKBs.includes(kb.id)
                          ? "bg-black/5 dark:bg-black/5 border-primary dark:border-white shadow-md"
                          : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm"
                      }`}
                    >
                      {/* Header */}
                      <div className="mb-2">
                        <div className="flex justify-between items-center">
                          <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-0.5 line-clamp-1">
                            {kb.name}
                          </h4>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(kb.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </span>
                        </div>
                        {kb.description && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">
                            {kb.description}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2 items-center">
                        {/* Stats */}
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs font-medium">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="10"
                              height="10"
                              fill="currentColor"
                              viewBox="0 0 256 256"
                            >
                              <path d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216Z"></path>
                            </svg>
                            {kb.fileCount}
                          </span>
                        </div>

                        {/* Files Preview */}
                        {kb.files && kb.files.length > 0 && (
                          <div className="flex flex-col gap-1">
                            {kb.files.slice(0, 2).map((file) => (
                              <div
                                key={file.id}
                                className="flex items-center gap-1 text-xs text-gray-700 dark:text-gray-300"
                                title={file.filename}
                              >
                                <span className="truncate text-xs">
                                  {file.filename}
                                </span>
                              </div>
                            ))}
                            {kb.files.length > 2 && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                +{kb.files.length - 2} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-6 flex justify-between gap-3">
              <GlassButton
                onClick={() => setCurrentStep(2)}
                className="flex items-center gap-2"
              >
                <ChevronLeft size={20} />
                Back
              </GlassButton>
              <GlassButton
                onClick={handleCreateAgent}
                disabled={
                  createAgentMutation.isPending ||
                  updateAgentMutation.isPending ||
                  !selectedTemplate ||
                  !formData.name ||
                  !formData.systemInstructions
                }
                className="flex items-center gap-2"
              >
                <Save size={20} />
                {createAgentMutation.isPending || updateAgentMutation.isPending
                  ? isEditing
                    ? "Updating..."
                    : "Creating..."
                  : isEditing
                  ? "Update Agent"
                  : "Create Agent"}
              </GlassButton>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
