import { useMutation, useQueryClient } from '@tanstack/react-query';
import { httpService } from '../../services/httpService';

export interface UploadedFile {
  id: string;
  fileId: string;
  userId: string;
  filename: string;
  bytes: number;
  purpose: string;
  mimeType: string;
  expiresAt: number | null;
  metadata?: Record<string, unknown>;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UploadFileRequest {
  file: File;
  purpose?: 'assistants' | 'batch' | 'fine-tune' | 'vision' | 'user_data' | 'evals';
  metadata?: Record<string, unknown>;
}

export const useUploadFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UploadFileRequest) => {
      const formData = new FormData();
      formData.append('file', data.file);
      if (data.purpose) {
        formData.append('purpose', data.purpose);
      }
      if (data.metadata) {
        formData.append('metadata', JSON.stringify(data.metadata));
      }
      
      const response = await httpService.post<UploadedFile>('/api/files/upload', formData);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
  });
};
