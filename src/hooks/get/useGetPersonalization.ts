import { useQuery } from "@tanstack/react-query";
import { httpService } from "../../services/httpService";
import { API_CONFIG } from "../../shared/constants";
import type { Personalization } from "../../types";

export const useGetPersonalization = (id: string) => {
  return useQuery<Personalization, Error>({
    queryKey: ["personalization", id],
    queryFn: async () => {
      const response = await httpService.get<Personalization>(API_CONFIG.path.personalization(id));
      return response;
    },
    enabled: !!id,
  });
};
