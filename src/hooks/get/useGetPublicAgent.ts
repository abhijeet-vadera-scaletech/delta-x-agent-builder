import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { API_CONFIG } from "../../shared/constants";
import type { Agent } from "../../types";

/**
 * Public hook to fetch agent data without authentication
 * Used for public agent preview pages
 */
export const useGetPublicAgent = (id: string, enabled = true) => {
  return useQuery<Agent, Error>({
    queryKey: ["public-agent", id],
    queryFn: async () => {
      const response = await axios.get<{
        data: Agent;
        isError: boolean;
        message: string | null;
      }>(`${API_CONFIG.baseUrl}${API_CONFIG.path.agent(id)}/`);

      if (response.data.isError) {
        throw new Error(response.data.message || "Failed to fetch agent");
      }

      return response.data.data;
    },
    enabled: !!id && enabled,
    retry: 1,
  });
};
