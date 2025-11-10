import { useMutation } from "@tanstack/react-query";
import { httpService } from "../../services/httpService";
import { API_CONFIG } from "../../shared/constants";
import type { RegisterRequest, RegisterResponse } from "../../types";
import { showToast } from "../../utils/toast";

export const useRegister = () => {
  return useMutation<RegisterResponse, Error, RegisterRequest>({
    mutationFn: async (data: RegisterRequest) => {
      const response = await httpService.post<
        RegisterResponse,
        RegisterRequest
      >(API_CONFIG.path.register, data);
      return response;
    },
    onSuccess: () => {
      showToast.success("Account created successfully! 🎉");
    },
    onError: (error: Error) => {
      showToast.error(error.message || "Registration failed");
    },
  });
};
