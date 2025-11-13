import { useQuery } from "@tanstack/react-query";
import { httpService } from "../../services/httpService";
import { API_CONFIG } from "../../shared/constants";
import type { HighIntentUser, AnalyticsQueryParams } from "../../types";

export const useGetHighIntentUsers = (params?: Pick<AnalyticsQueryParams, "limit">) => {
  const queryParams = new URLSearchParams();
  
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  
  const queryString = queryParams.toString();
  const url = queryString 
    ? `${API_CONFIG.path.analyticsHighIntentUsers}?${queryString}`
    : API_CONFIG.path.analyticsHighIntentUsers;

  return useQuery<HighIntentUser[], Error>({
    queryKey: ["analytics", "high-intent-users", params],
    queryFn: async () => {
      const response = await httpService.get<HighIntentUser[]>(url);
      return response;
    },
  });
};
