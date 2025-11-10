import { useMutation, useQueryClient } from '@tanstack/react-query';
import { httpService } from '../../services/httpService';
import { API_CONFIG } from '../../shared/constants';
import { showToast } from '../../utils/toast';

export const useDeleteAgent = () => {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, string>({
    mutationFn: async (id: string) => {
      const response = await httpService.delete<{ message: string }>(API_CONFIG.path.agent(id));
      return response;
    },
    onSuccess: (_data, agentId) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      queryClient.invalidateQueries({ queryKey: ['agent-stats'] });
      queryClient.removeQueries({ queryKey: ['agent', agentId] });
      queryClient.removeQueries({ queryKey: ['agent-details', agentId] });
      showToast.success('Agent deleted successfully! 🗑️');
    },
    onError: (error: Error) => {
      showToast.error(error.message || 'Failed to delete agent');
    },
  });
};
