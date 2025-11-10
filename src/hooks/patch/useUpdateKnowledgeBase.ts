import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpService } from "../../services/httpService";
import { API_CONFIG } from "../../shared/constants";
import type { KnowledgeBase } from "../get/useGetKnowledgeBases";

interface UpdateKnowledgeBaseRequest {
  name?: string;
  description?: string;
  addFileIds?: string[];
  removeFileIds?: string[];
}

export const useUpdateKnowledgeBase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateKnowledgeBaseRequest;
    }) => {
      const response = await httpService.patch<
        KnowledgeBase,
        UpdateKnowledgeBaseRequest
      >(API_CONFIG.path.knowledgeBase(id), data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledgeBases"] });
    },
  });
};
