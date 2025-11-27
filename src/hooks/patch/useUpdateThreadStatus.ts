import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { API_CONFIG } from "../../shared/constants";
import { showToast } from "../../utils/toast";

interface UpdateThreadStatusRequest {
  isArchived?: boolean;
  isDeleted?: boolean;
}

interface UpdateThreadStatusResponse {
  id: string;
  threadId: string;
  isArchived: boolean;
  isDeleted: boolean;
  updatedAt: string;
}

export const useUpdateThreadStatus = (idToken?: string) => {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateThreadStatusResponse,
    Error,
    { threadId: string; data: UpdateThreadStatusRequest }
  >({
    mutationFn: async ({ threadId, data }) => {
      // Build headers
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (idToken) {
        headers["Authorization"] = `Bearer ${idToken}`;
      }

      const url = `${API_CONFIG.baseUrl}${API_CONFIG.path.chatThreadStatus(
        threadId
      )}`;
      const response = await axios.patch<{
        isError: boolean;
        data: UpdateThreadStatusResponse;
        message: string;
      }>(url, data, { headers });

      if (response.data.isError) {
        throw new Error(
          response.data.message || "Failed to update thread status"
        );
      }

      return response.data.data;
    },
    onSuccess: (data) => {
      // Invalidate chat sessions queries
      queryClient.invalidateQueries({ queryKey: ["chat-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["chat-messages"] });

      if (data.isArchived) {
        showToast.success("Thread archived successfully");
      } else if (data.isDeleted) {
        showToast.success("Thread deleted successfully");
      } else {
        showToast.success("Thread restored successfully");
      }
    },
    onError: (error) => {
      showToast.error(error.message || "Failed to update thread status");
    },
  });
};
