import { useQuery } from "@tanstack/react-query";
import { httpService } from "../../services/httpService";
import { API_CONFIG } from "../../shared/constants";
import type { User } from "../../types";

export const useGetUsers = () => {
  return useQuery<User[], Error>({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await httpService.get<User[]>(API_CONFIG.path.users);
      return response;
    },
  });
};
