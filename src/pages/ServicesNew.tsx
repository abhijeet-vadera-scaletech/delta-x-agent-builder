import { motion } from "framer-motion";
import {
  Briefcase,
  Plus,
  Trash,
  CheckCircle,
  Circle,
  CurrencyDollar,
  Clock,
} from "phosphor-react";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import { showToast } from "../utils/toast";
import { useTheme } from "../context/ThemeContext";
import { getGradient } from "../config/theme";
import { GlassCard, StatCard } from "../components/GlassCard";
import { GlassButton } from "../components/GlassButton";
import ConfirmationModal from "../components/ConfirmationModal";
import Modal from "../components/Modal";
import { useConfirmation } from "../hooks/useConfirmation";

interface Service {
  id: string;
  consultantId: string;
  name: string;
  description: string;
  category: string;
  pricing: string;
  duration: string;
  actionable: boolean;
  createdAt: string;
}

export default function Services() {
  const { currentUser } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { confirmationState, showConfirmation, hideConfirmation } =
    useConfirmation();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "Coaching",
    pricing: "",
    duration: "",
    actionable: true,
  });

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("coachAi_services");
    if (stored) {
      const all = JSON.parse(stored);
      const userServices = all.filter(
        (s: Service) => s.consultantId === currentUser?.id
      );
      setServices(userServices);
    }
  }, [currentUser?.id]);

  // Save to localStorage
  const saveToStorage = (svcs: Service[]) => {
    const stored = localStorage.getItem("coachAi_services");
    const all = stored ? JSON.parse(stored) : [];
    const filtered = all.filter(
      (s: Service) => s.consultantId !== currentUser?.id
    );
    localStorage.setItem(
      "coachAi_services",
      JSON.stringify([...filtered, ...svcs])
    );
  };

  const handleCreateService = () => {
    if (!formData.name || !formData.description) {
      showToast.error("Please fill in all required fields");
      return;
    }

    const newService: Service = {
      id: Date.now().toString(),
      consultantId: currentUser?.id || "",
      name: formData.name,
      description: formData.description,
      category: formData.category,
      pricing: formData.pricing,
      duration: formData.duration,
      actionable: formData.actionable,
      createdAt: new Date().toISOString(),
    };

    const updated = [...services, newService];
    setServices(updated);
    saveToStorage(updated);
    setFormData({
      name: "",
      description: "",
      category: "Coaching",
      pricing: "",
      duration: "",
      actionable: true,
    });
    setShowCreateModal(false);
    showToast.success("Service created successfully! 🎉");
  };

  const handleDeleteService = (id: string, name: string) => {
    showConfirmation(
      {
        title: "Delete Service",
        message: `Delete "${name}"? This action cannot be undone.`,
        confirmText: "Delete",
        cancelText: "Cancel",
        variant: "danger",
      },
      () => {
        const updated = services.filter((s) => s.id !== id);
        setServices(updated);
        saveToStorage(updated);
        showToast.success("Service deleted! 🗑️");
      }
    );
  };

  const handleToggleActionable = (id: string) => {
    const updated = services.map((s) =>
      s.id === id ? { ...s, actionable: !s.actionable } : s
    );
    setServices(updated);
    saveToStorage(updated);
  };

  const categories = ["Coaching", "Consulting", "Training", "Support", "Other"];
  const servicesByCategory = categories.map((cat) => ({
    category: cat,
    count: services.filter((s) => s.category === cat).length,
  }));

  const { theme } = useTheme();
  const gradientBg = getGradient(theme, "primary");

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
              Services
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Define actionable services users can request through your agent
            </p>
          </div>
          <GlassButton
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2"
            variant="gradient"
          >
            <Plus size={20} weight="bold" /> Add Service
          </GlassButton>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            label="Total Services"
            value={services.length}
            icon={<Briefcase size={28} weight="duotone" />}
            gradient="from-blue-500 to-cyan-500"
          />
          <StatCard
            label="Actionable Services"
            value={services.filter((s) => s.actionable).length}
            icon={<CheckCircle size={28} weight="duotone" />}
            gradient="from-emerald-500 to-teal-500"
          />
          <StatCard
            label="Categories"
            value={new Set(services.map((s) => s.category)).size}
            icon={<Clock size={28} weight="duotone" />}
            gradient="from-purple-500 to-pink-500"
          />
        </div>

        {/* Services Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {services.length === 0 ? (
            <GlassCard className="lg:col-span-3 p-12 text-center">
              <Briefcase
                size={64}
                weight="duotone"
                className="text-gray-400 dark:text-gray-600 mx-auto mb-4"
              />
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                No services yet
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                Create your first service to get started
              </p>
            </GlassCard>
          ) : (
            services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <GlassCard className="h-full">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3
                        className="font-bold mb-1 bg-clip-text text-transparent bg-gradient-to-r"
                        style={{ backgroundImage: gradientBg }}
                      >
                        {service.name}
                      </h3>
                      <span className="inline-block mt-1 px-2 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-300">
                        {service.category}
                      </span>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() =>
                        handleDeleteService(service.id, service.name)
                      }
                      className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    >
                      <Trash
                        size={18}
                        weight="duotone"
                        className="text-red-600 dark:text-red-400"
                      />
                    </motion.button>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    {service.description}
                  </p>

                  <div className="space-y-2 mb-4 text-sm">
                    {service.pricing && (
                      <div className="flex items-center gap-2">
                        <div
                          className="p-1 rounded-lg"
                          style={{
                            backgroundImage: getGradient(theme, "accent1"),
                          }}
                        >
                          <CurrencyDollar
                            size={16}
                            weight="duotone"
                            className="text-white"
                          />
                        </div>
                        <span className="text-gray-600 dark:text-gray-400">
                          Pricing:
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {service.pricing}
                        </span>
                      </div>
                    )}
                    {service.duration && (
                      <div className="flex items-center gap-2">
                        <div
                          className="p-1 rounded-lg"
                          style={{
                            backgroundImage: getGradient(theme, "primary"),
                          }}
                        >
                          <Clock
                            size={16}
                            weight="duotone"
                            className="text-white dark:text-gray-900"
                          />
                        </div>
                        <span className="text-gray-600 dark:text-gray-400">
                          Duration:
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {service.duration}
                        </span>
                      </div>
                    )}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleToggleActionable(service.id)}
                    className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl font-semibold transition-all ${
                      service.actionable
                        ? "bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 text-emerald-800 dark:text-emerald-300 border-2 border-emerald-300 dark:border-emerald-700"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-700"
                    }`}
                  >
                    {service.actionable ? (
                      <CheckCircle size={18} weight="duotone" />
                    ) : (
                      <Circle size={18} weight="duotone" />
                    )}
                    {service.actionable ? "Actionable" : "Not Actionable"}
                  </motion.button>
                </GlassCard>
              </motion.div>
            ))
          )}
        </motion.div>

        {/* Services by Category */}
        {services.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <GlassCard>
              <h2
                className="text-lg font-bold mb-4 flex items-center gap-2 bg-clip-text text-transparent bg-gradient-to-r"
                style={{ backgroundImage: gradientBg }}
              >
                <div
                  className="p-1.5 rounded-lg"
                  style={{ backgroundImage: gradientBg }}
                >
                  <Briefcase
                    size={24}
                    weight="duotone"
                    className="text-white dark:text-gray-900"
                  />
                </div>
                Services by Category
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {servicesByCategory.map((cat) => (
                  <motion.div key={cat.category} whileHover={{ scale: 1.05 }}>
                    <GlassCard className="text-center">
                      <p
                        className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r"
                        style={{
                          backgroundImage: getGradient(theme, "secondary"),
                        }}
                      >
                        {cat.count}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {cat.category}
                      </p>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        )}
      </div>
      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Service"
        maxWidth="md"
      >
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Service Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., 1-on-1 Strategy Consultation"
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe what this service includes and how it helps clients..."
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Pricing
                </label>
                <input
                  type="text"
                  value={formData.pricing}
                  onChange={(e) =>
                    setFormData({ ...formData, pricing: e.target.value })
                  }
                  placeholder="e.g., $500 per session"
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Duration
                </label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: e.target.value })
                  }
                  placeholder="e.g., 60 minutes"
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all"
                />
              </div>
            </div>

            <label className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-xl border border-blue-200 dark:border-blue-700 cursor-pointer hover:shadow-md transition-shadow">
              <input
                type="checkbox"
                checked={formData.actionable}
                onChange={(e) =>
                  setFormData({ ...formData, actionable: e.target.checked })
                }
                className="w-4 h-4 rounded border-gray-300 dark:border-gray-600"
              />
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                Users can directly request this service through the agent
              </span>
            </label>

            <div className="flex gap-3 pt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </motion.button>
              <GlassButton onClick={handleCreateService} className="flex-1">
                Create Service
              </GlassButton>
            </div>
          </div>
        </div>
      </Modal>

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
