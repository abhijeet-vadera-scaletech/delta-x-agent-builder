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
    chatThreadStatus: (threadId: string) =>
      `/api/chat/thread/${threadId}/status`,
    chatStats: (agentId: string) => `/api/chat/stats/${agentId}`,
    chatSessions: "/api/chat/sessions",

    // Personalization
    personalizations: "/api/personalizations",
    personalization: (id: string) => `/api/personalizations/${id}`,

    // Analytics
    analyticsDashboard: "/api/analytics/dashboard",
    analyticsSessions: "/api/analytics/sessions",
    analyticsHighIntentUsers: "/api/analytics/high-intent-users",
    analyticsAIInsights: "/api/analytics/ai-insights",
    analyticsComplete: "/api/analytics/complete",

    // Auth Providers
    authProviders: "/api/auth/providers",
  },
};

export const DEFAULT_ITEMS_PER_PAGE = 25;

export const DEFAULT_THEME_PRESET = {
  light: {
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
  },
  dark: {
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
  },
};

// React Select Dark Mode Styles
// Note: Using 'any' types as required by react-select's style API
/* eslint-disable @typescript-eslint/no-explicit-any */
export const getReactSelectStyles = () => {
  const isDark = document.documentElement.classList.contains("dark");

  return {
    control: (base: any) => ({
      ...base,
      backgroundColor: isDark ? "#374151" : "#ffffff",
      borderColor: isDark ? "#4b5563" : "#d1d5db",
    }),
    menu: (base: any) => ({
      ...base,
      backgroundColor: isDark ? "#374151" : "#ffffff",
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isFocused
        ? isDark
          ? "#4b5563"
          : "#f3f4f6"
        : "transparent",
      color: isDark ? "#ffffff" : "#111827",
    }),
    multiValue: (base: any) => ({
      ...base,
      backgroundColor: isDark ? "#4b5563" : "#e5e7eb",
    }),
    multiValueLabel: (base: any) => ({
      ...base,
      color: isDark ? "#ffffff" : "#111827",
    }),
    multiValueRemove: (base: any) => ({
      ...base,
      color: isDark ? "#ffffff" : "#111827",
      ":hover": {
        backgroundColor: isDark ? "#374151" : "#d1d5db",
        color: isDark ? "#ffffff" : "#111827",
      },
    }),
    singleValue: (base: any) => ({
      ...base,
      color: isDark ? "#ffffff" : "#111827",
    }),
    input: (base: any) => ({
      ...base,
      color: isDark ? "#ffffff" : "#111827",
    }),
    placeholder: (base: any) => ({
      ...base,
      color: isDark ? "#9ca3af" : "#6b7280",
    }),
  };
};
/* eslint-enable @typescript-eslint/no-explicit-any */
