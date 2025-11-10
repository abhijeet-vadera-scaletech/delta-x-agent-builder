import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { PaperPlaneRight, Robot, Sparkle, User } from "phosphor-react";
import { showToast } from "../utils/toast";
import { useGetPublicAgent } from "../hooks";
import { useChat } from "../hooks/useChat";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorState from "../components/ErrorState";
import { GlassCard } from "../components/GlassCard";
import { useTheme } from "../context/ThemeContext";
import { getGradient, getContrastTextColor } from "../config/theme";

export default function PublicAgentView() {
  const { agentId } = useParams<{ agentId: string }>();
  const { theme } = useTheme();
  const [userMessage, setUserMessage] = useState("");
  const [userName, setUserName] = useState("");
  const [isStarted, setIsStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch agent data from API
  const { data: agent, isLoading, error } = useGetPublicAgent(agentId || "");

  // Chat hook with real API integration
  const {
    messages,
    currentMessage,
    streaming,
    sendMessage: sendChatMessage,
    addGreetingMessage,
  } = useChat({
    agentId: agentId || "",
    onError: (err) => {
      showToast.error(err.message || "Failed to send message");
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentMessage]);

  const handleStartChat = () => {
    if (!userName.trim()) {
      showToast.error("Please enter your name");
      return;
    }
    setIsStarted(true);

    // Track session start
    const sessionId = Date.now().toString();
    const session = {
      id: sessionId,
      consultantId: agent?.userId || "",
      userId: userName,
      agentId: agentId || "",
      intentLevel: "medium" as const,
      duration: 0,
      createdAt: new Date().toISOString(),
    };

    // Save session to localStorage
    const sessions = JSON.parse(
      localStorage.getItem("coachAi_sessions") || "[]"
    );
    sessions.push(session);
    localStorage.setItem("coachAi_sessions", JSON.stringify(sessions));

    // Store session ID and user name
    sessionStorage.setItem("currentSessionId", sessionId);
    sessionStorage.setItem("userName", userName);

    // Add greeting message as incoming assistant message (not sent to API)
    if (agent?.greetingMessage) {
      addGreetingMessage(agent.greetingMessage);
    }
  };

  const handleSendMessage = async () => {
    if (!userMessage.trim() || streaming) return;

    const messageText = userMessage;
    setUserMessage(""); // Clear input immediately

    // Update session with message count
    const sessionId = sessionStorage.getItem("currentSessionId");
    if (sessionId) {
      const sessions = JSON.parse(
        localStorage.getItem("coachAi_sessions") || "[]"
      );
      const sessionIndex = sessions.findIndex(
        (s: { id: string }) => s.id === sessionId
      );
      if (sessionIndex !== -1) {
        // Calculate intent based on message count
        const messageCount =
          messages.filter((m) => m.role === "user").length + 1;
        let intentLevel: "high" | "medium" | "low" = "low";
        if (messageCount >= 5) intentLevel = "high";
        else if (messageCount >= 3) intentLevel = "medium";

        sessions[sessionIndex].intentLevel = intentLevel;
        sessions[sessionIndex].duration = Math.floor(
          (Date.now() - parseInt(sessionId)) / 1000
        );
        localStorage.setItem("coachAi_sessions", JSON.stringify(sessions));
      }
    }

    // Send message via Chat API
    // Pass userName only on first message (when no messages exist yet)
    const isFirstMessage =
      messages.length === 0 ||
      (messages.length === 1 && messages[0].role === "assistant");
    await sendChatMessage(messageText, isFirstMessage ? userName : undefined);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-148px)] overflow-hidden">
        <LoadingSpinner message="Loading Agent..." fullScreen />
      </div>
    );
  }

  // Error or not found state
  if (error || !agent) {
    return (
      <ErrorState
        title="Agent Not Found"
        message="The agent you're looking for doesn't exist or has been deleted."
        fullScreen
      />
    );
  }

  // Check if agent is deleted
  if (agent.isDeleted) {
    return (
      <ErrorState
        title="Agent Not Available"
        message="This agent is currently not available for chat."
        fullScreen
      />
    );
  }

  const gradientBg = getGradient(theme, "primary");
  const textColor = getContrastTextColor(theme);

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900 flex items-center justify-center p-4 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl h-full max-h-[calc(100vh-2rem)]"
      >
        <GlassCard
          noPadding
          className="overflow-hidden flex flex-col h-full"
          glassBodyClassName="flex flex-col h-full"
        >
          {/* Header - Sticky */}
          <div className="relative overflow-hidden flex-shrink-0">
            {/* Gradient Background */}
            <div
              className="absolute inset-0 opacity-90"
              style={{ backgroundImage: gradientBg }}
            ></div>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>

            <div className="relative p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/30">
                  <Robot size={24} weight="duotone" className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl font-bold text-white mb-1 truncate">
                    {agent.name}
                  </h1>
                  <p className="text-white/80 text-xs leading-tight line-clamp-1">
                    {agent.description || "AI Assistant ready to help you"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {agent.tone && (
                    <span className="px-2 py-1 bg-white/20 rounded-md text-[10px] font-medium text-white backdrop-blur-sm border border-white/20">
                      <Sparkle
                        size={10}
                        weight="fill"
                        className="inline mr-0.5"
                      />
                      {agent.tone}
                    </span>
                  )}
                  {agent.personality && (
                    <span className="px-2 py-1 bg-white/20 rounded-md text-[10px] font-medium text-white backdrop-blur-sm border border-white/20">
                      {agent.personality}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {!isStarted ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="w-full max-w-md"
              >
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring" }}
                    className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                    style={{ backgroundImage: gradientBg }}
                  >
                    <Robot
                      size={40}
                      weight="duotone"
                      style={{ color: textColor }}
                    />
                  </motion.div>
                  <h2
                    className="text-2xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r"
                    style={{ backgroundImage: gradientBg }}
                  >
                    Welcome!
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 text-base">
                    Enter your name to start chatting with
                    <span
                      className="font-semibold bg-clip-text text-transparent bg-gradient-to-r"
                      style={{ backgroundImage: gradientBg }}
                    >
                      {agent.name}
                    </span>
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                      <User
                        size={20}
                        className="text-gray-400 dark:text-gray-500"
                        weight="duotone"
                      />
                    </div>
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleStartChat()}
                      placeholder="Enter your name"
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all"
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleStartChat}
                    className="w-full px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                    style={{ backgroundImage: gradientBg, color: textColor }}
                  >
                    <span>Start Chat</span>
                    <PaperPlaneRight size={20} weight="fill" />
                  </motion.button>
                </div>
              </motion.div>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-gray-50/50 to-white dark:from-gray-900/50 dark:to-gray-900">
                {messages.length === 0 && !currentMessage ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div
                      className="w-16 h-16 rounded-xl opacity-10 dark:opacity-20 flex items-center justify-center mb-3"
                      style={{ backgroundImage: gradientBg }}
                    >
                      <Robot
                        size={32}
                        weight="duotone"
                        style={{ color: textColor }}
                      />
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                      Start the conversation by sending a message
                    </p>
                  </div>
                ) : (
                  <>
                    {messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`flex gap-2 ${
                          msg.role === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        {msg.role === "assistant" && (
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                            style={{ backgroundImage: gradientBg }}
                          >
                            <Robot
                              size={16}
                              weight="duotone"
                              style={{ color: textColor }}
                            />
                          </div>
                        )}
                        <div
                          className={`max-w-[70%] px-3 py-2 rounded-xl shadow-sm ${
                            msg.role === "user"
                              ? ""
                              : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
                          }`}
                          style={
                            msg.role === "user"
                              ? {
                                  backgroundImage: gradientBg,
                                  color: textColor,
                                }
                              : {}
                          }
                        >
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {msg.content}
                          </p>
                          <p
                            className={`text-[10px] mt-1 ${
                              msg.role === "user"
                                ? "opacity-60"
                                : "text-gray-400 dark:text-gray-500"
                            }`}
                          >
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        {msg.role === "user" && (
                          <div className="w-7 h-7 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <User
                              size={16}
                              weight="duotone"
                              className="text-gray-600 dark:text-gray-300"
                            />
                          </div>
                        )}
                      </motion.div>
                    ))}
                    {/* Streaming message */}
                    {currentMessage && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-2 justify-start"
                      >
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ backgroundImage: gradientBg }}
                        >
                          <Robot
                            size={16}
                            weight="duotone"
                            style={{ color: textColor }}
                          />
                        </div>
                        <div className="max-w-[70%] px-3 py-2 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 shadow-sm">
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {currentMessage}
                            <motion.span
                              animate={{ opacity: [1, 0] }}
                              transition={{ duration: 0.8, repeat: Infinity }}
                              className="inline-block w-0.5 h-3.5 ml-0.5"
                              style={{ backgroundImage: gradientBg }}
                            >
                              ▋
                            </motion.span>
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-gray-200 dark:border-gray-800 p-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex-shrink-0">
                <div className="flex gap-2 items-center">
                  <div className="flex-1 relative">
                    <textarea
                      value={userMessage}
                      onChange={(e) => setUserMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Type your message..."
                      rows={1}
                      className="w-full px-4 flex py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm resize-none transition-all"
                      style={{ minHeight: "42px", maxHeight: "100px" }}
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSendMessage}
                    disabled={!userMessage.trim() || streaming}
                    className="px-3 py-2.5 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[42px]"
                    style={{ backgroundImage: gradientBg, color: textColor }}
                  >
                    {streaming ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      <PaperPlaneRight size={18} weight="fill" />
                    )}
                  </motion.button>
                </div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1.5 text-center">
                  Press Enter to send, Shift + Enter for new line
                </p>
              </div>
            </>
          )}
        </GlassCard>
      </motion.div>
    </div>
  );
}
