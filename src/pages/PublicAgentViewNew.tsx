import {
  ArchiveIcon,
  CaretLeftIcon,
  CaretRightIcon,
  ListIcon,
  MoonIcon,
  PaperPlaneRightIcon,
  PlusIcon,
  RobotIcon,
  SignOutIcon,
  SunIcon,
  TrashIcon,
  TrayArrowUpIcon,
  UserIcon,
  XIcon,
} from "@phosphor-icons/react";
import { formatDistanceToNow } from "date-fns";
import { User as FirebaseUser } from "firebase/auth";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Toaster } from "react-hot-toast";
import { useParams } from "react-router-dom";
import AuthModal from "../components/AuthModal";
import ConfirmationModal from "../components/ConfirmationModal";
import ErrorState from "../components/ErrorState";
import LoadingSpinner from "../components/LoadingSpinner";
import TypingLoader from "../components/TypingLoader";
import { useTheme } from "../context/ThemeContext";
import { useGetAuthProviders } from "../hooks/get/useGetAuthProviders";
import { useGetChatMessages } from "../hooks/get/useGetChatMessages";
import {
  ChatSession,
  useGetChatSessions,
} from "../hooks/get/useGetChatSessions";
import { useGetPublicAgent } from "../hooks/get/useGetPublicAgent";
import { useUpdateThreadStatus } from "../hooks/patch/useUpdateThreadStatus";
import { useChat } from "../hooks/useChat";
import { useConfirmation } from "../hooks/useConfirmation";
import {
  getIdToken,
  getUserDisplayName,
  onAuthChange,
  signInAnonymous,
  signInWithGithub,
  signInWithGoogle,
  signOut,
} from "../services/authService";
import { showToast } from "../utils/toast";

export default function PublicAgentViewNew({
  isTesting,
}: {
  isTesting?: boolean;
}) {
  const { agentId } = useParams<{ agentId: string }>();
  const [userMessage, setUserMessage] = useState("");
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 1024 : false
  );
  const [showArchivedChats, setShowArchivedChats] = useState(false);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { confirmationState, showConfirmation, hideConfirmation } =
    useConfirmation();
  const { theme, toggleTheme } = useTheme();
  const [idToken, setIdToken] = useState<string | undefined>();

  // Fetch agent data from API
  const { data: agent, isLoading, error } = useGetPublicAgent(agentId || "");

  // Fetch auth providers
  const { data: authProviders = [] } = useGetAuthProviders();

  // Get Firebase ID token when user changes
  useEffect(() => {
    if (user) {
      getIdToken().then((idToken) => {
        setIdToken(idToken || undefined);
      });
    }
  }, [user]);

  // Restore last selected thread from localStorage on mount
  useEffect(() => {
    if (user && agentId) {
      const storageKey = `lastSelectedThread_${agentId}_${user.uid}`;
      const savedThreadId = localStorage.getItem(storageKey);
      if (savedThreadId) {
        setSelectedThreadId(savedThreadId);
      }
    }
  }, [user, agentId]);

  // Fetch chat sessions
  const { data: activeSessions, refetch: refetchActiveSessions } =
    useGetChatSessions(idToken, false);
  const { data: archivedSessions, refetch: refetchArchivedSessions } =
    useGetChatSessions(idToken, true);

  // Fetch messages for selected thread
  const { data: chatData } = useGetChatMessages(idToken, selectedThreadId);

  // Update thread status mutation
  const updateThreadStatusMutation = useUpdateThreadStatus(idToken);

  // Get current session from selected thread
  const currentSession = chatData?.thread || null;

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthChange((firebaseUser) => {
      try {
        setUser(firebaseUser);
        setAuthLoading(false);

        if (firebaseUser && agentId) {
          // Refetch sessions when user logs in
          refetchActiveSessions();
          refetchArchivedSessions();
        }
      } catch (error) {
        console.error("Auth state change error:", error);
        setAuthLoading(false);
        showToast.error(
          "Failed to load user session. Please refresh the page."
        );
      }
    });

    return () => unsubscribe();
  }, [agentId, refetchActiveSessions, refetchArchivedSessions]);

  // Handle authentication based on agent settings
  useEffect(() => {
    if (!agent || authLoading || user) return;

    const initAuth = async () => {
      try {
        if (!agent.isOAuthEnabled) {
          await handleAnonymousSignIn();
        } else {
          setShowAuthModal(true);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        showToast.error(
          "Failed to initialize authentication. Please refresh the page."
        );
      }
    };

    initAuth();
  }, [agent, authLoading, user]);

  // Chat hook
  const {
    messages: localMessages,
    currentMessage,
    streaming,
    sendMessage: sendChatMessage,
    setMessages,
    clearChat,
    threadId,
  } = useChat({
    agentId: agentId || "",
    threadId: selectedThreadId || undefined,
    onError: (err) => {
      showToast.error(err.message || "Failed to send message");
    },
  });

  // Load messages from API when thread is selected, then use local messages for all updates
  useEffect(() => {
    if (selectedThreadId && chatData?.messages) {
      // Transform API messages to match ChatMessage type
      const transformedMessages = chatData.messages.map((msg) => ({
        id: msg.id,
        messageId: msg.id, // Use id as messageId
        threadId: selectedThreadId, // Add threadId from selected thread
        role: msg.role,
        content: msg.content,
        createdAt: msg.createdAt,
        metadata: msg.metadata,
      }));
      // Initialize local messages with API data when thread is selected
      setMessages(transformedMessages);
    } else if (!selectedThreadId) {
      // Clear messages when starting a new chat
      setMessages([]);
    }
  }, [selectedThreadId, chatData?.messages, setMessages]);

  // Update selected thread when threadId changes (after first message in new chat)
  useEffect(() => {
    if (threadId && !selectedThreadId) {
      setSelectedThreadId(threadId);
      // Save to localStorage
      if (user && agentId) {
        const storageKey = `lastSelectedThread_${agentId}_${user.uid}`;
        localStorage.setItem(storageKey, threadId);
      }
      // Refetch sessions to get the new thread
      refetchActiveSessions();
      refetchArchivedSessions();
    }
  }, [
    threadId,
    selectedThreadId,
    user,
    agentId,
    refetchActiveSessions,
    refetchArchivedSessions,
  ]);

  // Use local messages for display
  const messages = localMessages;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentMessage]);

  // Greeting is shown in the empty state UI, not as a message
  // No need to add greeting to messages array

  const handleAnonymousSignIn = async () => {
    try {
      setAuthLoading(true);
      await signInAnonymous();
      showToast.success("Signed in as guest");
    } catch (error) {
      console.error("Anonymous sign in error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to sign in as guest";
      showToast.error(errorMessage);
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
      showToast.success(
        `Signed in with ${provider === "google" ? "Google" : "GitHub"}`
      );
    } catch (error) {
      console.error("OAuth sign in error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : `Failed to sign in with ${provider}`;
      showToast.error(errorMessage);
      // Keep modal open on error so user can try again
    }
  };

  const handleSignOut = () => {
    showConfirmation(
      {
        title: "Sign Out",
        message:
          "Are you sure you want to sign out? Your current session will be saved.",
        confirmText: "Sign Out",
        cancelText: "Cancel",
        variant: "warning",
      },
      async () => {
        try {
          await signOut();
          setSelectedThreadId(null);
          // Clear from localStorage
          if (user && agentId) {
            const storageKey = `lastSelectedThread_${agentId}_${user.uid}`;
            localStorage.removeItem(storageKey);
          }
          showToast.success("Signed out successfully");
        } catch (error) {
          console.error("Sign out error:", error);
          const errorMessage =
            error instanceof Error ? error.message : "Failed to sign out";
          showToast.error(errorMessage);
        }
      }
    );
  };

  const handleNewChat = () => {
    try {
      if (!user || !agentId) return;
      // Clear the current chat and selected thread to start a new chat
      clearChat();
      setSelectedThreadId(null);
      // Clear from localStorage
      const storageKey = `lastSelectedThread_${agentId}_${user.uid}`;
      localStorage.removeItem(storageKey);
      // Greeting will be shown in the empty state UI automatically
    } catch (error) {
      console.error("Create new chat error:", error);
      showToast.error("Failed to create new chat. Please try again.");
    }
  };

  const handleSessionSelect = (sessionId: string) => {
    try {
      setSelectedThreadId(sessionId);
      // Save to localStorage
      if (user && agentId) {
        const storageKey = `lastSelectedThread_${agentId}_${user.uid}`;
        localStorage.setItem(storageKey, sessionId);
      }
    } catch (error) {
      console.error("Session select error:", error);
      showToast.error("Failed to load chat session.");
    }
  };

  const handleArchiveSession = (sessionId: string) => {
    showConfirmation(
      {
        title: "Archive Thread",
        message:
          "Are you sure you want to archive this thread? You can access it later from the archived threads section.",
        confirmText: "Archive",
        cancelText: "Cancel",
        variant: "info",
      },
      async () => {
        updateThreadStatusMutation.mutate({
          threadId: sessionId,
          data: { isArchived: true },
        });
      }
    );
  };

  const handleUnarchiveSession = (sessionId: string) => {
    updateThreadStatusMutation.mutate({
      threadId: sessionId,
      data: { isArchived: false },
    });
  };

  const handleDeleteSession = (sessionId: string) => {
    showConfirmation(
      {
        title: "Delete Thread",
        message:
          "Are you sure you want to delete this thread? This action cannot be undone.",
        confirmText: "Delete",
        cancelText: "Cancel",
        variant: "danger",
      },
      async () => {
        updateThreadStatusMutation.mutate(
          {
            threadId: sessionId,
            data: { isDeleted: true },
          },
          {
            onSuccess: () => {
              if (selectedThreadId === sessionId) {
                setSelectedThreadId(null);
                // Clear from localStorage
                if (user && agentId) {
                  const storageKey = `lastSelectedThread_${agentId}_${user.uid}`;
                  localStorage.removeItem(storageKey);
                }
              }
            },
          }
        );
      }
    );
  };

  const handleSendMessage = async () => {
    if (!userMessage.trim() || streaming || !user) return;

    const messageText = userMessage;
    setUserMessage("");

    const userName = getUserDisplayName(user);
    const isFirstMessage =
      messages.length === 0 ||
      (messages.length === 1 && messages[0].role === "assistant");

    await sendChatMessage(
      messageText,
      isFirstMessage ? userName : undefined,
      isTesting
    );

    // Refetch sessions after sending message to update the list
    refetchActiveSessions();
    refetchArchivedSessions();
  };

  // Loading state
  if (isLoading || authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner
          message={isLoading ? "Loading Agent..." : "Authenticating..."}
          fullScreen
        />
      </div>
    );
  }

  // Error state
  if (error || !agent) {
    return (
      <ErrorState
        title="Agent Not Found"
        message="The agent you're looking for doesn't exist or has been deleted."
        fullScreen
      />
    );
  }

  // Get personalization colors with theme support
  const personalization = agent.personalization;

  // Default theme colors
  const defaultLight = {
    inputTextColor: "#ffffff",
    headerGradientEnd: "#3d3d3d",
    chatBackgroundColor: "#ffffff",
    headerGradientStart: "#000000",
    sendButtonTextColor: "#ffffff",
    inputBackgroundColor: "#000000",
    senderMessageTextColor: "#ffffff",
    incomingMessageTextColor: "#000000",
    sendButtonBackgroundColor: "#000000",
    senderMessageBackgroundColor: "#000000",
    incomingMessageBackgroundColor: "#e3e3e3",
  };

  const defaultDark = {
    inputTextColor: "#ffffff",
    headerGradientEnd: "#3d3d3d",
    chatBackgroundColor: "#141414",
    headerGradientStart: "#000000",
    sendButtonTextColor: "#ffffff",
    inputBackgroundColor: "#000000",
    senderMessageTextColor: "#ffffff",
    incomingMessageTextColor: "#000000",
    sendButtonBackgroundColor: "#4d70ff",
    senderMessageBackgroundColor: "#525dff",
    incomingMessageBackgroundColor: "#ffffff",
  };

  // Theme Mode
  const themeMode = personalization?.themeMode || "system";
  // Determine which theme to use based on personalization themeMode
  // If themeMode is 'light' or 'dark', force that theme
  // If themeMode is 'system', use the user's system preference
  const isDark =
    themeMode === "dark"
      ? true
      : themeMode === "light"
      ? false
      : theme === "dark"; // Only use system theme if themeMode is 'system'

  const themeColors = isDark
    ? personalization?.dark || defaultDark
    : personalization?.light || defaultLight;

  // Show theme toggle only if themeMode is 'system'
  const showThemeToggle = themeMode === "system";

  // Theme-aware colors
  const headerBg = `linear-gradient(135deg, ${themeColors.headerGradientStart}, ${themeColors.headerGradientEnd})`;
  const chatBg = themeColors.chatBackgroundColor;
  const userMsgBg = themeColors.senderMessageBackgroundColor;
  const userMsgTextColor = themeColors.senderMessageTextColor;
  const botMsgBg = themeColors.incomingMessageBackgroundColor;
  const botMsgTextColor = themeColors.incomingMessageTextColor;
  const sendBtnBg = themeColors.sendButtonBackgroundColor;
  const sendBtnTextColor = themeColors.sendButtonTextColor;
  const inputBg = themeColors.inputBackgroundColor;
  const inputTextColor = themeColors.inputTextColor;
  const textColor = isDark ? "#ffffff" : "#1f2937";
  const borderColor = isDark ? "#374151" : "#e5e7eb";
  const sidebarBg = isDark ? "#1e1e1e" : "#f9fafb";

  // Border configuration
  const enableBorder = personalization?.enableBorder || false;
  const borderWidth = personalization?.borderWidth || "1px";
  const borderStyle = personalization?.borderStyle || "solid";

  // Border for outer container (can be disabled)
  const chatBorder = enableBorder
    ? `${borderWidth} ${borderStyle} ${borderColor}`
    : "none";

  // Border for internal dividers (always visible, uses same width/style)
  const dividerBorder = `${borderWidth} ${borderStyle} ${borderColor}`;

  // Agent avatar
  const agentAvatar = personalization?.agentAvatar || null;

  const regularSessions = activeSessions?.items || [];
  const archivedSessionsList = archivedSessions?.items || [];

  // Check if current session is archived
  const isCurrentSessionArchived = archivedSessionsList.some(
    (session) => session.id === selectedThreadId
  );

  // Check if auth is required (OAuth enabled and no user)
  const isAuthRequired = agent?.isOAuthEnabled && !user;

  return (
    <div
      className="h-screen flex overflow-hidden"
      style={{ backgroundColor: chatBg }}
    >
      <Toaster />
      {/* Auth Modal */}
      {agent?.isOAuthEnabled && agent.oAuthProviders && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          providers={agent.oAuthProviders
            .map((providerId) => {
              const provider = authProviders.find((p) => p.id === providerId);
              return provider?.name;
            })
            .filter((name): name is string => name !== undefined)}
          onSignIn={handleOAuthSignIn}
          agentName={agent.name}
        />
      )}

      {/* Confirmation Modal */}
      {!isAuthRequired && (
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
      )}

      {/* Sidebar */}
      {!isAuthRequired && (
        <AnimatePresence>
          {sidebarOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              />

              {/* Sidebar Panel */}
              <motion.div
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="fixed lg:relative left-0 top-0 bottom-0 w-[280px] z-40 flex flex-col"
                style={{
                  backgroundColor: sidebarBg,
                  borderRight: dividerBorder,
                }}
              >
                {/* Sidebar Header */}
                <div
                  className="h-14 p-4 flex items-center justify-between"
                  style={{ borderBottom: dividerBorder }}
                >
                  <h2
                    className="font-semibold text-sm flex items-center gap-2"
                    style={{ color: textColor }}
                  >
                    <ListIcon size={18} weight="bold" />
                    Previous Chats
                  </h2>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-1 rounded transition-colors lg:hidden focus:outline-none"
                    style={{ backgroundColor: "transparent" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = isDark
                        ? "#374151"
                        : "#e5e7eb")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <XIcon
                      size={18}
                      style={{ color: isDark ? "#9ca3af" : "#6b7280" }}
                    />
                  </button>
                </div>

                {/* New Chat Button */}
                <div className="p-3">
                  <button
                    onClick={handleNewChat}
                    className="w-full py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-opacity focus:outline-none"
                    style={{
                      backgroundColor: sendBtnBg,
                      color: sendBtnTextColor,
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.opacity = "0.9")
                    }
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                  >
                    <PlusIcon size={16} weight="bold" />
                    New Chat
                  </button>
                </div>

                {/* Chat List */}
                <div className="flex-1 overflow-y-auto px-3">
                  {/* Previous 7 Days */}
                  {regularSessions.length > 0 && (
                    <div className="mb-4">
                      <p
                        className="text-xs uppercase font-semibold mb-2 px-2"
                        style={{ color: isDark ? "#9ca3af" : "#6b7280" }}
                      >
                        Previous 7 Days
                      </p>
                      {regularSessions.map((session) => (
                        <motion.div
                          key={session.id}
                          onClick={() => handleSessionSelect(session.id)}
                          className="w-full text-left p-2 rounded-lg mb-1 group relative transition-colors cursor-pointer"
                          style={{
                            backgroundColor:
                              currentSession?.id === session.id
                                ? isDark
                                  ? "#374151"
                                  : "#e5e7eb"
                                : "transparent",
                          }}
                          onMouseEnter={(e) => {
                            if (currentSession?.id !== session.id) {
                              e.currentTarget.style.backgroundColor = isDark
                                ? "rgba(55, 65, 81, 0.5)"
                                : "rgba(229, 231, 235, 0.5)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (currentSession?.id !== session.id) {
                              e.currentTarget.style.backgroundColor =
                                "transparent";
                            }
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <div className="border border-gray-400 rounded-md h-8 w-8 flex items-center justify-center">
                              <RobotIcon
                                size={16}
                                className="text-gray-400 flex-shrink-"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className="text-sm truncate max-w-[80%]"
                                style={{ color: textColor }}
                              >
                                {session.title}
                              </p>
                              <p
                                className="text-xs"
                                style={{
                                  color: isDark ? "#9ca3af" : "#6b7280",
                                }}
                              >
                                {formatDistanceToNow(
                                  new Date(session.lastMessageAt),
                                  {
                                    addSuffix: true,
                                  }
                                )}
                              </p>
                            </div>
                          </div>
                          {/* Actions */}
                          <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 flex gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleArchiveSession(session.id);
                              }}
                              className="p-1 rounded transition-colors"
                              style={{
                                backgroundColor: isDark ? "#1f2937" : "#ffffff",
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.backgroundColor = isDark
                                  ? "#374151"
                                  : "#f3f4f6")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.backgroundColor = isDark
                                  ? "#1f2937"
                                  : "#ffffff")
                              }
                              title="Archive"
                            >
                              <ArchiveIcon
                                size={12}
                                className="text-gray-400"
                              />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteSession(session.id);
                              }}
                              className="p-1 rounded transition-colors"
                              style={{
                                backgroundColor: isDark ? "#1f2937" : "#ffffff",
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.backgroundColor = isDark
                                  ? "rgba(127, 29, 29, 0.3)"
                                  : "rgba(254, 202, 202, 0.5)")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.backgroundColor = isDark
                                  ? "#1f2937"
                                  : "#ffffff")
                              }
                              title="Delete"
                            >
                              <TrashIcon size={12} className="text-red-400" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Archived Chats */}
                  {archivedSessionsList.length > 0 && (
                    <div className="mb-4">
                      <button
                        onClick={() => setShowArchivedChats(!showArchivedChats)}
                        className="w-full flex items-center justify-between px-2 py-1 text-xs uppercase font-semibold transition-colors"
                        style={{ color: isDark ? "#9ca3af" : "#6b7280" }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.color = isDark
                            ? "#d1d5db"
                            : "#9ca3af")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.color = isDark
                            ? "#9ca3af"
                            : "#6b7280")
                        }
                      >
                        <span className="flex items-center gap-2">
                          <ArchiveIcon size={14} />
                          Archived Chats
                        </span>
                        <motion.div
                          animate={{ rotate: showArchivedChats ? 90 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <CaretRightIcon size={12} />
                        </motion.div>
                      </button>
                      <AnimatePresence>
                        {showArchivedChats && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            {archivedSessionsList.map(
                              (session: ChatSession) => (
                                <motion.div
                                  key={session.id}
                                  onClick={() =>
                                    handleSessionSelect(session.id)
                                  }
                                  className="w-full text-left p-2 rounded-lg mb-1 group relative transition-colors cursor-pointer"
                                  style={{
                                    backgroundColor:
                                      currentSession?.id === session.id
                                        ? isDark
                                          ? "#374151"
                                          : "#e5e7eb"
                                        : "transparent",
                                  }}
                                  onMouseEnter={(e) => {
                                    if (currentSession?.id !== session.id) {
                                      e.currentTarget.style.backgroundColor =
                                        isDark
                                          ? "rgba(55, 65, 81, 0.5)"
                                          : "rgba(229, 231, 235, 0.5)";
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    if (currentSession?.id !== session.id) {
                                      e.currentTarget.style.backgroundColor =
                                        "transparent";
                                    }
                                  }}
                                >
                                  <div className="flex items-center gap-2">
                                    <div className="border border-gray-400 rounded-md h-8 w-8 flex items-center justify-center">
                                      <RobotIcon
                                        size={16}
                                        className="text-gray-400 flex-shrink-0"
                                      />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p
                                        className="text-sm truncate max-w-[80%]"
                                        style={{ color: textColor }}
                                      >
                                        {session.title}
                                      </p>
                                      <p
                                        className="text-xs"
                                        style={{
                                          color: isDark ? "#9ca3af" : "#6b7280",
                                        }}
                                      >
                                        {formatDistanceToNow(
                                          new Date(session.lastMessageAt),
                                          {
                                            addSuffix: true,
                                          }
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                  {/* Actions */}
                                  <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 flex gap-1">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleUnarchiveSession(session.id);
                                      }}
                                      className="p-1 rounded transition-colors"
                                      style={{
                                        backgroundColor: isDark
                                          ? "#1f2937"
                                          : "#ffffff",
                                      }}
                                      onMouseEnter={(e) =>
                                        (e.currentTarget.style.backgroundColor =
                                          isDark
                                            ? "rgba(6, 78, 59, 0.3)"
                                            : "rgba(187, 247, 208, 0.5)")
                                      }
                                      onMouseLeave={(e) =>
                                        (e.currentTarget.style.backgroundColor =
                                          isDark ? "#1f2937" : "#ffffff")
                                      }
                                      title="Restore"
                                    >
                                      <TrayArrowUpIcon
                                        size={12}
                                        className="text-green-400"
                                        weight="fill"
                                      />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteSession(session.id);
                                      }}
                                      className="p-1 rounded transition-colors"
                                      style={{
                                        backgroundColor: isDark
                                          ? "#1f2937"
                                          : "#ffffff",
                                      }}
                                      onMouseEnter={(e) =>
                                        (e.currentTarget.style.backgroundColor =
                                          isDark
                                            ? "rgba(127, 29, 29, 0.3)"
                                            : "rgba(254, 202, 202, 0.5)")
                                      }
                                      onMouseLeave={(e) =>
                                        (e.currentTarget.style.backgroundColor =
                                          isDark ? "#1f2937" : "#ffffff")
                                      }
                                      title="Delete"
                                    >
                                      <TrashIcon
                                        size={12}
                                        className="text-red-400"
                                      />
                                    </button>
                                  </div>
                                </motion.div>
                              )
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      )}

      {/* Main Content */}
      {!isAuthRequired && (
        <div
          className="flex-1 flex flex-col h-dvh w-full"
          style={{
            border: chatBorder,
          }}
        >
          {/* Top Header */}
          <div
            className="h-14 flex items-center justify-between px-2 sm:px-4"
            style={{
              backgroundColor: chatBg,
              borderBottom: dividerBorder,
            }}
          >
            {/* Left: Sidebar Toggle + Agent Name */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-1.5 sm:p-2 rounded-lg transition-colors focus:outline-none"
                style={{ backgroundColor: "transparent" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = isDark
                    ? "#374151"
                    : "#e5e7eb")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                {sidebarOpen ? (
                  <CaretLeftIcon
                    size={20}
                    style={{ color: isDark ? "#9ca3af" : "#6b7280" }}
                  />
                ) : (
                  <ListIcon
                    size={20}
                    style={{ color: isDark ? "#9ca3af" : "#6b7280" }}
                  />
                )}
              </button>
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                  {agentAvatar ? (
                    <img
                      src={agentAvatar}
                      alt={agent.name}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center"
                      style={{ background: headerBg }}
                    >
                      <RobotIcon
                        size={14}
                        className="text-white sm:hidden"
                        weight="duotone"
                      />
                      <RobotIcon
                        size={16}
                        className="text-white hidden sm:block"
                        weight="duotone"
                      />
                    </div>
                  )}
                </div>
                <span
                  className="font-semibold text-xs sm:text-sm truncate max-w-[120px] sm:max-w-[200px] md:max-w-none"
                  style={{ color: textColor }}
                >
                  {agent.name}
                </span>
                {agent.isActive === false && (
                  <span className="text-xs px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded">
                    Latest
                  </span>
                )}
              </div>
            </div>

            {/* Right: Temporary Badge + Theme Toggle + User Profile */}
            <div className="flex items-center gap-3">
              {/* {user?.isAnonymous && (
              <span
                className="text-xs px-3 py-1.5 rounded-full"
                style={{
                  backgroundColor: isDark ? "#374151" : "#e5e7eb",
                  color: isDark ? "#d1d5db" : "#6b7280",
                  border: `1px solid ${borderColor}`,
                }}
              >
                Temporary
              </span>
            )} */}
              {/* Theme Toggle - Only show if themeMode is 'system' */}
              {showThemeToggle && (
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg transition-colors focus:outline-none"
                  style={{ backgroundColor: "transparent" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = isDark
                      ? "#374151"
                      : "#e5e7eb")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                  title={
                    isDark ? "Switch to Light Mode" : "Switch to Dark Mode"
                  }
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
              )}
              {user && (
                <div className="relative group">
                  <button className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden focus:outline-none">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={getUserDisplayName(user)}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserIcon
                        size={16}
                        weight="bold"
                        className="text-white"
                      />
                    )}
                  </button>
                  {/* Dropdown */}
                  <div
                    className="absolute right-0 top-full mt-2 w-48 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50"
                    style={{
                      backgroundColor: isDark ? "#1f2937" : "#ffffff",
                      border: dividerBorder,
                    }}
                  >
                    <div
                      className="p-3"
                      style={{ borderBottom: dividerBorder }}
                    >
                      <p
                        className="text-sm font-medium truncate"
                        style={{ color: textColor }}
                      >
                        {getUserDisplayName(user)}
                      </p>
                      {user.email && (
                        <p
                          className="text-xs truncate"
                          style={{ color: isDark ? "#9ca3af" : "#6b7280" }}
                        >
                          {user.email}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="w-full px-3 py-2 text-left text-sm text-red-400 transition-colors flex items-center gap-2 focus:outline-none"
                      style={{ backgroundColor: "transparent" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = isDark
                          ? "#374151"
                          : "#f3f4f6")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "transparent")
                      }
                    >
                      <SignOutIcon size={16} />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Chat Messages Area */}
          <div className="flex-1 overflow-y-auto">
            {messages.length === 0 && !currentMessage && !selectedThreadId ? (
              <div className="h-full flex flex-col items-center justify-center text-center px-4 sm:px-6">
                <div
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mb-3 sm:mb-4 overflow-hidden"
                  style={{ background: agentAvatar ? "transparent" : headerBg }}
                >
                  {agentAvatar ? (
                    <img
                      src={agentAvatar}
                      alt={agent.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover"
                    />
                  ) : (
                    <>
                      <RobotIcon
                        size={32}
                        weight="duotone"
                        className="text-white sm:hidden"
                      />
                      <RobotIcon
                        size={40}
                        weight="duotone"
                        className="text-white hidden sm:block"
                      />
                    </>
                  )}
                </div>
                <h2
                  className="text-xl sm:text-2xl font-bold mb-2"
                  style={{ color: textColor }}
                >
                  {agent.name}
                </h2>
                <p
                  className="text-xs sm:text-sm max-w-sm sm:max-w-md mb-4 sm:mb-6 px-2"
                  style={{ color: isDark ? "#9ca3af" : "#6b7280" }}
                >
                  {agent.description ||
                    "This AI assistant engages with you to understand your perspectives, challenges, and expectations about the current AI landscape."}
                </p>
                {agent.greetingMessage && (
                  <p
                    className="text-sm sm:text-base font-medium max-w-sm sm:max-w-md px-2"
                    style={{ color: textColor }}
                  >
                    {agent.greetingMessage}
                  </p>
                )}
              </div>
            ) : (
              <div className="max-w-3xl mx-auto py-4 sm:py-6 px-3 sm:px-4 space-y-3 sm:space-y-4">
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-2 sm:gap-3 ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {msg.role === "assistant" && (
                      <div
                        className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
                        style={{
                          background: agentAvatar ? "transparent" : headerBg,
                        }}
                      >
                        {agentAvatar ? (
                          <img
                            src={agentAvatar}
                            alt={agent.name}
                            className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover"
                          />
                        ) : (
                          <>
                            <RobotIcon
                              size={12}
                              weight="duotone"
                              className="text-white sm:hidden"
                            />
                            <RobotIcon
                              size={16}
                              weight="duotone"
                              className="text-white hidden sm:block"
                            />
                          </>
                        )}
                      </div>
                    )}
                    <div
                      className="max-w-[85%] sm:max-w-[70%] px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl"
                      style={{
                        backgroundColor:
                          msg.role === "user" ? userMsgBg : botMsgBg,
                        color:
                          msg.role === "user"
                            ? userMsgTextColor
                            : botMsgTextColor,
                      }}
                    >
                      <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                        {msg.content}
                      </p>
                    </div>
                    {msg.role === "user" && (
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {user?.photoURL ? (
                          <img
                            src={user.photoURL}
                            alt={getUserDisplayName(user)}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <>
                            <UserIcon
                              size={12}
                              weight="bold"
                              className="text-white sm:hidden"
                            />
                            <UserIcon
                              size={16}
                              weight="bold"
                              className="text-white hidden sm:block"
                            />
                          </>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
                {/* Show typing indicator when streaming but no message yet */}
                {streaming && !currentMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-2 sm:gap-3 justify-start"
                  >
                    <div
                      className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
                      style={{
                        background: agentAvatar ? "transparent" : headerBg,
                      }}
                    >
                      {agentAvatar ? (
                        <img
                          src={agentAvatar}
                          alt={agent.name}
                          className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover"
                        />
                      ) : (
                        <>
                          <RobotIcon
                            size={12}
                            weight="duotone"
                            className="text-white sm:hidden"
                          />
                          <RobotIcon
                            size={16}
                            weight="duotone"
                            className="text-white hidden sm:block"
                          />
                        </>
                      )}
                    </div>
                    <div
                      className="px-3 sm:px-4 py-2 sm:py-3 rounded-2xl"
                      style={{ backgroundColor: botMsgBg }}
                    >
                      <TypingLoader dotColor={botMsgTextColor} size={6} />
                    </div>
                  </motion.div>
                )}
                {/* Show streaming message with typewriter effect */}
                {currentMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-2 sm:gap-3 justify-start"
                  >
                    <div
                      className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
                      style={{
                        background: agentAvatar ? "transparent" : headerBg,
                      }}
                    >
                      {agentAvatar ? (
                        <img
                          src={agentAvatar}
                          alt={agent.name}
                          className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover"
                        />
                      ) : (
                        <>
                          <RobotIcon
                            size={12}
                            weight="duotone"
                            className="text-white sm:hidden"
                          />
                          <RobotIcon
                            size={16}
                            weight="duotone"
                            className="text-white hidden sm:block"
                          />
                        </>
                      )}
                    </div>
                    <div
                      className="max-w-[85%] sm:max-w-[70%] px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl"
                      style={{
                        backgroundColor: botMsgBg,
                        color: botMsgTextColor,
                      }}
                    >
                      <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                        {currentMessage}
                        <motion.span
                          animate={{ opacity: [1, 0] }}
                          transition={{ duration: 0.8, repeat: Infinity }}
                          className="inline-block ml-1"
                        >
                          ▋
                        </motion.span>
                      </p>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area or Archived Notice */}
          <div
            className="p-2 sm:p-4"
            style={{
              backgroundColor: chatBg,
              borderTop: dividerBorder,
            }}
          >
            {isCurrentSessionArchived ? (
              // Archived chat notice
              <div className="max-w-3xl mx-auto">
                <div
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-3 sm:px-4 py-3 rounded-xl"
                  style={{
                    backgroundColor: isDark ? "#374151" : "#f3f4f6",
                    border: dividerBorder,
                  }}
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <ArchiveIcon
                      size={18}
                      className={isDark ? "text-gray-400" : "text-gray-600"}
                    />
                    <p
                      className="text-xs sm:text-sm"
                      style={{
                        color: isDark ? "#9ca3af" : "#6b7280",
                      }}
                    >
                      This conversation is archived. Unarchive to continue.
                    </p>
                  </div>
                  <button
                    onClick={() => handleUnarchiveSession(selectedThreadId!)}
                    className="w-full sm:w-auto px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors focus:outline-none"
                    style={{
                      backgroundColor: sendBtnBg,
                      color: sendBtnTextColor,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = "0.9";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = "1";
                    }}
                  >
                    Unarchive
                  </button>
                </div>
              </div>
            ) : (
              // Regular input area
              <div className="max-w-3xl mx-auto flex gap-2 sm:gap-3 items-end">
                <textarea
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type a message..."
                  rows={1}
                  className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm resize-none focus:outline-none transition-colors"
                  style={{
                    minHeight: "44px",
                    maxHeight: "120px",
                    backgroundColor: inputBg,
                    border: dividerBorder,
                    color: inputTextColor,
                  }}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!userMessage.trim() || streaming}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 focus:outline-none"
                  style={{ backgroundColor: sendBtnBg }}
                >
                  <PaperPlaneRightIcon
                    size={18}
                    weight="fill"
                    className="sm:hidden"
                    style={{ color: sendBtnTextColor }}
                  />
                  <PaperPlaneRightIcon
                    size={20}
                    weight="fill"
                    className="hidden sm:block"
                    style={{ color: sendBtnTextColor }}
                  />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
