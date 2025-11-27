import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  PaperPlaneRight,
  Pause,
  Robot,
  Sparkle,
  User,
} from "@phosphor-icons/react";
import { User as FirebaseUser } from "firebase/auth";
import { showToast } from "../utils/toast";
import { useGetPublicAgent } from "../hooks";
import { useChat } from "../hooks/useChat";
import { Toaster } from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorState from "../components/ErrorState";
import { GlassCard } from "../components/GlassCard";
import { useTheme } from "../context/ThemeContext";
import { getGradient, getContrastTextColor } from "../config/theme";
import AuthModal from "../components/AuthModal";
import ChatSessionSidebar from "../components/ChatSessionSidebar";
import {
  signInAnonymous,
  signInWithGoogle,
  signInWithGithub,
  signOut,
  onAuthChange,
  getUserDisplayName,
} from "../services/authService";
import {
  getChatSessions,
  createChatSession,
  updateSessionWithMessage,
  archiveChatSession,
  deleteChatSession,
  cleanupTemporarySessions,
} from "../services/chatSessionService";
import { PublicChatSession } from "../types";

export default function PublicAgentView({
  isTesting,
}: {
  isTesting?: boolean;
}) {
  const { agentId } = useParams<{ agentId: string }>();
  const { theme } = useTheme();
  const [userMessage, setUserMessage] = useState("");
  const [user, setUser] = useState<FirebaseUser | null>(null);
  console.log("🚀 ~ PublicAgentView ~ user:", user);
  const [authLoading, setAuthLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sessions, setSessions] = useState<PublicChatSession[]>([]);
  const [currentSession, setCurrentSession] =
    useState<PublicChatSession | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch agent data from API
  const { data: agent, isLoading, error } = useGetPublicAgent(agentId || "");

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthChange((firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);

      if (firebaseUser && agentId) {
        // Load sessions for this user and agent
        const userSessions = getChatSessions(firebaseUser.uid, agentId);
        setSessions(userSessions);

        // Cleanup old temporary sessions
        cleanupTemporarySessions();
      }
    });

    return () => unsubscribe();
  }, [agentId]);

  // Handle authentication based on agent settings
  useEffect(() => {
    if (!agent || authLoading || user) return;

    // If OAuth is disabled, sign in anonymously
    if (!agent.isOAuthEnabled) {
      handleAnonymousSignIn();
    } else {
      // Show auth modal for OAuth
      setShowAuthModal(true);
    }
  }, [agent, authLoading, user]);

  // Chat hook with real API integration
  const {
    messages,
    currentMessage,
    streaming,
    sendMessage: sendChatMessage,
    addGreetingMessage,
    threadId,
  } = useChat({
    agentId: agentId || "",
    threadId: currentSession?.threadId,
    onError: (err) => {
      showToast.error(err.message || "Failed to send message");
    },
  });

  // Update current session with threadId when it's created
  useEffect(() => {
    if (threadId && currentSession && !currentSession.threadId) {
      const updatedSession = { ...currentSession, threadId };
      setCurrentSession(updatedSession);
      // Update in storage
      const allSessions = getChatSessions(user?.uid || "", agentId || "");
      const index = allSessions.findIndex((s) => s.id === currentSession.id);
      if (index !== -1) {
        allSessions[index] = updatedSession;
        localStorage.setItem(
          "coachAi_chat_sessions",
          JSON.stringify(allSessions)
        );
      }
    }
  }, [threadId, currentSession, user, agentId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentMessage]);

  // Initialize with greeting message when session starts
  useEffect(() => {
    if (currentSession && messages.length === 0 && agent?.greetingMessage) {
      addGreetingMessage(agent.greetingMessage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSession, agent]);

  const handleAnonymousSignIn = async () => {
    try {
      setAuthLoading(true);
      await signInAnonymous();
      showToast.success("Signed in as guest");
    } catch (error) {
      console.error("Anonymous sign in error:", error);
      showToast.error("Failed to sign in");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: "google" | "github") => {
    try {
      let result;
      if (provider === "google") {
        result = await signInWithGoogle();
      } else {
        result = await signInWithGithub();
      }
      // Set user immediately after successful login
      setUser(result);
      setShowAuthModal(false);
      showToast.success("Signed in successfully");
    } catch (error) {
      console.error("OAuth sign in error:", error);
      showToast.error("Failed to sign in");
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setCurrentSession(null);
      setSessions([]);
      showToast.success("Signed out successfully");
    } catch (error) {
      console.error("Sign out error:", error);
      showToast.error("Failed to sign out");
    }
  };

  const handleNewChat = () => {
    if (!user || !agentId) return;

    const isTemporary = user.isAnonymous;
    const newSession = createChatSession(
      user.uid,
      agentId,
      undefined,
      isTemporary
    );
    setCurrentSession(newSession);
    setSessions(getChatSessions(user.uid, agentId));
  };

  const handleSessionSelect = (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (session) {
      setCurrentSession(session);
      setSidebarOpen(false);
    }
  };

  const handleArchiveSession = (sessionId: string) => {
    archiveChatSession(sessionId);
    if (user && agentId) {
      setSessions(getChatSessions(user.uid, agentId));
    }
    showToast.success("Chat archived");
  };

  const handleDeleteSession = (sessionId: string) => {
    deleteChatSession(sessionId);
    if (user && agentId) {
      setSessions(getChatSessions(user.uid, agentId));
    }
    if (currentSession?.id === sessionId) {
      setCurrentSession(null);
    }
    showToast.success("Chat deleted");
  };

  const handleSendMessage = async () => {
    if (!userMessage.trim() || streaming || !user) return;

    // Create session if it doesn't exist
    if (!currentSession && agentId) {
      const isTemporary = user.isAnonymous;
      const newSession = createChatSession(
        user.uid,
        agentId,
        undefined,
        isTemporary
      );
      setCurrentSession(newSession);
      setSessions(getChatSessions(user.uid, agentId));
    }

    const messageText = userMessage;
    setUserMessage(""); // Clear input immediately

    // Update session with message
    if (currentSession) {
      updateSessionWithMessage(currentSession.id, messageText);
      setSessions(getChatSessions(user.uid, agentId || ""));
    }

    // Send message via Chat API
    const userName = getUserDisplayName(user);
    const isFirstMessage =
      messages.length === 0 ||
      (messages.length === 1 && messages[0].role === "assistant");
    await sendChatMessage(
      messageText,
      isFirstMessage ? userName : undefined,
      isTesting
    );
  };

  // Loading state
  if (isLoading || authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-148px)] overflow-hidden">
        <LoadingSpinner
          message={isLoading ? "Loading Agent..." : "Authenticating..."}
          fullScreen
        />
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

  // Check if agent is inactive
  if (agent.isActive === false) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full"
        >
          <GlassCard className="text-center p-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center mx-auto mb-6 shadow-lg"
            >
              <Pause size={40} weight="duotone" className="text-white" />
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Agent Temporarily Unavailable
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              <span className="font-semibold text-gray-900 dark:text-white">
                {agent.name}
              </span>{" "}
              is currently inactive and not accepting conversations.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
              Please check back later or contact the agent owner for more
              information.
            </p>
          </GlassCard>
        </motion.div>
      </div>
    );
  }

  // Get styling configuration - use personalization if available, otherwise fall back to theme
  const getStyleConfig = () => {
    if (agent?.personalization) {
      const p = agent.personalization;
      return {
        headerGradient: `linear-gradient(to right, ${p.headerGradientStart}, ${p.headerGradientEnd})`,
        chatBackground: p.chatBackgroundColor,
        senderMessageColor: p.senderMessageBackgroundColor || "#2563eb",
        incomingMessageColor: p.incomingMessageBackgroundColor || "#f1f5f9",
        sendButtonColor: p.sendButtonBackgroundColor || "#2563eb",
        agentAvatar: p.agentAvatar,
        // For text contrast, we'll use white for dark gradients and dark for light gradients
        textColor: "#ffffff", // Most gradients work better with white text
      };
    } else {
      // Fallback to theme-based styling
      return {
        headerGradient: getGradient(theme, "primary"),
        chatBackground: "#ffffff",
        senderMessageColor: getGradient(theme, "primary"),
        incomingMessageColor: "#f1f5f9",
        sendButtonColor: getGradient(theme, "primary"),
        agentAvatar: null,
        textColor: getContrastTextColor(theme),
      };
    }
  };

  const styleConfig = getStyleConfig();

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900 flex flex-col overflow-hidden">
      <Toaster />
      {/* Auth Modal */}
      {agent?.isOAuthEnabled && agent.oAuthProviders && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          providers={agent.oAuthProviders}
          onSignIn={handleOAuthSignIn}
          agentName={agent.name}
        />
      )}

      {/* Chat Session Sidebar */}
      {user && (
        <ChatSessionSidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          sessions={sessions}
          currentSessionId={currentSession?.id}
          onSessionSelect={handleSessionSelect}
          onNewChat={handleNewChat}
          onArchiveSession={handleArchiveSession}
          onDeleteSession={handleDeleteSession}
          userName={getUserDisplayName(user)}
          userEmail={user.email || undefined}
          isAnonymous={user.isAnonymous}
          onSignOut={handleSignOut}
          headerGradient={styleConfig.headerGradient}
        />
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col h-full w-full"
      >
        {/* Header - Sticky */}
        <div className="relative overflow-hidden flex-shrink-0">
          {/* Gradient Background */}
          <div
            className="absolute inset-0 opacity-90"
            style={{ backgroundImage: styleConfig.headerGradient }}
          ></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>

          <div className="relative p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/30">
                {styleConfig.agentAvatar ? (
                  <img
                    src={styleConfig.agentAvatar}
                    alt="Agent Avatar"
                    className="w-full h-full rounded-xl object-cover"
                  />
                ) : (
                  <Robot size={24} weight="duotone" className="text-white" />
                )}
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

        {/* Messages */}
        <div
          className="flex-1 overflow-y-auto p-4 space-y-3"
          style={{ backgroundColor: styleConfig.chatBackground }}
        >
          {messages.length === 0 && !currentMessage ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div
                className="w-16 h-16 rounded-xl opacity-10 dark:opacity-20 flex items-center justify-center mb-3"
                style={{ backgroundImage: styleConfig.headerGradient }}
              >
                <Robot
                  size={32}
                  weight="duotone"
                  style={{ color: styleConfig.textColor }}
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
                      style={{
                        backgroundImage: styleConfig.headerGradient,
                      }}
                    >
                      {styleConfig.agentAvatar ? (
                        <img
                          src={styleConfig.agentAvatar}
                          alt="Agent"
                          className="w-full h-full rounded-lg object-cover"
                        />
                      ) : (
                        <Robot
                          size={16}
                          weight="duotone"
                          style={{ color: styleConfig.textColor }}
                        />
                      )}
                    </div>
                  )}
                  <div
                    className={`max-w-[70%] px-3 py-2 rounded-xl shadow-sm ${
                      msg.role === "user"
                        ? ""
                        : "text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
                    }`}
                    style={
                      msg.role === "user"
                        ? {
                            backgroundColor: styleConfig.senderMessageColor,
                            color: "#ffffff",
                          }
                        : {
                            backgroundColor: styleConfig.incomingMessageColor,
                          }
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
                    style={{
                      backgroundImage: styleConfig.headerGradient,
                    }}
                  >
                    {styleConfig.agentAvatar ? (
                      <img
                        src={styleConfig.agentAvatar}
                        alt="Agent"
                        className="w-full h-full rounded-lg object-cover"
                      />
                    ) : (
                      <Robot
                        size={16}
                        weight="duotone"
                        style={{ color: styleConfig.textColor }}
                      />
                    )}
                  </div>
                  <div
                    className="max-w-[70%] px-3 py-2 rounded-xl text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 shadow-sm"
                    style={{
                      backgroundColor: styleConfig.incomingMessageColor,
                    }}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {currentMessage}
                      <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                        className="inline-block w-0.5 h-3.5 ml-0.5"
                        style={{
                          backgroundImage: styleConfig.headerGradient,
                        }}
                      >
                        ▋
                      </motion.span>
                    </p>
                  </div>
                </motion.div>
              )}
            </>
          )}
          <div ref={messagesEndRef} className="m-0" />
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
              style={{
                backgroundColor: styleConfig.sendButtonColor,
                color: "#ffffff",
              }}
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
        </div>
      </motion.div>
    </div>
  );
}
