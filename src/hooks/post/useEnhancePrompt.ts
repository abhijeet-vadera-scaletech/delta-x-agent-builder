import { useMutation } from "@tanstack/react-query";
import { httpService } from "../../services/httpService";
import { API_CONFIG } from "../../shared/constants";
import type { EnhancePromptRequest, EnhancePromptResponse } from "../../types";

export const useEnhancePrompt = () => {
  return useMutation<EnhancePromptResponse, Error, EnhancePromptRequest>({
    mutationFn: async (data: EnhancePromptRequest) => {
      const response = await httpService.post<EnhancePromptResponse, EnhancePromptRequest>(
        `${API_CONFIG.baseUrl}/api/helper/openai/enhance-prompt`,
        data
      );
      return response;
    },
  });
};
