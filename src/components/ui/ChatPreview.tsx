import {
  MoonIcon,
  PaperPlaneTilt,
  Robot,
  SunIcon,
  UserIcon,
} from "@phosphor-icons/react";
import { PersonalizationConfig } from "../../types";
import { DEFAULT_THEME_PRESET } from "@/shared/constants";

export interface ChatPreviewConfig extends PersonalizationConfig {}

interface ChatPreviewProps {
  config: ChatPreviewConfig;
  size?: "small" | "medium" | "large";
  className?: string;
  showInput?: boolean;
  fullScreen?: boolean;
  agentName?: string;
  messages?: Array<{
    type: "incoming" | "outgoing";
    content: string;
  }>;
}

const defaultMessages = [
  { type: "incoming" as const, content: "Hello! How can I assist you today?" },
  { type: "outgoing" as const, content: "I need some help" },
];

const sizeConfig = {
  small: {
    container: "h-32",
    messages: "p-2 space-y-2",
    messageAvatar: "w-5 h-5",
    messageAvatarIcon: 10,
    message: "px-2 py-1.5 text-xs",
    input: "p-2",
    inputField: "h-7 text-xs",
    sendButton: "w-7 h-7",
    sendIcon: 12,
  },
  medium: {
    container: "h-48",
    messages: "p-3 space-y-3",
    messageAvatar: "w-6 h-6",
    messageAvatarIcon: 12,
    message: "px-3 py-2 text-sm",
    input: "p-3",
    inputField: "h-9 text-sm",
    sendButton: "w-9 h-9",
    sendIcon: 14,
  },
  large: {
    container: "h-80",
    messages: "p-4 space-y-4 overflow-y-auto",
    messageAvatar: "w-8 h-8",
    messageAvatarIcon: 16,
    message: "px-4 py-2.5 text-sm",
    input: "p-4",
    inputField: "h-12 text-sm",
    sendButton: "w-12 h-12",
    sendIcon: 18,
  },
};

export function ChatPreview({
  config,
  size = "medium",
  className = "",
  showInput = true,
  fullScreen = false,
  agentName = "AI Assistant",
  messages = defaultMessages,
}: ChatPreviewProps) {
  const sizes = sizeConfig[size];

  // Determine which theme to use based on themeMode
  const isDark =
    config.themeMode === "dark" ||
    (config.themeMode === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  const theme = isDark
    ? config.dark || DEFAULT_THEME_PRESET.dark
    : config.light || DEFAULT_THEME_PRESET.light;

  // Border style
  const borderStyle = config.enableBorder
    ? `${config.borderWidth || "1px"} ${config.borderStyle || "solid"} ${
        isDark ? "#374151" : "#e5e7eb"
      }`
    : "none";

  const borderColor = isDark ? "#374151" : "#e5e7eb";
  const textColor = isDark ? "#ffffff" : "#1f2937";

  // Full screen mode
  if (fullScreen) {
    return (
      <div
        className={`h-full flex flex-col overflow-hidden rounded-md ${className}`}
        style={{
          backgroundColor: theme.chatBackgroundColor,
          border: borderStyle,
          borderColor,
        }}
      >
        {/* Top Header */}
        <div
          className="h-14 flex items-center justify-between px-4 flex-shrink-0"
          style={{
            backgroundColor: theme.chatBackgroundColor,
            borderBottom: borderStyle,
            borderBottomColor: borderColor,
          }}
        >
          {/* Left: Agent Name */}
          <div className="flex items-center gap-2">
            <Robot size={20} className="text-purple-400" weight="duotone" />
            <span
              className="font-semibold text-sm"
              style={{ color: textColor }}
            >
              {agentName}
            </span>
          </div>

          {/* Right: Theme Toggle + User Profile */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              className="p-2 rounded-lg transition-colors"
              style={{ backgroundColor: "transparent" }}
              title={isDark ? "Light Mode" : "Dark Mode"}
            >
              {isDark ? (
                <SunIcon
                  size={20}
                  weight="duotone"
                  className="text-yellow-400"
                />
              ) : (
                <MoonIcon
                  size={20}
                  weight="duotone"
                  className="text-indigo-400"
                />
              )}
            </button>
            {/* User Profile */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <UserIcon size={16} weight="bold" className="text-white" />
            </div>
          </div>
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto py-6 px-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${
                  message.type === "outgoing" ? "justify-end" : "justify-start"
                }`}
              >
                {message.type === "incoming" && (
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${theme.headerGradientStart}, ${theme.headerGradientEnd})`,
                    }}
                  >
                    {config.agentAvatar ? (
                      <img
                        src={config.agentAvatar}
                        alt="Agent"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <Robot
                        size={16}
                        weight="duotone"
                        className="text-white"
                      />
                    )}
                  </div>
                )}
                <div
                  className="max-w-[70%] px-4 py-2.5 rounded-2xl"
                  style={{
                    backgroundColor:
                      message.type === "incoming"
                        ? theme.incomingMessageBackgroundColor
                        : theme.senderMessageBackgroundColor,
                    color:
                      message.type === "incoming"
                        ? theme.incomingMessageTextColor
                        : theme.senderMessageTextColor,
                  }}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                </div>
                {message.type === "outgoing" && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <UserIcon size={16} weight="bold" className="text-white" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Input Area */}
        {showInput && (
          <div
            className="p-4 flex-shrink-0"
            style={{
              backgroundColor: theme.chatBackgroundColor,
              borderTop: borderStyle,
              borderTopColor: borderColor,
            }}
          >
            <div className="max-w-3xl mx-auto flex gap-3 items-end">
              <div
                className="flex-1 h-12 rounded-xl items-center flex px-4 text-sm"
                style={{
                  backgroundColor: theme.inputBackgroundColor,
                  color: theme.inputTextColor,
                  border: borderStyle,
                  borderColor,
                }}
              >
                <span className="opacity-50">Hello</span>
              </div>
              <button
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: theme.sendButtonBackgroundColor }}
              >
                <PaperPlaneTilt
                  size={20}
                  weight="fill"
                  style={{ color: theme.sendButtonTextColor }}
                />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Compact preview mode
  return (
    <div
      className={`rounded-xl overflow-hidden shadow-lg ${className}`}
      style={{
        border: borderStyle,
        backgroundColor: theme.chatBackgroundColor,
      }}
    >
      {/* Chat Messages */}
      <div className={`${sizes.messages} ${sizes.container}`}>
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex items-start gap-2 ${
              message.type === "outgoing" ? "justify-end" : "justify-start"
            }`}
          >
            {message.type === "incoming" && (
              <div
                className={`${sizes.messageAvatar} rounded-full flex items-center justify-center flex-shrink-0`}
                style={{
                  background: `linear-gradient(135deg, ${theme.headerGradientStart}, ${theme.headerGradientEnd})`,
                }}
              >
                {config.agentAvatar ? (
                  <img
                    src={config.agentAvatar}
                    alt="Agent"
                    className={`${sizes.messageAvatar} rounded-full object-cover`}
                  />
                ) : (
                  <Robot
                    size={sizes.messageAvatarIcon}
                    weight="duotone"
                    className="text-white"
                  />
                )}
              </div>
            )}
            <div
              className={`${sizes.message} rounded-2xl max-w-[70%]`}
              style={{
                backgroundColor:
                  message.type === "incoming"
                    ? theme.incomingMessageBackgroundColor
                    : theme.senderMessageBackgroundColor,
                color:
                  message.type === "incoming"
                    ? theme.incomingMessageTextColor
                    : theme.senderMessageTextColor,
              }}
            >
              <p className="leading-relaxed">{message.content}</p>
            </div>
            {message.type === "outgoing" && (
              <div
                className={`${sizes.messageAvatar} rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0`}
              >
                <UserIcon
                  size={sizes.messageAvatarIcon}
                  weight="bold"
                  className="text-white"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Chat Input */}
      {showInput && (
        <div
          className={`${sizes.input} border-t`}
          style={{
            backgroundColor: theme.chatBackgroundColor,
            borderColor: isDark ? "#374151" : "#e5e7eb",
          }}
        >
          <div className="flex gap-2 items-end">
            <div
              className={`flex-1 ${sizes.inputField} rounded-xl items-center flex px-4`}
              style={{
                backgroundColor: theme.inputBackgroundColor,
                color: theme.inputTextColor,
                border: borderStyle,
                borderColor,
              }}
            >
              <span className="opacity-50">Hello</span>
            </div>
            <button
              className={`${sizes.sendButton} rounded-xl flex items-center justify-center flex-shrink-0`}
              style={{ backgroundColor: theme.sendButtonBackgroundColor }}
            >
              <PaperPlaneTilt
                size={sizes.sendIcon}
                weight="fill"
                style={{ color: theme.sendButtonTextColor }}
              />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
