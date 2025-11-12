import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpService } from "../../services/httpService";
import { API_CONFIG } from "../../shared/constants";
import { showToast } from "../../utils/toast";

export const useDeletePersonalization = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      await httpService.delete(API_CONFIG.path.personalization(id));
    },
    onSuccess: () => {
      // Invalidate and refetch personalizations list
      queryClient.invalidateQueries({ queryKey: ["personalizations"] });
      showToast.success("Personalization deleted successfully! 🗑️");
    },
    onError: (error: Error) => {
      showToast.error(error.message || "Failed to delete personalization");
    },
  });
};
