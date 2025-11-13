import { useQuery } from "@tanstack/react-query";
import { httpService } from "../../services/httpService";
import { API_CONFIG } from "../../shared/constants";
import type { CompleteAnalytics, AnalyticsQueryParams } from "../../types";

export const useGetCompleteAnalytics = (params?: Pick<AnalyticsQueryParams, "intentLevel">) => {
  const queryParams = new URLSearchParams();
  
  if (params?.intentLevel && params.intentLevel !== "all") {
    queryParams.append("intentLevel", params.intentLevel);
  }
  
  const queryString = queryParams.toString();
  const url = queryString 
    ? `${API_CONFIG.path.analyticsComplete}?${queryString}`
    : API_CONFIG.path.analyticsComplete;

  return useQuery<CompleteAnalytics, Error>({
    queryKey: ["analytics", "complete", params],
    queryFn: async () => {
      const response = await httpService.get<CompleteAnalytics>(url);
      return response;
    },
    // Refetch every 2 minutes for dashboard data
    staleTime: 2 * 60 * 1000,
  });
};
