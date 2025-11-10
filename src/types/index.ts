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
  role: "consultant" | "admin" | "user";
  createdAt: string;
  updatedAt: string;
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
  tools?: Array<{ type: string }>;
  metadata?: Record<string, any>;
  isDeleted: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
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
}

export interface UpdateAgentRequest {
  name?: string;
  description?: string;
  greetingMessage?: string;
  systemInstructions?: string;
  tone?: string;
  personality?: string;
  vectorStoreId?: string;
}

export interface AgentStats {
  total: number;
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
