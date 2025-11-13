import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpService } from "../../services/httpService";
import { API_CONFIG } from "../../shared/constants";
import { showToast } from "../../utils/toast";
import type { Agent } from "../../types";

export const useDeactivateAgent = () => {
  const queryClient = useQueryClient();

  return useMutation<Agent, Error, string>({
    mutationFn: async (agentId: string) => {
      const response = await httpService.patch<Agent>(
        API_CONFIG.path.agentDeactivate(agentId)
      );
      return response;
    },
    onSuccess: (data) => {
      // Invalidate and refetch agents list
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      // Invalidate agent stats
      queryClient.invalidateQueries({ queryKey: ["agent-stats"] });
      // Invalidate specific agent
      queryClient.invalidateQueries({ queryKey: ["agent", data.id] });
      // Invalidate analytics data
      queryClient.invalidateQueries({ queryKey: ["complete-analytics"] });
      
      showToast.success(`Agent "${data.name}" deactivated successfully! ⏸️`);
    },
    onError: (error) => {
      showToast.error(`Failed to deactivate agent: ${error.message}`);
    },
  });
};
