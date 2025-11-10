import { useQuery } from "@tanstack/react-query";
import { httpService } from "../../services/httpService";
import { API_CONFIG } from "../../shared/constants";
import type { Agent } from "../../types";

export const useGetAgents = () => {
  return useQuery<Agent[], Error>({
    queryKey: ["agents"],
    queryFn: async () => {
      const response = await httpService.get<Agent[]>(API_CONFIG.path.agents);
      return response;
    },
  });
};
