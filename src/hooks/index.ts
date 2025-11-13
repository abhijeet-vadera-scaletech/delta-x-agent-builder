// GET hooks - Agents
export { useGetAgents } from './get/useGetAgents';
export { useGetAgent } from './get/useGetAgent';
export { useGetPublicAgent } from './get/useGetPublicAgent';
export { useGetAgentDetails } from './get/useGetAgentDetails';
export { useGetAgentStats } from './get/useGetAgentStats';

// GET hooks - Users
export { useGetUsers } from './get/useGetUsers';
export { useGetUser } from './get/useGetUser';
export { useGetProfile } from './get/useGetProfile';

// GET hooks - Knowledge Base
export { useGetKnowledgeBases } from './get/useGetKnowledgeBases';
export type { KnowledgeBase } from './get/useGetKnowledgeBases';

// GET hooks - Personalization
export { useGetPersonalizations } from './get/useGetPersonalizations';
export { useGetPersonalization } from './get/useGetPersonalization';

// GET hooks - Analytics
export { useGetDashboardStats } from './get/useGetDashboardStats';
export { useGetAnalyticsSessions } from './get/useGetAnalyticsSessions';
export { useGetHighIntentUsers } from './get/useGetHighIntentUsers';
export { useGetAIInsights } from './get/useGetAIInsights';
export { useGetCompleteAnalytics } from './get/useGetCompleteAnalytics';

// POST hooks
export { useCreateAgent } from './post/useCreateAgent';
export { useLogin } from './post/useLogin';
export { useRegister } from './post/useRegister';
export { useCreateKnowledgeBase } from './post/useCreateKnowledgeBase';
export { useCreatePersonalization } from './post/useCreatePersonalization';
export { useUploadFile } from './post/useUploadFile';
export type { UploadedFile, UploadFileRequest } from './post/useUploadFile';
export { useUploadProfileImage } from './post/useUploadProfileImage';
export { useUploadPersonalizationImage } from './post/useUploadPersonalizationImage';
export { useEnhancePrompt } from './post/useEnhancePrompt';

// PATCH hooks
export { useUpdateAgent } from './patch/useUpdateAgent';
export { useActivateAgent } from './patch/useActivateAgent';
export { useDeactivateAgent } from './patch/useDeactivateAgent';
export { useUpdateKnowledgeBase } from './patch/useUpdateKnowledgeBase';
export { useUpdatePersonalization } from './patch/useUpdatePersonalization';
export { useUpdateProfile } from './patch/useUpdateProfile';

// DELETE hooks
export { useDeleteAgent } from './delete/useDeleteAgent';
export { usePermanentDeleteAgent } from './delete/usePermanentDeleteAgent';
export { useDeleteKnowledgeBase } from './delete/useDeleteKnowledgeBase';
export { useDeletePersonalization } from './delete/useDeletePersonalization';
