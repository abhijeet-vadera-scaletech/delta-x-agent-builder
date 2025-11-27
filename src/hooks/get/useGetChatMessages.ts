import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { API_CONFIG } from "../../shared/constants";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  metadata?: {
    environment?: string;
    [key: string]: unknown;
  };
}

export interface ChatThread {
  id: string;
  title: string;
  agentId: string;
  agentName: string;
  isArchived: boolean;
  isDeleted: boolean;
  createdAt: string;
}

interface ChatMessagesResponse {
  thread: ChatThread;
  messages: ChatMessage[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    page: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export const useGetChatMessages = (
  idToken?: string,
  threadId?: string | null
) => {
  return useQuery<ChatMessagesResponse, Error>({
    queryKey: ["chat-messages", idToken, threadId],
    queryFn: async () => {
      if (!threadId) {
        throw new Error("Thread ID is required");
      }

      // Build headers
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (idToken) {
        headers["Authorization"] = `Bearer ${idToken}`;
      }

      const url = `${API_CONFIG.baseUrl}${API_CONFIG.path.chatMessages(
        threadId
      )}`;
      const response = await axios.get<{
        isError: boolean;
        data: ChatMessagesResponse;
        message: string;
      }>(url, { headers });

      if (response.data.isError) {
        throw new Error(
          response.data.message || "Failed to fetch chat messages"
        );
      }

      return response.data.data;
    },
    enabled: !!threadId && !!idToken,
    staleTime: 0,
  });
};
