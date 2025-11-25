import { useQuery } from "@tanstack/react-query";
import { httpService } from "../../services/httpService";
import { API_CONFIG } from "../../shared/constants";
import type { Agent, MetaResponse } from "../../types";

export interface AgentResponse {
  items: Agent[];
  meta: MetaResponse;
}

export const useGetAgents = () => {
  return useQuery<AgentResponse, Error>({
    queryKey: ["agents"],
    queryFn: async () => {
      const response = await httpService.get<AgentResponse>(
        API_CONFIG.path.agents
      );
      return response;
    },
  });
};
