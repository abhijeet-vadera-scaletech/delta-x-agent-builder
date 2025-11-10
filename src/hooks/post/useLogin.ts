import { useMutation } from "@tanstack/react-query";
import { httpService } from "../../services/httpService";
import { API_CONFIG } from "../../shared/constants";
import type { LoginResponse } from "../../types";
import { showToast } from "../../utils/toast";

interface LoginCredentials {
  email: string;
  password: string;
}

export const useLogin = () => {
  return useMutation<LoginResponse, Error, LoginCredentials>({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await httpService.post<LoginResponse, LoginCredentials>(
        API_CONFIG.path.login,
        credentials
      );
      return response;
    },
    onSuccess: () => {
      showToast.success("Welcome back! 👋");
    },
    onError: (error: Error) => {
      showToast.error(error.message || "Login failed");
    },
  });
};
