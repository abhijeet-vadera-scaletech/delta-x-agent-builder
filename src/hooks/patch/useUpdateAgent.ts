import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpService } from "../../services/httpService";
import { API_CONFIG } from "../../shared/constants";
import type { UpdateAgentRequest, Agent } from "../../types";
import { showToast } from "../../utils/toast";

interface UpdateAgentVariables {
  id: string;
  data: UpdateAgentRequest;
}

export const useUpdateAgent = () => {
  const queryClient = useQueryClient();

  return useMutation<Agent, Error, UpdateAgentVariables>({
    mutationFn: async ({ id, data }: UpdateAgentVariables) => {
      const response = await httpService.patch<Agent, UpdateAgentRequest>(
        API_CONFIG.path.agent(id),
        data
      );
      return response;
    },
    onSuccess: (_data, variables) => {
      // Invalidate specific agent and list
      queryClient.invalidateQueries({ queryKey: ["agent", variables.id] });
      queryClient.invalidateQueries({
        queryKey: ["agent-details", variables.id],
      });
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      showToast.success("Agent updated successfully! ✅");
    },
    onError: (error: Error) => {
      showToast.error(error.message || "Failed to update agent");
    },
  });
};
