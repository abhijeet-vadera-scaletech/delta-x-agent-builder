import { motion } from "framer-motion";
import {
  Book,
  Files,
  FloppyDisk,
  PencilSimple,
  Plus,
  Trash,
  UploadSimple,
  X,
} from "phosphor-react";
import { useState } from "react";
import Select from "react-select";
import ErrorState from "../components/ErrorState";
import { GlassButton } from "../components/GlassButton";
import { GlassCard, StatCard } from "../components/GlassCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { getGradient } from "../config/theme";
import { useTheme } from "../context/ThemeContext";
import {
  useCreateKnowledgeBase,
  useDeleteKnowledgeBase,
  useGetKnowledgeBases,
  useUpdateKnowledgeBase,
  useUploadFile,
  type KnowledgeBase,
  type UploadedFile,
} from "../hooks";
import { useGetAgents } from "../hooks/get/useGetAgents";
import { showToast } from "../utils/toast";

export default function KnowledgeBase() {
  const { theme } = useTheme();
  const gradientBg = getGradient(theme, "primary");

  // API hooks
  const {
    data: knowledgeBases = [],
    isLoading,
    error,
    refetch,
  } = useGetKnowledgeBases();
  const createKBMutation = useCreateKnowledgeBase();
  const updateKBMutation = useUpdateKnowledgeBase();
  const deleteKBMutation = useDeleteKnowledgeBase();
  const uploadFileMutation = useUploadFile();

  // Fetch agents
  const { data: agents = [] } = useGetAgents();

  // Local state
  const [selectedKB, setSelectedKB] = useState<KnowledgeBase | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);

  // Calculate stats
  const totalKBs = knowledgeBases.length;
  const totalFiles = knowledgeBases.reduce((sum, kb) => sum + kb.fileCount, 0);
  const avgFilesPerKB = totalKBs > 0 ? (totalFiles / totalKBs).toFixed(1) : "0";

  // Handlers
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreateKB = async () => {
    if (!formData.name.trim()) {
      showToast.error("Please enter a knowledge base name");
      return;
    }

    if (selectedFiles.length === 0) {
      showToast.error("Please upload at least one file");
      return;
    }

    try {
      // Upload files first
      showToast.info("Uploading files...");
      const uploadPromises = selectedFiles.map((file) =>
        uploadFileMutation.mutateAsync({ file, purpose: "assistants" })
      );

      const uploadedFiles = await Promise.all(uploadPromises);
      const fileIds = uploadedFiles.map((file: UploadedFile) => file.id);

      // Create knowledge base with file IDs and agent assignments
      await createKBMutation.mutateAsync({
        name: formData.name,
        description: formData.description,
        fileIds,
        agentIds: selectedAgents,
      });

      showToast.success("Knowledge Base created successfully! 🎉");
      setFormData({ name: "", description: "" });
      setSelectedFiles([]);
      setSelectedAgents([]);
      setShowCreateModal(false);
    } catch (err) {
      showToast.error("Failed to create knowledge base");
      console.error(err);
    }
  };

  const handleUpdateKB = async () => {
    if (!selectedKB || !formData.name.trim()) {
      showToast.error("Please enter a knowledge base name");
      return;
    }

    try {
      // Upload new files if any
      let fileIds: string[] | undefined;
      if (selectedFiles.length > 0) {
        showToast.info("Uploading new files...");
        const uploadPromises = selectedFiles.map((file) =>
          uploadFileMutation.mutateAsync({ file, purpose: "assistants" })
        );
        const uploadedFiles = await Promise.all(uploadPromises);
        fileIds = uploadedFiles.map((file: UploadedFile) => file.id);
      }

      await updateKBMutation.mutateAsync({
        id: selectedKB.id,
        data: {
          name: formData.name,
          description: formData.description,
          ...(fileIds && fileIds.length > 0 ? { fileIds } : {}),
          agentIds: selectedAgents,
        },
      });

      showToast.success("Knowledge Base updated successfully! ✨");
      setFormData({ name: "", description: "" });
      setSelectedFiles([]);
      setSelectedAgents([]);
      setShowEditModal(false);
      setSelectedKB(null);
    } catch (err) {
      showToast.error("Failed to update knowledge base");
      console.error(err);
    }
  };

  const handleDeleteKB = async (id: string) => {
    if (!confirm("Are you sure you want to delete this knowledge base?"))
      return;

    try {
      await deleteKBMutation.mutateAsync(id);
      showToast.success("Knowledge Base deleted successfully");
      if (selectedKB?.id === id) {
        setSelectedKB(null);
      }
    } catch (err) {
      showToast.error("Failed to delete knowledge base");
    }
  };

  const openEditModal = (kb: KnowledgeBase) => {
    setSelectedKB(kb);
    setFormData({ name: kb.name, description: kb.description || "" });
    setSelectedFiles([]);

    // Load agents that are currently using this KB
    const agentsUsingKB = agents
      .filter((agent) => agent.vectorStoreId === kb.vectorStoreId)
      .map((agent) => agent.id);
    setSelectedAgents(agentsUsingKB);

    setShowEditModal(true);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-148px)] overflow-hidden">
        <LoadingSpinner message="Loading knowledge bases..." />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <ErrorState message="Failed to load knowledge bases" onRetry={refetch} />
    );
  }

  return (
    <>
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
              className="text-3xl max-w-fit font-bold bg-clip-text text-transparent bg-gradient-to-r"
              style={{ backgroundImage: gradientBg }}
            >
              Knowledge Base
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage your AI knowledge bases and files
            </p>
          </div>
          {knowledgeBases.length > 0 ? (
            <GlassButton
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2"
              variant="gradient"
            >
              <Plus size={20} weight="bold" />
              Create Knowledge Base
            </GlassButton>
          ) : null}
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            label="Total Knowledge Bases"
            value={totalKBs}
            icon={<Book size={28} weight="duotone" />}
            gradient="from-blue-500 to-cyan-500"
          />
          <StatCard
            label="Total Files"
            value={totalFiles}
            icon={<Files size={28} weight="duotone" />}
            gradient="from-purple-500 to-pink-500"
          />
          <StatCard
            label="Avg Files per KB"
            value={avgFilesPerKB}
            icon={<Book size={28} weight="duotone" />}
            gradient="from-emerald-500 to-teal-500"
          />
        </div>

        {/* Knowledge Bases List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {knowledgeBases.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full"
            >
              <GlassCard className="p-12 text-center">
                <Book
                  size={64}
                  weight="duotone"
                  className="mx-auto text-gray-400 dark:text-gray-600 mb-4"
                />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No Knowledge Bases Yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Create your first knowledge base to get started
                </p>
                <GlassButton
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 mx-auto"
                  variant="gradient"
                >
                  <Plus size={20} weight="bold" />
                  Create Knowledge Base
                </GlassButton>
              </GlassCard>
            </motion.div>
          ) : (
            knowledgeBases.map((kb, index) => (
              <motion.div
                key={kb.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <GlassCard className="h-full">
                  {/* Header Section */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="p-3 rounded-xl shadow-lg"
                        style={{ backgroundImage: gradientBg }}
                      >
                        <Book
                          size={24}
                          weight="duotone"
                          className="text-white dark:text-gray-900"
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                          {kb.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs font-medium">
                            <Files size={12} weight="duotone" />
                            {kb.fileCount}{" "}
                            {kb.fileCount === 1 ? "file" : "files"}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              kb.isDeleted
                                ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                                : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300"
                            }`}
                          >
                            {kb.isDeleted ? "Inactive" : "Active"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => openEditModal(kb)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <PencilSimple
                          size={18}
                          className="text-blue-600 dark:text-blue-400"
                        />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDeleteKB(kb.id)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash
                          size={18}
                          className="text-red-600 dark:text-red-400"
                        />
                      </motion.button>
                    </div>
                  </div>

                  {/* Description */}
                  {kb.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {kb.description}
                    </p>
                  )}

                  {/* Files Section */}
                  {kb.files && kb.files.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                        <Files size={14} weight="duotone" />
                        Attached Files
                      </h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {kb.files.map((file) => (
                          <div
                            key={file.id}
                            className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700"
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <Files
                                size={16}
                                weight="duotone"
                                className="text-blue-600 dark:text-blue-400 flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                                  {file.filename}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {(file.bytes / 1024).toFixed(1)} KB •{" "}
                                  {file.mimeType.split("/")[1].toUpperCase()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Footer Section */}
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex flex-col gap-1">
                        <span>
                          Created: {new Date(kb.createdAt).toLocaleDateString()}
                        </span>
                        <span>
                          Updated: {new Date(kb.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-mono text-gray-400 dark:text-gray-500">
                          ID: {kb.vectorStoreId.slice(0, 12)}...
                        </p>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))
          )}
        </div>
      </div>
      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-4xl"
          >
            <GlassCard>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Create Knowledge Base
                </h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormData({ name: "", description: "" });
                    setSelectedFiles([]);
                    setSelectedAgents([]);
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X size={24} className="text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="e.g., Customer Support KB"
                        className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
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
                        placeholder="Describe what this knowledge base contains..."
                        rows={3}
                        className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                      />
                    </div>

                    {/* Agent Selection - Multi-select Dropdown */}
                    {agents.length > 0 && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                          Assign to Agents (Optional)
                        </label>
                        <Select
                          isMulti
                          options={agents
                            .filter((agent) => !agent.isDeleted)
                            .map((agent) => ({
                              value: agent.id,
                              label: agent.name,
                              description: agent.description,
                            }))}
                          value={agents
                            .filter((agent) =>
                              selectedAgents.includes(agent.id)
                            )
                            .map((agent) => ({
                              value: agent.id,
                              label: agent.name,
                              description: agent.description,
                            }))}
                          onChange={(selected) => {
                            setSelectedAgents(
                              selected ? selected.map((s) => s.value) : []
                            );
                          }}
                          formatOptionLabel={(option) => (
                            <div>
                              <div className="font-medium">{option.label}</div>
                              {option.description && (
                                <div className="text-xs text-gray-500">
                                  {option.description}
                                </div>
                              )}
                            </div>
                          )}
                          placeholder="Select agents..."
                          className="react-select-container"
                          classNamePrefix="react-select"
                          theme={(theme) => ({
                            ...theme,
                            borderRadius: 12,
                            colors: {
                              ...theme.colors,
                              primary: "#3b82f6",
                              primary25: "#dbeafe",
                              primary50: "#bfdbfe",
                            },
                          })}
                        />
                        {selectedAgents.length > 0 && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            {selectedAgents.length} agent
                            {selectedAgents.length > 1 ? "s" : ""} selected
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right Column - File Upload */}
                  <div className="space-y-4">
                    {/* File Upload */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Files * (PDF, TXT, DOC, etc.)
                      </label>
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-4 hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
                        <input
                          type="file"
                          multiple
                          onChange={handleFileSelect}
                          accept=".pdf,.txt,.doc,.docx,.md"
                          className="hidden"
                          id="file-upload"
                        />
                        <label
                          htmlFor="file-upload"
                          className="flex flex-col items-center cursor-pointer"
                        >
                          <UploadSimple
                            size={32}
                            weight="duotone"
                            className="text-gray-400 dark:text-gray-600 mb-2"
                          />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Click to upload files
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            Max 512MB per file
                          </span>
                        </label>
                      </div>

                      {/* Selected Files List */}
                      {selectedFiles.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {selectedFiles.map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
                            >
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <Files
                                  size={16}
                                  className="text-blue-600 dark:text-blue-400 flex-shrink-0"
                                />
                                <span className="text-sm text-gray-900 dark:text-white truncate">
                                  {file.name}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                                  ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                </span>
                              </div>
                              <button
                                onClick={() => handleRemoveFile(index)}
                                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors flex-shrink-0"
                              >
                                <X
                                  size={16}
                                  className="text-red-600 dark:text-red-400"
                                />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <GlassButton
                    onClick={handleCreateKB}
                    disabled={
                      createKBMutation.isPending || uploadFileMutation.isPending
                    }
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    <FloppyDisk size={20} weight="duotone" />
                    {uploadFileMutation.isPending
                      ? "Uploading..."
                      : createKBMutation.isPending
                      ? "Creating..."
                      : "Create"}
                  </GlassButton>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowCreateModal(false);
                      setFormData({ name: "", description: "" });
                      setSelectedFiles([]);
                      setSelectedAgents([]);
                    }}
                    className="px-6 py-3 border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </motion.button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      )}
      {/* Edit Modal */}
      {showEditModal && selectedKB && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-4xl"
          >
            <GlassCard>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Edit Knowledge Base
                </h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedKB(null);
                    setFormData({ name: "", description: "" });
                    setSelectedAgents([]);
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X size={24} className="text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Grid Layout for Name, Description, and Agent Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="e.g., Customer Support KB"
                        className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
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
                        placeholder="Describe what this knowledge base contains..."
                        rows={3}
                        className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                      />
                    </div>

                    {/* Agent Selection - Multi-select Dropdown */}
                    {agents.length > 0 && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                          Assign to Agents (Optional)
                        </label>
                        <Select
                          isMulti
                          options={agents
                            .filter((agent) => !agent.isDeleted)
                            .map((agent) => ({
                              value: agent.id,
                              label: agent.name,
                              description: agent.description,
                            }))}
                          value={agents
                            .filter((agent) =>
                              selectedAgents.includes(agent.id)
                            )
                            .map((agent) => ({
                              value: agent.id,
                              label: agent.name,
                              description: agent.description,
                            }))}
                          onChange={(selected) => {
                            setSelectedAgents(
                              selected ? selected.map((s) => s.value) : []
                            );
                          }}
                          formatOptionLabel={(option) => (
                            <div>
                              <div className="font-medium">{option.label}</div>
                              {option.description && (
                                <div className="text-xs text-gray-500">
                                  {option.description}
                                </div>
                              )}
                            </div>
                          )}
                          placeholder="Select agents..."
                          className="react-select-container"
                          classNamePrefix="react-select"
                          theme={(theme) => ({
                            ...theme,
                            borderRadius: 12,
                            colors: {
                              ...theme.colors,
                              primary: "#3b82f6",
                              primary25: "#dbeafe",
                              primary50: "#bfdbfe",
                            },
                          })}
                        />
                        {selectedAgents.length > 0 && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            {selectedAgents.length} agent
                            {selectedAgents.length > 1 ? "s" : ""} selected
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right Column - File Upload */}
                  <div className="space-y-4">
                    {/* Existing Files */}
                    {selectedKB.files && selectedKB.files.length > 0 && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                          Current Files ({selectedKB.files.length})
                        </label>
                        <div className="space-y-2 max-h-40 overflow-y-auto p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                          {selectedKB.files.map((file) => (
                            <div
                              key={file.id}
                              className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                            >
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <Files
                                  size={16}
                                  weight="duotone"
                                  className="text-blue-600 dark:text-blue-400 flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                                    {file.filename}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {(file.bytes / 1024).toFixed(1)} KB •{" "}
                                    {file.mimeType.split("/")[1].toUpperCase()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          Note: Existing files cannot be removed individually.
                          Add new files below to update the knowledge base.
                        </p>
                      </div>
                    )}

                    {/* Add New Files */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Add New Files (Optional)
                      </label>
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-4 hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
                        <input
                          type="file"
                          multiple
                          onChange={handleFileSelect}
                          accept=".pdf,.txt,.doc,.docx,.md"
                          className="hidden"
                          id="file-upload-edit"
                        />
                        <label
                          htmlFor="file-upload-edit"
                          className="flex flex-col items-center cursor-pointer"
                        >
                          <UploadSimple
                            size={32}
                            weight="duotone"
                            className="text-gray-400 dark:text-gray-600 mb-2"
                          />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Click to upload new files
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            Max 512MB per file
                          </span>
                        </label>
                      </div>

                      {/* New Files List */}
                      {selectedFiles.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                            New Files to Upload ({selectedFiles.length})
                          </p>
                          {selectedFiles.map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800"
                            >
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <Files
                                  size={16}
                                  className="text-emerald-600 dark:text-emerald-400 flex-shrink-0"
                                />
                                <span className="text-sm text-gray-900 dark:text-white truncate">
                                  {file.name}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                                  ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                </span>
                              </div>
                              <button
                                onClick={() => handleRemoveFile(index)}
                                className="p-1 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded transition-colors flex-shrink-0"
                              >
                                <X
                                  size={16}
                                  className="text-red-600 dark:text-red-400"
                                />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <GlassButton
                    onClick={handleUpdateKB}
                    disabled={
                      updateKBMutation.isPending || uploadFileMutation.isPending
                    }
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    <FloppyDisk size={20} weight="duotone" />
                    {uploadFileMutation.isPending
                      ? "Uploading..."
                      : updateKBMutation.isPending
                      ? "Updating..."
                      : "Update"}
                  </GlassButton>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedKB(null);
                      setFormData({ name: "", description: "" });
                      setSelectedFiles([]);
                      setSelectedAgents([]);
                    }}
                    className="px-6 py-3 border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </motion.button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      )}
    </>
  );
}
