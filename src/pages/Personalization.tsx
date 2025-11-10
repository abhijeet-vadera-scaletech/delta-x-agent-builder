import { motion } from "framer-motion";
import {
  UploadSimple,
  Palette,
  Image,
  PaperPlaneTilt,
  ChatCircle,
  FloppyDisk,
  Gradient,
} from "phosphor-react";
import { useTheme } from "../context/ThemeContext";
import { getGradient } from "../config/theme";
import { GlassCard } from "../components/GlassCard";
import { GlassButton } from "../components/GlassButton";
import { useState } from "react";

export default function Personalization() {
  const { theme } = useTheme();
  const gradientBg = getGradient(theme, "primary");

  const [customization, setCustomization] = useState({
    agentImage: "",
    agentName: "AI Assistant",
    headerGradientStart: "#2563eb",
    headerGradientEnd: "#9333ea",
    senderBubbleBg: "#2563eb",
    receiverBubbleBg: "#f3f4f6",
    sendButtonBg: "#2563eb",
    chatAreaBg: "#ffffff",
    chatAreaBgImage: "",
  });

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
            Chat Personalization
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Customize your public agent chat experience
          </p>
        </div>
        <div className="flex gap-3">
          <GlassButton className="flex items-center gap-2">
            <FloppyDisk size={18} weight="duotone" />
            Save
          </GlassButton>
        </div>
      </motion.div>

      {/* 2-Column Layout: Configuration + Live Preview */}
      <div className="flex items-start w-full gap-6 relative">
        {/* LEFT: Configuration Panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="overflow-hidden pr-2 w-1/2"
        >
          <div className="space-y-4">
            {/* Agent Branding */}
            <GlassCard>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Image
                  size={20}
                  weight="duotone"
                  className="text-blue-600 dark:text-blue-400"
                />
                Agent Branding
              </h2>

              {/* Agent Image */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Agent Avatar{" "}
                  <span className="text-gray-400 font-normal text-xs">
                    (Optional)
                  </span>
                </label>
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-all cursor-pointer bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900"
                >
                  <UploadSimple
                    size={24}
                    weight="duotone"
                    className="mx-auto text-gray-400 dark:text-gray-600 mb-1"
                  />
                  <p className="text-gray-600 dark:text-gray-300 font-medium text-xs">
                    Upload avatar
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    PNG, JPG up to 2MB
                  </p>
                </motion.div>
              </div>
            </GlassCard>

            {/* Header Gradient */}
            <GlassCard>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Gradient
                  size={20}
                  weight="duotone"
                  className="text-purple-600 dark:text-purple-400"
                />
                Header Gradient
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Start Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={customization.headerGradientStart}
                      onChange={(e) =>
                        setCustomization({
                          ...customization,
                          headerGradientStart: e.target.value,
                        })
                      }
                      className="w-10 h-9 rounded cursor-pointer border-2 border-gray-300 dark:border-gray-700"
                    />
                    <input
                      type="text"
                      value={customization.headerGradientStart}
                      onChange={(e) =>
                        setCustomization({
                          ...customization,
                          headerGradientStart: e.target.value,
                        })
                      }
                      className="flex-1 px-3 py-2 border-2 border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                    End Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={customization.headerGradientEnd}
                      onChange={(e) =>
                        setCustomization({
                          ...customization,
                          headerGradientEnd: e.target.value,
                        })
                      }
                      className="w-10 h-9 rounded cursor-pointer border-2 border-gray-300 dark:border-gray-700"
                    />
                    <input
                      type="text"
                      value={customization.headerGradientEnd}
                      onChange={(e) =>
                        setCustomization({
                          ...customization,
                          headerGradientEnd: e.target.value,
                        })
                      }
                      className="flex-1 px-3 py-2 border-2 border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs"
                    />
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Message Bubbles */}
            <GlassCard>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <ChatCircle
                  size={20}
                  weight="duotone"
                  className="text-emerald-600 dark:text-emerald-400"
                />
                Message Bubbles
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Sender Message
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={customization.senderBubbleBg}
                      onChange={(e) =>
                        setCustomization({
                          ...customization,
                          senderBubbleBg: e.target.value,
                        })
                      }
                      className="w-10 h-9 rounded cursor-pointer border-2 border-gray-300 dark:border-gray-700"
                    />
                    <input
                      type="text"
                      value={customization.senderBubbleBg}
                      onChange={(e) =>
                        setCustomization({
                          ...customization,
                          senderBubbleBg: e.target.value,
                        })
                      }
                      className="flex-1 px-3 py-2 border-2 border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Incoming Message
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={customization.receiverBubbleBg}
                      onChange={(e) =>
                        setCustomization({
                          ...customization,
                          receiverBubbleBg: e.target.value,
                        })
                      }
                      className="w-10 h-9 rounded cursor-pointer border-2 border-gray-300 dark:border-gray-700"
                    />
                    <input
                      type="text"
                      value={customization.receiverBubbleBg}
                      onChange={(e) =>
                        setCustomization({
                          ...customization,
                          receiverBubbleBg: e.target.value,
                        })
                      }
                      className="flex-1 px-3 py-2 border-2 border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs"
                    />
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Send Button & Chat Background */}
            <GlassCard>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Palette
                  size={20}
                  weight="duotone"
                  className="text-pink-600 dark:text-pink-400"
                />
                UI Elements
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Send Button
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={customization.sendButtonBg}
                      onChange={(e) =>
                        setCustomization({
                          ...customization,
                          sendButtonBg: e.target.value,
                        })
                      }
                      className="w-10 h-9 rounded cursor-pointer border-2 border-gray-300 dark:border-gray-700"
                    />
                    <input
                      type="text"
                      value={customization.sendButtonBg}
                      onChange={(e) =>
                        setCustomization({
                          ...customization,
                          sendButtonBg: e.target.value,
                        })
                      }
                      className="flex-1 px-3 py-2 border-2 border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Chat Background
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={customization.chatAreaBg}
                      onChange={(e) =>
                        setCustomization({
                          ...customization,
                          chatAreaBg: e.target.value,
                        })
                      }
                      className="w-10 h-9 rounded cursor-pointer border-2 border-gray-300 dark:border-gray-700"
                    />
                    <input
                      type="text"
                      value={customization.chatAreaBg}
                      onChange={(e) =>
                        setCustomization({
                          ...customization,
                          chatAreaBg: e.target.value,
                        })
                      }
                      className="flex-1 px-3 py-2 border-2 border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs"
                    />
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </motion.div>

        {/* RIGHT: Live Preview */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="sticky top-[120px] w-1/2"
        >
          <GlassCard className="flex flex-col">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Live Preview
            </h2>

            {/* Chat Preview Container */}
            <div className="flex-1 rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 shadow-lg">
              {/* Chat Header */}
              <div
                className="px-4 py-3 flex items-center gap-3"
                style={{
                  background: `linear-gradient(to right, ${customization.headerGradientStart}, ${customization.headerGradientEnd})`,
                }}
              >
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Image size={24} weight="duotone" className="text-white" />
                </div>
                <div>
                  <p className="font-semibold text-white">
                    {customization.agentName}
                  </p>
                  <p className="text-xs text-white/80">Online</p>
                </div>
              </div>

              {/* Chat Messages Area */}
              <div
                className="p-4 space-y-3 h-96 overflow-y-auto"
                style={{ backgroundColor: customization.chatAreaBg }}
              >
                {/* Incoming Message */}
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                    <Image
                      size={16}
                      weight="duotone"
                      className="text-gray-600"
                    />
                  </div>
                  <div
                    className="px-4 py-2 rounded-2xl rounded-tl-sm max-w-xs"
                    style={{ backgroundColor: customization.receiverBubbleBg }}
                  >
                    <p className="text-sm text-gray-800">
                      Hello! How can I help you today?
                    </p>
                    <p className="text-xs text-gray-500 mt-1">10:30</p>
                  </div>
                </div>

                {/* Sender Message */}
                <div className="flex items-start gap-2 justify-end">
                  <div
                    className="px-4 py-2 rounded-2xl rounded-tr-sm max-w-xs"
                    style={{ backgroundColor: customization.senderBubbleBg }}
                  >
                    <p className="text-sm text-white">
                      I'd like to learn more about your services
                    </p>
                    <p className="text-xs text-white/70 mt-1">10:31</p>
                  </div>
                </div>

                {/* Incoming Message */}
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                    <Image
                      size={16}
                      weight="duotone"
                      className="text-gray-600"
                    />
                  </div>
                  <div
                    className="px-4 py-2 rounded-2xl rounded-tl-sm max-w-xs"
                    style={{ backgroundColor: customization.receiverBubbleBg }}
                  >
                    <p className="text-sm text-gray-800">
                      Great! I'd be happy to tell you about our services...
                    </p>
                    <p className="text-xs text-gray-500 mt-1">10:31</p>
                  </div>
                </div>
              </div>

              {/* Chat Input */}
              <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                    disabled
                  />
                  <button
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: customization.sendButtonBg }}
                  >
                    <PaperPlaneTilt
                      size={18}
                      weight="fill"
                      className="text-white"
                    />
                  </button>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
