import { useQuery } from "@tanstack/react-query";
import { httpService } from "../../services/httpService";
import { API_CONFIG } from "../../shared/constants";
import type { Personalization } from "../../types";

export const useGetPersonalizations = () => {
  return useQuery<Personalization[], Error>({
    queryKey: ["personalizations"],
    queryFn: async () => {
      const response = await httpService.get<Personalization[]>(API_CONFIG.path.personalizations);
      return response;
    },
  });
};
