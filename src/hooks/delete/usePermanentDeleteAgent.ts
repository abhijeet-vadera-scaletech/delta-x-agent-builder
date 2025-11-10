import { useMutation, useQueryClient } from '@tanstack/react-query';
import { httpService } from '../../services/httpService';
import { API_CONFIG } from '../../shared/constants';
import { showToast } from '../../utils/toast';

export const usePermanentDeleteAgent = () => {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, string>({
    mutationFn: async (id: string) => {
      const response = await httpService.delete<{ message: string }>(API_CONFIG.path.agentPermanentDelete(id));
      return response;
    },
    onSuccess: (_data, agentId) => {
      // Invalidate and remove queries
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      queryClient.invalidateQueries({ queryKey: ['agent-stats'] });
      queryClient.removeQueries({ queryKey: ['agent', agentId] });
      queryClient.removeQueries({ queryKey: ['agent-details', agentId] });
      showToast.success('Agent permanently deleted! 🗑️');
    },
    onError: (error: Error) => {
      showToast.error(error.message || 'Failed to permanently delete agent');
    },
  });
};
