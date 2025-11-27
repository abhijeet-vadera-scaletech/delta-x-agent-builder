import { motion, AnimatePresence } from "framer-motion";
import {
  ChatCircle,
  Plus,
  Archive,
  CaretLeft,
  User as UserIcon,
  SignOut,
  Trash,
  X,
} from "@phosphor-icons/react";
import { useState } from "react";
import { PublicChatSession, ChatSessionType } from "../types";
import { formatDistanceToNow } from "date-fns";

interface ChatSessionSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  sessions: PublicChatSession[];
  currentSessionId?: string;
  onSessionSelect: (sessionId: string) => void;
  onNewChat: () => void;
  onArchiveSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  userName: string;
  userEmail?: string;
  isAnonymous: boolean;
  onSignOut: () => void;
  headerGradient: string;
}

export default function ChatSessionSidebar({
  isOpen,
  onToggle,
  sessions,
  currentSessionId,
  onSessionSelect,
  onNewChat,
  onArchiveSession,
  onDeleteSession,
  userName,
  userEmail,
  isAnonymous,
  onSignOut,
  headerGradient,
}: ChatSessionSidebarProps) {
  const [filter, setFilter] = useState<ChatSessionType>("all");
  const [showUserMenu, setShowUserMenu] = useState(false);

  const filteredSessions = sessions.filter((session) => {
    if (filter === "archived") return session.isArchived;
    return !session.isArchived; // "all" shows non-archived
  });

  const previousSessions = filteredSessions.filter(
    (s) => s.id !== currentSessionId
  );

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        onClick={onToggle}
        className="fixed top-4 left-4 z-40 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          animate={{ rotate: isOpen ? 0 : 180 }}
          transition={{ duration: 0.3 }}
        >
          <CaretLeft size={20} className="text-gray-700 dark:text-gray-300" />
        </motion.div>
      </motion.button>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onToggle}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
            />

            {/* Sidebar Panel */}
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-80 bg-white dark:bg-gray-900 shadow-2xl z-40 flex flex-col"
            >
              {/* Header */}
              <div
                className="p-4 relative overflow-hidden"
                style={{ backgroundImage: headerGradient }}
              >
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="text-lg font-bold text-white">
                      Previous Chats
                    </h2>
                    <button
                      onClick={onToggle}
                      className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors"
                      title="Close sidebar"
                    >
                      <X size={20} weight="bold" className="text-white" />
                    </button>
                  </div>
                  <button
                    onClick={onNewChat}
                    className="w-full mt-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-white font-medium flex items-center justify-center gap-2 transition-colors"
                  >
                    <Plus size={18} weight="bold" />
                    <span>New Chat</span>
                  </button>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilter("all")}
                    className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      filter === "all"
                        ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                        : "text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-700/50"
                    }`}
                  >
                    <ChatCircle
                      size={14}
                      weight="fill"
                      className="inline mr-1"
                    />
                    All
                  </button>
                  <button
                    onClick={() => setFilter("archived")}
                    className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      filter === "archived"
                        ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                        : "text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-700/50"
                    }`}
                  >
                    <Archive size={14} weight="fill" className="inline mr-1" />
                    Archived
                  </button>
                </div>
              </div>

              {/* Sessions List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {previousSessions.length === 0 ? (
                  <div className="text-center py-8">
                    <ChatCircle
                      size={48}
                      weight="duotone"
                      className="mx-auto mb-3 text-gray-300 dark:text-gray-700"
                    />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {filter === "archived"
                        ? "No archived chats"
                        : "No previous chats"}
                    </p>
                  </div>
                ) : (
                  previousSessions.map((session) => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group relative"
                    >
                      <button
                        onClick={() => onSessionSelect(session.id)}
                        className={`w-full text-left p-3 rounded-lg transition-all ${
                          session.id === currentSessionId
                            ? "bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800"
                            : "hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm text-gray-900 dark:text-white truncate mb-1">
                              {session.title}
                            </h3>
                            {session.lastMessage && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {session.lastMessage}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] text-gray-400 dark:text-gray-500">
                                {formatDistanceToNow(
                                  new Date(session.lastMessageAt),
                                  { addSuffix: true }
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>

                      {/* Action buttons */}
                      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        {!session.isArchived && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onArchiveSession(session.id);
                            }}
                            className="p-1.5 rounded bg-white dark:bg-gray-700 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                            title="Archive"
                          >
                            <Archive
                              size={14}
                              className="text-gray-600 dark:text-gray-300"
                            />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteSession(session.id);
                          }}
                          className="p-1.5 rounded bg-white dark:bg-gray-700 shadow-sm hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                          title="Delete"
                        >
                          <Trash
                            size={14}
                            className="text-red-600 dark:text-red-400"
                          />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* User Info Footer */}
              <div className="border-t border-gray-200 dark:border-gray-800 p-4">
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                      <UserIcon
                        size={20}
                        weight="bold"
                        className="text-white"
                      />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {userName}
                      </p>
                      {userEmail && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {userEmail}
                        </p>
                      )}
                      {isAnonymous && (
                        <p className="text-xs text-orange-500 dark:text-orange-400">
                          Guest User
                        </p>
                      )}
                    </div>
                  </button>

                  {/* User Menu */}
                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                      >
                        <button
                          onClick={onSignOut}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
                        >
                          <SignOut size={16} />
                          <span>Sign Out</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
