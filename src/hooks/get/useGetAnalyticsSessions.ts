import { useQuery } from "@tanstack/react-query";
import { httpService } from "../../services/httpService";
import { API_CONFIG } from "../../shared/constants";
import type { AnalyticsSession, AnalyticsQueryParams } from "../../types";

export const useGetAnalyticsSessions = (params?: AnalyticsQueryParams) => {
  const queryParams = new URLSearchParams();
  
  if (params?.intentLevel && params.intentLevel !== "all") {
    queryParams.append("intentLevel", params.intentLevel);
  }
  if (params?.agentId) queryParams.append("agentId", params.agentId);
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  
  const queryString = queryParams.toString();
  const url = queryString 
    ? `${API_CONFIG.path.analyticsSessions}?${queryString}`
    : API_CONFIG.path.analyticsSessions;

  return useQuery<AnalyticsSession[], Error>({
    queryKey: ["analytics", "sessions", params],
    queryFn: async () => {
      const response = await httpService.get<AnalyticsSession[]>(url);
      return response;
    },
  });
};
