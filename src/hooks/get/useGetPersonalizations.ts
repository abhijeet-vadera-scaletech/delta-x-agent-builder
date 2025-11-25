import { useQuery } from "@tanstack/react-query";
import { httpService } from "../../services/httpService";
import { API_CONFIG } from "../../shared/constants";
import type { MetaResponse, Personalization } from "../../types";

export interface PersonalizationResponse {
  items: Personalization[];
  meta: MetaResponse;
}

export const useGetPersonalizations = () => {
  return useQuery<PersonalizationResponse, Error>({
    queryKey: ["personalizations"],
    queryFn: async () => {
      const response = await httpService.get<PersonalizationResponse>(
        API_CONFIG.path.personalizations
      );
      return response;
    },
  });
};
