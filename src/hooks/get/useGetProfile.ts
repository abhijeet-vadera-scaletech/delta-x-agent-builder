import { useQuery } from "@tanstack/react-query";
import { httpService } from "../../services/httpService";
import { API_CONFIG } from "../../shared/constants";
import type { User } from "../../types";

export const useGetProfile = (enabled = true) => {
  return useQuery<User, Error>({
    queryKey: ["profile", "me"],
    queryFn: async () => {
      const response = await httpService.get<User>(`${API_CONFIG.baseUrl}/api/users/profile/me`);
      return response;
    },
    enabled,
  });
};
