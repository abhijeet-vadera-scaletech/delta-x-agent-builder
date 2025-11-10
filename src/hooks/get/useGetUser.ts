import { useQuery } from "@tanstack/react-query";
import { httpService } from "../../services/httpService";
import { API_CONFIG } from "../../shared/constants";
import type { User } from "../../types";

export const useGetUser = (id: string, enabled = true) => {
  return useQuery<User, Error>({
    queryKey: ["user", id],
    queryFn: async () => {
      const response = await httpService.get<User>(API_CONFIG.path.user(id));
      return response;
    },
    enabled: !!id && enabled,
  });
};
