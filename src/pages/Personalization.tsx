import { motion } from "framer-motion";
import {
  Camera,
  FloppyDisk,
  Pencil,
  Plus,
  Robot,
  Trash,
  X,
} from "phosphor-react";
import { useState } from "react";
import Select from "react-select";
import { GlassButton } from "../components/GlassButton";
import { GlassCard } from "../components/GlassCard";
import { ChatPreview, ColorPicker } from "../components/ui";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorState from "../components/ErrorState";
import { getGradient } from "../config/theme";
import { useTheme } from "../context/ThemeContext";
import {
  useCreatePersonalization,
  useDeletePersonalization,
  useGetPersonalizations,
  useUpdatePersonalization,
  useUploadPersonalizationImage,
  useGetAgents,
} from "../hooks";
import type {
  CreatePersonalizationRequest,
  Personalization,
  PersonalizationConfig,
  UpdatePersonalizationRequest,
} from "../types";

export default function Personalization() {
  const { theme } = useTheme();
  const gradientBg = getGradient(theme, "primary");

  // API hooks
  const {
    data: personalizations = [],
    isLoading,
    error,
    refetch,
  } = useGetPersonalizations();
  const { data: agents = [] } = useGetAgents();
  const createPersonalization = useCreatePersonalization();
  const updatePersonalization = useUpdatePersonalization();
  const deletePersonalization = useDeletePersonalization();
  const uploadPersonalizationImage = useUploadPersonalizationImage();

  // State for modal and form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPersonalization, setEditingPersonalization] =
    useState<Personalization | null>(null);
  const [previewPersonalization, setPreviewPersonalization] =
    useState<Personalization | null>(null);

  const [formData, setFormData] = useState<PersonalizationConfig>({
    name: "",
    agentAvatar: "",
    headerGradientStart: "#000000",
    headerGradientEnd: "#3d3d3d",
    senderMessageBackgroundColor: "#000000",
    incomingMessageBackgroundColor: "#e3e3e3",
    sendButtonBackgroundColor: "#000000",
    chatBackgroundColor: "#ffffff",
    inputBackgroundColor: "#000000",
    inputTextColor: "#ffffff",
    incomingMessageTextColor: "#000000",
    senderMessageTextColor: "#ffffff",
    sendButtonTextColor: "#ffffff",
  });

  // State for header background type (solid or gradient)
  const [headerBackgroundType, setHeaderBackgroundType] = useState<
    "solid" | "gradient"
  >("gradient");

  // State for selected agents
  const [selectedAgents, setSelectedAgents] = useState<
    Array<{ value: string; label: string }>
  >([]);

  // State for pending image upload (for new personalizations)
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);

  const resetForm = () => {
    setFormData({
      name: "",
      agentAvatar: "",
      headerGradientStart: "#000000",
      headerGradientEnd: "#3d3d3d",
      senderMessageBackgroundColor: "#000000",
      incomingMessageBackgroundColor: "#e3e3e3",
      sendButtonBackgroundColor: "#000000",
      chatBackgroundColor: "#ffffff",
      inputBackgroundColor: "#000000",
      inputTextColor: "#ffffff",
      incomingMessageTextColor: "#000000",
      senderMessageTextColor: "#ffffff",
      sendButtonTextColor: "#ffffff",
    });
    setHeaderBackgroundType("gradient");
    setSelectedAgents([]);
    setPendingImageFile(null);
    setEditingPersonalization(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (personalization: Personalization) => {
    setFormData({
      name: personalization.name,
      agentAvatar: personalization.agentAvatar || "",
      headerGradientStart: personalization.headerGradientStart,
      headerGradientEnd: personalization.headerGradientEnd,
      senderMessageBackgroundColor:
        personalization.senderMessageBackgroundColor || "#2563eb",
      incomingMessageBackgroundColor:
        personalization.incomingMessageBackgroundColor || "#f1f4f6",
      sendButtonBackgroundColor:
        personalization.sendButtonBackgroundColor || "#2563eb",
      chatBackgroundColor: personalization.chatBackgroundColor,
      inputBackgroundColor: personalization.inputBackgroundColor || "#ffffff",
      inputTextColor: personalization.inputTextColor || "#000000",
      incomingMessageTextColor:
        personalization.incomingMessageTextColor || "#000000",
      senderMessageTextColor:
        personalization.senderMessageTextColor || "#ffffff",
      sendButtonTextColor: personalization.sendButtonTextColor || "#ffffff",
    });
    // Determine if it's solid or gradient based on whether start and end colors are the same
    setHeaderBackgroundType(
      personalization.headerGradientStart === personalization.headerGradientEnd
        ? "solid"
        : "gradient"
    );

    // Set selected agents from attached agents
    const attachedAgents = personalization.attachedAgents || [];
    setSelectedAgents(
      attachedAgents.map((agent) => ({
        value: agent.id,
        label: agent.name,
      }))
    );

    // Clear any pending image file when editing existing personalization
    setPendingImageFile(null);

    setEditingPersonalization(personalization);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    const data: CreatePersonalizationRequest | UpdatePersonalizationRequest = {
      ...formData,
      agentIds: selectedAgents.map((agent) => agent.value),
    };

    try {
      let personalizationId: string;

      if (editingPersonalization) {
        await updatePersonalization.mutateAsync({
          id: editingPersonalization.id,
          data: data as UpdatePersonalizationRequest,
        });
        personalizationId = editingPersonalization.id;
      } else {
        const newPersonalization = await createPersonalization.mutateAsync(
          data as CreatePersonalizationRequest
        );
        personalizationId = newPersonalization.id;
      }

      // Upload pending image file if exists (for new personalizations)
      if (pendingImageFile && !editingPersonalization) {
        try {
          const response = await uploadPersonalizationImage.mutateAsync({
            personalizationId,
            image: pendingImageFile,
          });
          // Update the personalization with the uploaded image URL
          await updatePersonalization.mutateAsync({
            id: personalizationId,
            data: { agentAvatar: response.imageUrl },
          });
        } catch (imageError) {
          console.error("Error uploading image:", imageError);
          // Don't fail the entire operation if image upload fails
        }
      }

      // Only close modal and reset form on success
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      // Error handling is done in the mutation hooks with toast notifications
      // We just need to prevent the modal from closing on error
      console.error("Error saving personalization:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      window.confirm("Are you sure you want to delete this personalization?")
    ) {
      try {
        await deletePersonalization.mutateAsync(id);
      } catch (error) {
        console.error("Error deleting personalization:", error);
      }
    }
  };

  const openPreview = (personalization: Personalization) => {
    setPreviewPersonalization(personalization);
  };

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    console.log("file", file);
    console.log("editingPersonalization", editingPersonalization);
    if (!file) return;

    // For existing personalizations, upload immediately to S3
    if (editingPersonalization?.id) {
      try {
        const response = await uploadPersonalizationImage.mutateAsync({
          personalizationId: editingPersonalization.id,
          image: file,
        });
        setFormData({
          ...formData,
          agentAvatar: response.imageUrl,
        });
      } catch (error) {
        console.error("Error uploading avatar:", error);
      }
    } else {
      // For new personalizations, store the file for upload after creation
      // and create a temporary URL for preview
      setPendingImageFile(file);
      const tempUrl = URL.createObjectURL(file);
      setFormData({
        ...formData,
        agentAvatar: tempUrl,
      });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-148px)] overflow-hidden">
        <LoadingSpinner message="Loading personalizations..." />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <ErrorState
        title="Failed to load personalizations"
        message={
          error.message || "Unable to fetch personalizations. Please try again."
        }
        onRetry={() => refetch()}
      />
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
              className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r"
              style={{ backgroundImage: gradientBg }}
            >
              Chat Personalizations
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage your chat personalization themes
            </p>
          </div>
          {personalizations.length > 0 && (
            <div className="flex gap-3">
              <GlassButton
                onClick={openCreateModal}
                className="flex items-center gap-2"
                useGradient
              >
                <Plus size={18} weight="duotone" />
                Create New
              </GlassButton>
            </div>
          )}
        </motion.div>

        {/* Personalizations Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {personalizations.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                <Plus size={32} className="text-gray-400" weight="duotone" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No personalizations yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-sm">
                Create your first chat personalization theme to customize the
                appearance of your agents.
              </p>
              <GlassButton
                onClick={openCreateModal}
                className="flex items-center gap-2"
                useGradient
              >
                <Plus size={18} weight="duotone" />
                Create Your First Theme
              </GlassButton>
            </div>
          ) : (
            personalizations.map((personalization) => (
              <GlassCard
                key={personalization.id}
                className="relative group cursor-pointer"
              >
                {/* Preview */}
                <div
                  className="mb-4 cursor-pointer"
                  onClick={() => openPreview(personalization)}
                >
                  <ChatPreview
                    config={{
                      headerGradientStart: personalization.headerGradientStart,
                      headerGradientEnd: personalization.headerGradientEnd,
                      chatBackgroundColor: personalization.chatBackgroundColor,
                      senderMessageBackgroundColor:
                        personalization.senderMessageBackgroundColor ||
                        "#2563eb",
                      incomingMessageBackgroundColor:
                        personalization.incomingMessageBackgroundColor ||
                        "#f1f4f6",
                      sendButtonBackgroundColor:
                        personalization.sendButtonBackgroundColor || "#2563eb",
                      agentAvatar: personalization.agentAvatar,
                    }}
                    size="small"
                    messages={[
                      { type: "incoming", content: "Hello! How can I help?" },
                      { type: "outgoing", content: "I need assistance" },
                    ]}
                  />
                </div>

                {/* Personalization Info */}
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {personalization.name}
                  </h3>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <GlassButton
                    onClick={() => openEditModal(personalization)}
                    className="w-1/2 flex items-center justify-center gap-1 text-xs"
                  >
                    <Pencil size={14} weight="duotone" />
                    Edit
                  </GlassButton>
                  <GlassButton
                    onClick={() => handleDelete(personalization.id)}
                    className="w-1/2 flex items-center justify-center gap-1 text-xs text-red-600 hover:text-red-700"
                    disabled={deletePersonalization.isPending}
                  >
                    {deletePersonalization.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-2 border-red-600 border-t-transparent"></div>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash size={14} weight="duotone" />
                        Delete
                      </>
                    )}
                  </GlassButton>
                </div>
              </GlassCard>
            ))
          )}
        </motion.div>
      </div>
      {/* Configuration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-[70vw] w-full max-h-[90vh] overflow-hidden"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingPersonalization
                  ? "Edit Personalization"
                  : "Create New Personalization"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={24} weight="duotone" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex max-h-[calc(100vh-300px)]">
              {/* Left: Configuration */}
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="space-y-6">
                  {/* Name Field */}
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
                      className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="Enter personalization name"
                    />
                  </div>

                  {/* Agent Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Attach to Agents (Optional)
                    </label>
                    <Select
                      isMulti
                      value={selectedAgents}
                      onChange={(newValue) =>
                        setSelectedAgents(
                          newValue as Array<{ value: string; label: string }>
                        )
                      }
                      options={agents.map((agent) => ({
                        value: agent.id,
                        label: agent.name,
                      }))}
                      placeholder="Select agents to attach this personalization..."
                      className="react-select-container"
                      classNamePrefix="react-select"
                      theme={(theme) => ({
                        ...theme,
                        borderRadius: 8,
                        colors: {
                          ...theme.colors,
                          primary: "#3b82f6",
                          primary25: "#dbeafe",
                        },
                      })}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Select which agents should use this personalization theme
                    </p>
                  </div>

                  {/* Agent Avatar Upload */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Agent Avatar (Optional)
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div
                          className="w-16 h-16 rounded-lg flex items-center justify-center border-2 border-gray-300 dark:border-gray-700 overflow-hidden"
                          style={{
                            background: formData.agentAvatar
                              ? "transparent"
                              : gradientBg,
                          }}
                        >
                          {formData.agentAvatar ? (
                            <img
                              src={formData.agentAvatar}
                              alt="Agent Avatar"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Robot
                              size={24}
                              className="text-white dark:text-gray-900"
                            />
                          )}
                        </div>
                        <label
                          htmlFor="avatar-upload"
                          className="absolute bottom-0 right-0 p-1.5 bg-white dark:bg-gray-800 rounded-full shadow-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-600"
                        >
                          {uploadPersonalizationImage.isPending ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-2 border-gray-600 border-t-transparent"></div>
                          ) : (
                            <Camera
                              size={12}
                              className="text-gray-600 dark:text-gray-400"
                            />
                          )}
                          <input
                            id="avatar-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            className="hidden"
                            disabled={uploadPersonalizationImage.isPending}
                          />
                        </label>
                      </div>
                      <div className="flex-1">
                        <input
                          type="url"
                          value={formData.agentAvatar || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              agentAvatar: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          placeholder="Or enter avatar image URL"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Upload an image file or paste a URL
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Header Background Type */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Header Background Type
                    </label>
                    <div className="flex gap-4 mb-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="headerType"
                          value="solid"
                          checked={headerBackgroundType === "solid"}
                          onChange={() => {
                            setHeaderBackgroundType("solid");
                            // Set both gradient colors to the same value for solid color
                            setFormData({
                              ...formData,
                              headerGradientEnd: formData.headerGradientStart,
                            });
                          }}
                          className="text-blue-600"
                        />
                        <span className="text-gray-900 dark:text-white">
                          Solid Color
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="headerType"
                          value="gradient"
                          checked={headerBackgroundType === "gradient"}
                          onChange={() => setHeaderBackgroundType("gradient")}
                          className="text-blue-600"
                        />
                        <span className="text-gray-900 dark:text-white">
                          Gradient
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Header Colors */}
                  <div className="grid grid-cols-2 gap-4">
                    <ColorPicker
                      label={
                        headerBackgroundType === "solid"
                          ? "Header Color"
                          : "Start Color"
                      }
                      value={formData.headerGradientStart}
                      onChange={(newColor) => {
                        setFormData({
                          ...formData,
                          headerGradientStart: newColor,
                          // If solid color, set end color to same value
                          headerGradientEnd:
                            headerBackgroundType === "solid"
                              ? newColor
                              : formData.headerGradientEnd,
                        });
                      }}
                    />
                    {headerBackgroundType === "gradient" && (
                      <ColorPicker
                        label="End Color"
                        value={formData.headerGradientEnd}
                        onChange={(newColor) =>
                          setFormData({
                            ...formData,
                            headerGradientEnd: newColor,
                          })
                        }
                      />
                    )}
                  </div>

                  {/* Background Colors */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                      Background Colors
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <ColorPicker
                        label="Chat Background Color"
                        value={formData.chatBackgroundColor}
                        onChange={(newColor) =>
                          setFormData({
                            ...formData,
                            chatBackgroundColor: newColor,
                          })
                        }
                      />
                      <ColorPicker
                        label="Input Background"
                        value={formData.inputBackgroundColor || "#ffffff"}
                        onChange={(newColor) =>
                          setFormData({
                            ...formData,
                            inputBackgroundColor: newColor,
                          })
                        }
                      />
                      <ColorPicker
                        label="Sender Message Background"
                        value={formData.senderMessageBackgroundColor}
                        onChange={(newColor) =>
                          setFormData({
                            ...formData,
                            senderMessageBackgroundColor: newColor,
                          })
                        }
                      />
                      <ColorPicker
                        label="Incoming Message Background"
                        value={formData.incomingMessageBackgroundColor}
                        onChange={(newColor) =>
                          setFormData({
                            ...formData,
                            incomingMessageBackgroundColor: newColor,
                          })
                        }
                      />
                      <ColorPicker
                        label="Send Button Background"
                        value={formData.sendButtonBackgroundColor}
                        onChange={(newColor) =>
                          setFormData({
                            ...formData,
                            sendButtonBackgroundColor: newColor,
                          })
                        }
                      />
                    </div>
                  </div>

                  {/* Text Colors */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                      Text Colors
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <ColorPicker
                        label="Input Text Color"
                        value={formData.inputTextColor || "#000000"}
                        onChange={(newColor) =>
                          setFormData({
                            ...formData,
                            inputTextColor: newColor,
                          })
                        }
                      />
                      <ColorPicker
                        label="Sender Message Text"
                        value={formData.senderMessageTextColor || "#ffffff"}
                        onChange={(newColor) =>
                          setFormData({
                            ...formData,
                            senderMessageTextColor: newColor,
                          })
                        }
                      />
                      <ColorPicker
                        label="Incoming Message Text"
                        value={formData.incomingMessageTextColor || "#000000"}
                        onChange={(newColor) =>
                          setFormData({
                            ...formData,
                            incomingMessageTextColor: newColor,
                          })
                        }
                      />
                      <ColorPicker
                        label="Send Button Text"
                        value={formData.sendButtonTextColor || "#ffffff"}
                        onChange={(newColor) =>
                          setFormData({
                            ...formData,
                            sendButtonTextColor: newColor,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Live Preview */}
              <div className="w-1/2 p-6 border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Live Preview
                </h3>
                <ChatPreview
                  config={{
                    headerGradientStart: formData.headerGradientStart,
                    headerGradientEnd: formData.headerGradientEnd,
                    chatBackgroundColor: formData.chatBackgroundColor,
                    senderMessageBackgroundColor:
                      formData.senderMessageBackgroundColor,
                    incomingMessageBackgroundColor:
                      formData.incomingMessageBackgroundColor,
                    sendButtonBackgroundColor:
                      formData.sendButtonBackgroundColor,
                    senderMessageTextColor: formData.senderMessageTextColor,
                    incomingMessageTextColor: formData.incomingMessageTextColor,
                    sendButtonTextColor: formData.sendButtonTextColor,
                    inputBackgroundColor: formData.inputBackgroundColor,
                    inputTextColor: formData.inputTextColor,
                  }}
                  size="large"
                  messages={[
                    {
                      type: "incoming",
                      content: "Hello! How can I help you today?",
                    },
                    {
                      type: "outgoing",
                      content: "I'd like to learn more about your services",
                    },
                  ]}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <GlassButton
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2"
              >
                Cancel
              </GlassButton>
              <GlassButton
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700"
                disabled={
                  !formData?.name?.trim() ||
                  createPersonalization.isPending ||
                  updatePersonalization.isPending
                }
              >
                {createPersonalization.isPending ||
                updatePersonalization.isPending ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    {editingPersonalization ? "Updating..." : "Creating..."}
                  </div>
                ) : (
                  <>
                    <FloppyDisk size={18} weight="duotone" className="mr-2" />
                    {editingPersonalization ? "Update" : "Create"}
                  </>
                )}
              </GlassButton>
            </div>
          </motion.div>
        </div>
      )}
      {/* Preview Modal */}
      {previewPersonalization && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {previewPersonalization.name}
              </h2>
              <button
                onClick={() => setPreviewPersonalization(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={20} weight="duotone" />
              </button>
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {previewPersonalization.name}
              </h2>
              <ChatPreview
                config={previewPersonalization}
                size="large"
                messages={[
                  {
                    type: "incoming",
                    content: "Hello! How can I help you today?",
                  },
                  {
                    type: "outgoing",
                    content: "I'd like to learn more about your services",
                  },
                ]}
              />
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
