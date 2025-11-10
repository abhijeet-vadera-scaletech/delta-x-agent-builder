import { useQuery } from "@tanstack/react-query";
import { httpService } from "../../services/httpService";
import { API_CONFIG } from "../../shared/constants";
import type { Agent } from "../../types";

export const useGetAgent = (id: string, enabled = true) => {
  return useQuery<Agent, Error>({
    queryKey: ["agent", id],
    queryFn: async () => {
      const response = await httpService.get<Agent>(API_CONFIG.path.agent(id));
      return response;
    },
    enabled: !!id && enabled,
  });
};
