import { useQuery } from "@tanstack/react-query";
import { httpService } from "../../services/httpService";
import { API_CONFIG } from "../../shared/constants";
import type { DashboardStats, AnalyticsQueryParams } from "../../types";

export const useGetDashboardStats = (params?: AnalyticsQueryParams) => {
  const queryParams = new URLSearchParams();
  
  if (params?.startDate) queryParams.append("startDate", params.startDate);
  if (params?.endDate) queryParams.append("endDate", params.endDate);
  if (params?.agentId) queryParams.append("agentId", params.agentId);
  
  const queryString = queryParams.toString();
  const url = queryString 
    ? `${API_CONFIG.path.analyticsDashboard}?${queryString}`
    : API_CONFIG.path.analyticsDashboard;

  return useQuery<DashboardStats, Error>({
    queryKey: ["analytics", "dashboard", params],
    queryFn: async () => {
      const response = await httpService.get<DashboardStats>(url);
      return response;
    },
  });
};
