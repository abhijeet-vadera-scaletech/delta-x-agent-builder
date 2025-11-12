import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpService } from "../../services/httpService";
import { API_CONFIG } from "../../shared/constants";
import type { UploadImageResponse } from "../../types";

interface UploadProfileImageRequest {
  image: File;
}

export const useUploadProfileImage = () => {
  const queryClient = useQueryClient();

  return useMutation<UploadImageResponse, Error, UploadProfileImageRequest>({
    mutationFn: async ({ image }: UploadProfileImageRequest) => {
      const formData = new FormData();
      formData.append("image", image);

      const response = await httpService.post<UploadImageResponse>(
        `${API_CONFIG.baseUrl}/api/users/profile/image`,
        formData
      );
      return response;
    },
    onSuccess: () => {
      // Invalidate profile queries to refetch updated profile with new image
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
};
