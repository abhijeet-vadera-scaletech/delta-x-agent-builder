import { PublicChatSession } from "../types";

const STORAGE_KEY = "coachAi_chat_sessions";

/**
 * Get all chat sessions for a user and agent
 */
export const getChatSessions = (
  userId: string,
  agentId: string
): PublicChatSession[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const allSessions: PublicChatSession[] = JSON.parse(stored);
    return allSessions.filter(
      (s) => s.userId === userId && s.agentId === agentId
    );
  } catch (error) {
    console.error("Error getting chat sessions:", error);
    return [];
  }
};

/**
 * Get a specific chat session
 */
export const getChatSession = (sessionId: string): PublicChatSession | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const allSessions: PublicChatSession[] = JSON.parse(stored);
    return allSessions.find((s) => s.id === sessionId) || null;
  } catch (error) {
    console.error("Error getting chat session:", error);
    return null;
  }
};

/**
 * Create a new chat session
 */
export const createChatSession = (
  userId: string,
  agentId: string,
  threadId?: string,
  isTemporary = false
): PublicChatSession => {
  const newSession: PublicChatSession = {
    id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    agentId,
    userId,
    threadId,
    title: "New Chat",
    lastMessageAt: new Date().toISOString(),
    messageCount: 0,
    isArchived: false,
    isTemporary,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const allSessions: PublicChatSession[] = stored ? JSON.parse(stored) : [];
    allSessions.push(newSession);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allSessions));
  } catch (error) {
    console.error("Error creating chat session:", error);
  }

  return newSession;
};

/**
 * Update a chat session
 */
export const updateChatSession = (
  sessionId: string,
  updates: Partial<PublicChatSession>
): void => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    const allSessions: PublicChatSession[] = JSON.parse(stored);
    const index = allSessions.findIndex((s) => s.id === sessionId);

    if (index !== -1) {
      allSessions[index] = {
        ...allSessions[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allSessions));
    }
  } catch (error) {
    console.error("Error updating chat session:", error);
  }
};

/**
 * Archive a chat session
 */
export const archiveChatSession = (sessionId: string): void => {
  updateChatSession(sessionId, { isArchived: true });
};

/**
 * Unarchive a chat session
 */
export const unarchiveChatSession = (sessionId: string): void => {
  updateChatSession(sessionId, { isArchived: false });
};

/**
 * Delete a chat session
 */
export const deleteChatSession = (sessionId: string): void => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    const allSessions: PublicChatSession[] = JSON.parse(stored);
    const filtered = allSessions.filter((s) => s.id !== sessionId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Error deleting chat session:", error);
  }
};

/**
 * Update session with message info
 */
export const updateSessionWithMessage = (
  sessionId: string,
  messageContent: string
): void => {
  const session = getChatSession(sessionId);
  if (!session) return;

  const title =
    session.messageCount === 0
      ? messageContent.substring(0, 50) +
        (messageContent.length > 50 ? "..." : "")
      : session.title;

  updateChatSession(sessionId, {
    title,
    lastMessage: messageContent.substring(0, 100),
    lastMessageAt: new Date().toISOString(),
    messageCount: session.messageCount + 1,
  });
};

/**
 * Clean up old temporary sessions (older than 24 hours)
 */
export const cleanupTemporarySessions = (): void => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    const allSessions: PublicChatSession[] = JSON.parse(stored);
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

    const filtered = allSessions.filter((s) => {
      if (!s.isTemporary) return true;
      return new Date(s.updatedAt).getTime() > oneDayAgo;
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Error cleaning up temporary sessions:", error);
  }
};
