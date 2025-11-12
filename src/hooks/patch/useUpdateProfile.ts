import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpService } from "../../services/httpService";
import { API_CONFIG } from "../../shared/constants";
import type { User, UpdateProfileRequest } from "../../types";

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation<User, Error, UpdateProfileRequest>({
    mutationFn: async (data: UpdateProfileRequest) => {
      const response = await httpService.patch<User, UpdateProfileRequest>(
        `${API_CONFIG.baseUrl}/api/users/profile/me`,
        data
      );
      return response;
    },
    onSuccess: (updatedUser) => {
      // Update the profile cache
      queryClient.setQueryData(["profile", "me"], updatedUser);
      
      // Also update any user cache if it exists
      queryClient.setQueryData(["user", updatedUser.id], updatedUser);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
};
