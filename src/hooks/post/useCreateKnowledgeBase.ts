import { useMutation, useQueryClient } from '@tanstack/react-query';
import { httpService } from '../../services/httpService';
import { API_CONFIG } from '../../shared/constants';
import type { KnowledgeBase } from '../get/useGetKnowledgeBases';

export interface CreateKnowledgeBaseRequest {
  name: string;
  description?: string;
  fileIds?: string[];
  agentIds?: string[]; // Array of agent IDs to attach this knowledge base to
  metadata?: Record<string, unknown>;
  [key: string]: string | string[] | Record<string, unknown> | undefined;
}

export const useCreateKnowledgeBase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateKnowledgeBaseRequest) => {
      const payload: Record<string, unknown> = {
        name: data.name,
        ...(data.description && { description: data.description }),
        ...(data.fileIds && data.fileIds.length > 0 && { fileIds: data.fileIds }),
        ...(data.agentIds && data.agentIds.length > 0 && { agentIds: data.agentIds }),
        ...(data.metadata && { metadata: data.metadata }),
      };
      
      const response = await httpService.post<KnowledgeBase>(API_CONFIG.path.knowledgeBases, payload);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledgeBases'] });
    },
  });
};
