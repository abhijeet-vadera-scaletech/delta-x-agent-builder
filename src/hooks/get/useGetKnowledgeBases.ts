import { useQuery } from "@tanstack/react-query";
import { httpService } from "../../services/httpService";
import { API_CONFIG } from "@/shared/constants";

export interface KnowledgeBase {
  id: string;
  vectorStoreId: string;
  userId: string;
  name: string;
  description: string;
  fileCount: number;
  metadata?: Record<string, unknown>;
  files?: Array<{
    id: string;
    filename: string;
    bytes: number;
    mimeType: string;
  }>;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export const useGetKnowledgeBases = () => {
  return useQuery<KnowledgeBase[]>({
    queryKey: ["knowledgeBases"],
    queryFn: async () => {
      const response = await httpService.get<KnowledgeBase[]>(
        API_CONFIG.path.knowledgeBases
      );
      // httpService already unwraps the response and returns the data
      return response || [];
    },
  });
};
