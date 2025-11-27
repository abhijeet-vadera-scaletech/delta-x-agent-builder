import { useQuery } from "@tanstack/react-query";
import { httpService } from "../../services/httpService";
import { API_CONFIG } from "../../shared/constants";

export interface AuthProvider {
  id: string;
  name: string;
  displayName: string;
  icon: string;
}

export const useGetAuthProviders = () => {
  return useQuery<AuthProvider[], Error>({
    queryKey: ["auth-providers"],
    queryFn: async () => {
      const response = await httpService.get<AuthProvider[]>(
        API_CONFIG.path.authProviders
      );
      return response;
    },
  });
};
