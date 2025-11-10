import { useQuery } from "@tanstack/react-query";
import { httpService } from "../../services/httpService";
import { API_CONFIG } from "../../shared/constants";
import type { AgentStats } from "../../types";

export const useGetAgentStats = () => {
  return useQuery<AgentStats, Error>({
    queryKey: ["agent-stats"],
    queryFn: async () => {
      const response = await httpService.get<AgentStats>(
        API_CONFIG.path.agentStats
      );
      return response;
    },
  });
};
