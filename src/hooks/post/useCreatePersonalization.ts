import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpService } from "../../services/httpService";
import { API_CONFIG } from "../../shared/constants";
import type { CreatePersonalizationRequest, Personalization } from "../../types";
import { showToast } from "../../utils/toast";

export const useCreatePersonalization = () => {
  const queryClient = useQueryClient();

  return useMutation<Personalization, Error, CreatePersonalizationRequest>({
    mutationFn: async (data: CreatePersonalizationRequest) => {
      const response = await httpService.post<Personalization, CreatePersonalizationRequest>(
        API_CONFIG.path.personalizations,
        data
      );
      return response;
    },
    onSuccess: () => {
      // Invalidate and refetch personalizations list
      queryClient.invalidateQueries({ queryKey: ["personalizations"] });
      showToast.success("Personalization created successfully! 🎨");
    },
    onError: (error: Error) => {
      showToast.error(error.message || "Failed to create personalization");
    },
  });
};
