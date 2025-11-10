import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpService } from "../../services/httpService";
import { API_CONFIG } from "../../shared/constants";
import type { CreateAgentRequest, Agent } from "../../types";
import { showToast } from "../../utils/toast";

export const useCreateAgent = () => {
  const queryClient = useQueryClient();

  return useMutation<Agent, Error, CreateAgentRequest>({
    mutationFn: async (data: CreateAgentRequest) => {
      const response = await httpService.post<Agent, CreateAgentRequest>(
        API_CONFIG.path.agents,
        data
      );
      return response;
    },
    onSuccess: () => {
      // Invalidate and refetch agents list
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      queryClient.invalidateQueries({ queryKey: ["agent-stats"] });
      showToast.success("Agent created successfully! 🎉");
    },
    onError: (error: Error) => {
      showToast.error(error.message || "Failed to create agent");
    },
  });
};
