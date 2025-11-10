import { useQuery } from "@tanstack/react-query";
import { httpService } from "../../services/httpService";
import { API_CONFIG } from "../../shared/constants";
import type { AgentDetails } from "../../types";

export const useGetAgentDetails = (id: string, enabled = true) => {
  return useQuery<AgentDetails, Error>({
    queryKey: ["agent-details", id],
    queryFn: async () => {
      const response = await httpService.get<AgentDetails>(
        API_CONFIG.path.agentDetails(id)
      );
      return response;
    },
    enabled: !!id && enabled,
  });
};
