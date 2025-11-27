import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { API_CONFIG } from "../../shared/constants";

export interface ChatSession {
  id: string;
  agentId: string;
  agentName: string;
  userId: string;
  title: string;
  isActive: boolean;
  isArchived: boolean;
  isDeleted: boolean;
  messageCount: number;
  lastMessageAt: string;
  lastMessage: {
    id: string;
    content: string;
    role: "user" | "assistant";
    createdAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface ChatSessionsResponse {
  items: ChatSession[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const useGetChatSessions = (idToken?: string, isArchived?: boolean) => {
  return useQuery<ChatSessionsResponse, Error>({
    queryKey: ["chat-sessions", idToken, isArchived],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (isArchived === true) {
        params.append("isArchived", String(isArchived));
      }

      // Build headers
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (idToken) {
        headers["Authorization"] = `Bearer ${idToken}`;
      }

      const url = `${API_CONFIG.baseUrl}${API_CONFIG.path.chatSessions}${
        params.toString() ? `?${params.toString()}` : ""
      }`;
      const response = await axios.get<{
        isError: boolean;
        data: ChatSessionsResponse;
        message: string;
      }>(url, { headers });

      if (response.data.isError) {
        throw new Error(
          response.data.message || "Failed to fetch chat sessions"
        );
      }

      return response.data.data;
    },
    enabled: !!idToken,
  });
};
