import { PaperPlaneTilt, Robot } from "@phosphor-icons/react";
import { PersonalizationConfig } from "../../types";
import { DEFAULT_THEME_PRESET } from "@/shared/constants";

export interface ChatPreviewConfig extends PersonalizationConfig {}

interface ChatPreviewProps {
  config: ChatPreviewConfig;
  size?: "small" | "medium" | "large";
  className?: string;
  showInput?: boolean;
  agentName?: string;
  messages?: Array<{
    type: "incoming" | "outgoing";
    content: string;
  }>;
}

const defaultMessages = [
  { type: "incoming" as const, content: "Hello! How can I help you today?" },
  { type: "outgoing" as const, content: "I need assistance" },
];

const sizeConfig = {
  small: {
    container: "h-24",
    header: "px-3 py-2",
    avatar: "w-6 h-6",
    avatarIcon: 12,
    agentName: "text-xs",
    messages: "p-3 space-y-2",
    messageAvatar: "w-4 h-4",
    messageAvatarIcon: 10,
    message: "px-2 py-1 text-xs",
    input: "p-2",
    inputField: "h-6",
    sendButton: "w-6 h-6",
    sendIcon: 10,
  },
  medium: {
    container: "h-40",
    header: "px-4 py-3",
    avatar: "w-8 h-8",
    avatarIcon: 16,
    agentName: "text-sm",
    messages: "p-4 space-y-3",
    messageAvatar: "w-6 h-6",
    messageAvatarIcon: 12,
    message: "px-3 py-2 text-sm",
    input: "p-3",
    inputField: "h-8",
    sendButton: "w-8 h-8",
    sendIcon: 14,
  },
  large: {
    container: "h-64",
    header: "px-4 py-3",
    avatar: "w-10 h-10",
    avatarIcon: 24,
    agentName: "text-base",
    messages: "p-4 space-y-3 overflow-y-auto",
    messageAvatar: "w-8 h-8",
    messageAvatarIcon: 16,
    message: "px-4 py-2 text-sm",
    input: "p-3",
    inputField: "h-10",
    sendButton: "w-10 h-10",
    sendIcon: 18,
  },
};

export function ChatPreview({
  config,
  size = "medium",
  className = "",
  showInput = true,
  agentName = "AI Assistant",
  messages = defaultMessages,
}: ChatPreviewProps) {
  const sizes = sizeConfig[size];

  // Determine which theme to use based on themeMode
  const isDark =
    config.themeMode === "dark" ||
    (config.themeMode === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  console.log("🚀 ~ ChatPreview ~ isDark:", isDark);
  const theme = isDark
    ? config.dark || DEFAULT_THEME_PRESET.dark
    : config.light || DEFAULT_THEME_PRESET.light;

  // Border style
  const borderStyle = config.enableBorder
    ? `${config.borderWidth} ${config.borderStyle} ${theme.border}`
    : "none";

  return (
    <div
      className={`rounded-lg overflow-hidden shadow-sm ${className}`}
      style={{ border: borderStyle }}
    >
      {/* Chat Header */}
      <div
        className={`${sizes.header} flex items-center gap-2`}
        style={{
          backgroundColor: theme.primary,
        }}
      >
        <div
          className={`${sizes.avatar} rounded-full bg-white/20 flex items-center justify-center`}
        >
          {config.agentAvatar ? (
            <img
              src={config.agentAvatar}
              alt="Agent"
              className={`${sizes.avatar} rounded-full object-cover`}
            />
          ) : (
            <Robot
              size={sizes.avatarIcon}
              weight="duotone"
              className="text-white"
            />
          )}
        </div>
        <div>
          <p className={`font-medium text-white ${sizes.agentName}`}>
            {agentName}
          </p>
          {size === "large" && <p className="text-xs text-white/80">Online</p>}
        </div>
      </div>

      {/* Chat Messages */}
      <div
        className={`${sizes.messages} ${sizes.container}`}
        style={{ backgroundColor: theme.background }}
      >
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex items-start gap-2 ${
              message.type === "outgoing" ? "justify-end" : ""
            }`}
          >
            {message.type === "incoming" && (
              <div
                className={`${sizes.messageAvatar} rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0`}
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
                    className="text-gray-600"
                  />
                )}
              </div>
            )}
            <div
              className={`${sizes.message} rounded-lg ${
                message.type === "incoming" ? "rounded-tl-sm" : "rounded-tr-sm"
              } max-w-xs`}
              style={{
                backgroundColor:
                  message.type === "incoming" ? theme.card : theme.primary,
                color:
                  message.type === "incoming"
                    ? theme["card-foreground"]
                    : "#ffffff",
              }}
            >
              <p>{message.content}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Chat Input */}
      {showInput && (
        <div
          className={`${sizes.input}`}
          style={{
            backgroundColor: theme.background,
            borderTop: `1px solid ${theme.border}`,
          }}
        >
          <div className="flex gap-2">
            <div
              className={`flex-1 ${sizes.inputField} rounded-full items-center flex py-1 px-3 text-sm`}
              style={{
                backgroundColor: theme.card,
                color: theme["card-foreground"],
              }}
            >
              Type your message
            </div>
            <button
              className={`${sizes.sendButton} rounded-full flex items-center justify-center`}
              style={{ backgroundColor: theme.accent }}
            >
              <PaperPlaneTilt
                size={sizes.sendIcon}
                weight="fill"
                style={{ color: "#ffffff" }}
              />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
