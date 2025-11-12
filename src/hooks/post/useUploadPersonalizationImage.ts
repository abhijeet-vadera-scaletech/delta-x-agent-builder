import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpService } from "../../services/httpService";
import { API_CONFIG } from "../../shared/constants";
import type { UploadImageResponse } from "../../types";

interface UploadPersonalizationImageRequest {
  personalizationId: string;
  image: File;
}

export const useUploadPersonalizationImage = () => {
  const queryClient = useQueryClient();

  return useMutation<UploadImageResponse, Error, UploadPersonalizationImageRequest>({
    mutationFn: async ({ personalizationId, image }: UploadPersonalizationImageRequest) => {
      const formData = new FormData();
      formData.append("image", image);

      const response = await httpService.post<UploadImageResponse>(
        `${API_CONFIG.baseUrl}/api/personalizations/${personalizationId}/image`,
        formData
      );
      return response;
    },
    onSuccess: (_, { personalizationId }) => {
      // Invalidate personalization queries to refetch updated personalization with new image
      queryClient.invalidateQueries({ queryKey: ["personalizations"] });
      queryClient.invalidateQueries({ queryKey: ["personalization", personalizationId] });
    },
  });
};
