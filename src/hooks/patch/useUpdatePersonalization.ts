import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpService } from "../../services/httpService";
import { API_CONFIG } from "../../shared/constants";
import type { UpdatePersonalizationRequest, Personalization } from "../../types";
import { showToast } from "../../utils/toast";

export const useUpdatePersonalization = () => {
  const queryClient = useQueryClient();

  return useMutation<Personalization, Error, { id: string; data: UpdatePersonalizationRequest }>({
    mutationFn: async ({ id, data }) => {
      const response = await httpService.patch<Personalization, UpdatePersonalizationRequest>(
        API_CONFIG.path.personalization(id),
        data
      );
      return response;
    },
    onSuccess: (data) => {
      // Invalidate and refetch personalizations list and specific personalization
      queryClient.invalidateQueries({ queryKey: ["personalizations"] });
      queryClient.invalidateQueries({ queryKey: ["personalization", data.id] });
      showToast.success("Personalization updated successfully! ✨");
    },
    onError: (error: Error) => {
      showToast.error(error.message || "Failed to update personalization");
    },
  });
};
