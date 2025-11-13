import { useQuery } from "@tanstack/react-query";
import { httpService } from "../../services/httpService";
import { API_CONFIG } from "../../shared/constants";
import type { AIInsight } from "../../types";

export const useGetAIInsights = () => {
  return useQuery<AIInsight[], Error>({
    queryKey: ["analytics", "ai-insights"],
    queryFn: async () => {
      const response = await httpService.get<AIInsight[]>(API_CONFIG.path.analyticsAIInsights);
      return response;
    },
    // Refetch every 5 minutes since AI insights are expensive to generate
    staleTime: 5 * 60 * 1000,
  });
};
