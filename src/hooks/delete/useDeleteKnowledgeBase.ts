import { useMutation, useQueryClient } from '@tanstack/react-query';
import { httpService } from '../../services/httpService';
import { API_CONFIG } from '../../shared/constants';

export const useDeleteKnowledgeBase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await httpService.delete<void>(API_CONFIG.path.knowledgeBase(id));
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledgeBases'] });
    },
  });
};
