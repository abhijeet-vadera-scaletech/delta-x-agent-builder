export const SIDEBAR = {
  EXPANDED_WIDTH: "270px",
  COLLAPSED_WIDTH: "80px",
} as const;

export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
  path: {
    // Auth
    login: "/api/auth/login",
    register: "/api/auth/register",
    currentUser: "/api/auth/me",
    logout: "/api/auth/logout",

    // Users
    users: "/api/users",
    user: (id: string) => `/api/users/${id}`,

    // Agents
    agents: "/api/agents",
    agent: (id: string) => `/api/agents/${id}`,
    agentDetails: (id: string) => `/api/agents/${id}/details`,
    agentStats: "/api/agents/stats",
    agentActivate: (id: string) => `/api/agents/${id}/activate`,
    agentDeactivate: (id: string) => `/api/agents/${id}/deactivate`,
    agentPermanentDelete: (id: string) => `/api/agents/${id}/permanent`,

    // Knowledge Base
    knowledgeBases: "/api/knowledge-base",
    knowledgeBase: (id: string) => `/api/knowledge-base/${id}`,
    knowledgeBaseFiles: (id: string) => `/api/knowledge-base/${id}/files`,
    knowledgeBaseFile: (id: string) => `/api/knowledge-base/${id}/files`,
    knowledgeBaseFileUpload: (id: string) => `/api/knowledge-base/${id}/files`,
    knowledgeBaseFileDelete: (id: string) => `/api/knowledge-base/${id}/files`,

    // Chat
    chatSend: "/api/chat/send",
    chatMessages: (threadId: string) => `/api/chat/messages/${threadId}`,
    chatThreads: (agentId: string) => `/api/chat/threads/${agentId}`,
    chatThread: (threadId: string) => `/api/chat/thread/${threadId}`,
    chatStats: (agentId: string) => `/api/chat/stats/${agentId}`,

    // Personalization
    personalizations: "/api/personalizations",
    personalization: (id: string) => `/api/personalizations/${id}`,

    // Analytics
    analyticsDashboard: "/api/analytics/dashboard",
    analyticsSessions: "/api/analytics/sessions",
    analyticsHighIntentUsers: "/api/analytics/high-intent-users",
    analyticsAIInsights: "/api/analytics/ai-insights",
    analyticsComplete: "/api/analytics/complete",
  },
};

export const DEFAULT_ITEMS_PER_PAGE = 25;
