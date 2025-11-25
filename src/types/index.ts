export interface ResponseObj<T> {
  data: T;
  isError: boolean;
  message: string | null;
}

export interface SignupResponse {
  user: User;
  access: string;
  refresh: string;
}

export interface ILoginResponse {
  user: User;
  access: string;
  refresh: string;
}

// User Types
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  bio?: string;
  role: "consultant" | "admin" | "user";
  createdAt: string;
  updatedAt: string;
  profileImage?: string;
}

// Auth Types
export interface LoginResponse {
  access_token: string;
  user: User;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  access_token: string;
  user: User;
}

// Profile Types
export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  company?: string;
  bio?: string;
}

export interface UploadImageResponse {
  imageUrl: string;
}

// Agent Types
export interface Agent {
  id: string;
  assistantId: string;
  name: string;
  description?: string;
  greetingMessage?: string;
  systemInstructions: string;
  tone?: string;
  personality?: string;
  model: string;
  vectorStoreId?: string;
  hasFileSearch: boolean;
  personalizationId?: string;
  tools?: Array<{ type: string }>;
  metadata?: Record<string, any>;
  isDeleted: boolean;
  isActive: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
  personalization?: Personalization;
  user?: User;
}

export interface MetaResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CreateAgentRequest {
  name: string;
  description?: string;
  greetingMessage?: string;
  systemInstructions: string;
  tone?: string;
  personality?: string;
  model?: string;
  hasFileSearch?: boolean;
  vectorStoreId?: string;
  personalizationId?: string | null;
}

export interface UpdateAgentRequest {
  name?: string;
  description?: string;
  greetingMessage?: string;
  systemInstructions?: string;
  tone?: string;
  personality?: string;
  vectorStoreId?: string;
  personalizationId?: string | null;
}

export interface AgentStats {
  totalAgents: number;
  activeAgents: number;
  inactiveAgents: number;
  withFileSearch: number;
  deleted: number;
}

export interface AgentDetails extends Agent {
  openai_details: {
    id: string;
    object: string;
    created_at: number;
    name: string;
    model: string;
    instructions: string;
    tools: Array<{ type: string }>;
    tool_resources?: {
      file_search?: {
        vector_store_ids: string[];
      };
    };
    metadata: Record<string, any>;
    temperature: number;
    top_p: number;
  };
}

// Chat Types
export interface ChatMessage {
  id: string;
  messageId: string;
  threadId: string;
  runId?: string;
  role: "user" | "assistant";
  content: string;
  metadata?: Record<string, any>;
  annotations?: any[];
  createdAt: string;
}

export interface ChatThread {
  id: string;
  threadId: string;
  agentId: string;
  userId: string;
  title: string;
  metadata?: Record<string, any>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  messageCount?: number;
  lastMessage?: {
    content: string;
    role: string;
    createdAt: string;
  };
}

export interface SendMessageRequest {
  agentId: string;
  message: string;
  threadId?: string;
}

export interface StreamEvent {
  type:
    | "session"
    | "thread"
    | "thread.run.created"
    | "thread.run.in_progress"
    | "thread.run.step.in_progress"
    | "thread.message.created"
    | "thread.message.in_progress"
    | "thread.message.delta"
    | "thread.message.completed"
    | "thread.run.completed"
    | "done"
    | "error";
  userId?: string;
  isNewUser?: boolean;
  environment?: string;
  thread?: ChatThread & { id?: string };
  data?: any;
  message?: string;
  object?: string;
  created_at?: number;
  assistant_id?: string;
  delta?: {
    content?: Array<{
      index?: number;
      type?: string;
      text?: {
        value?: string;
        annotations?: any[];
      };
    }>;
  };
}

// Personalization Types
export interface Personalization extends PersonalizationConfig {
  id: string;
  attachedAgents?: Array<{
    id: string;
    name: string;
  }>;
  agentCount?: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PersonalizationConfig {
  name?: string;
  headerGradientStart: string;
  headerGradientEnd: string;
  chatBackgroundColor: string;
  senderMessageBackgroundColor: string; // Background color for sender messages
  incomingMessageBackgroundColor: string; // Background color for incoming messages
  sendButtonBackgroundColor: string; // Background color for send button
  agentAvatar?: string;
  // Optional text colors (will use defaults if not provided)
  senderMessageTextColor?: string;
  incomingMessageTextColor?: string;
  sendButtonTextColor?: string;
  inputBackgroundColor?: string;
  inputTextColor?: string;
}

export interface CreatePersonalizationRequest {
  name: string;
  agentAvatar?: string;
  headerGradientStart: string;
  headerGradientEnd: string;
  senderMessageBackgroundColor: string;
  incomingMessageBackgroundColor: string;
  sendButtonBackgroundColor: string;
  chatBackgroundColor: string;
  inputBackgroundColor: string;
  inputTextColor: string;
  incomingMessageTextColor: string;
  senderMessageTextColor: string;
  sendButtonTextColor: string;
  agentIds?: string[]; // Array of agent IDs to attach this personalization to
}

export interface UpdatePersonalizationRequest {
  name?: string;
  agentAvatar?: string;
  headerGradientStart?: string;
  headerGradientEnd?: string;
  senderMessageBackgroundColor?: string;
  incomingMessageBackgroundColor?: string;
  sendButtonBackgroundColor?: string;
  chatBackgroundColor?: string;
  inputBackgroundColor?: string;
  inputTextColor?: string;
  incomingMessageTextColor?: string;
  senderMessageTextColor?: string;
  sendButtonTextColor?: string;
  agentIds?: string[]; // Array of agent IDs to attach this personalization to
}

// AI Enhancement Types
export interface EnhancePromptRequest {
  userContext: string;
}

export interface EnhancePromptResponse {
  enhancedInstruction: string;
}

// Analytics Types
export interface DashboardStats {
  totalSessions: number;
  uniqueUsers: number;
  avgIntentScore: number;
  highIntentUsers: number;
}

export interface AnalyticsSession {
  id: string;
  threadId: string;
  agentId: string;
  agentName: string;
  userId: string;
  userName: string;
  messageCount: number;
  intentScore: number;
  lastMessageAt: string;
  createdAt: string;
}

export interface HighIntentUser {
  userId: string;
  userName: string;
  email: string;
  sessionCount: number;
  avgIntentScore: number;
  lastInteraction: string;
  totalMessages: number;
}

export interface AIInsight {
  insight: string;
  category: "engagement" | "conversion" | "performance" | "recommendation";
  confidence: number;
  generatedAt: string;
}

export interface CompleteAnalytics {
  stats: DashboardStats;
  recentSessions: AnalyticsSession[];
  highIntentUsers: HighIntentUser[];
  aiInsights: AIInsight[];
}

export type IntentLevel = "all" | "high" | "medium" | "low";

export interface AnalyticsQueryParams {
  startDate?: string;
  endDate?: string;
  agentId?: string;
  intentLevel?: IntentLevel;
  limit?: number;
}
