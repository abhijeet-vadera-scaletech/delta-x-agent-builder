// GET hooks - Agents
export { useGetAgents } from './get/useGetAgents';
export { useGetAgent } from './get/useGetAgent';
export { useGetPublicAgent } from './get/useGetPublicAgent';
export { useGetAgentDetails } from './get/useGetAgentDetails';
export { useGetAgentStats } from './get/useGetAgentStats';

// GET hooks - Users
export { useGetUsers } from './get/useGetUsers';
export { useGetUser } from './get/useGetUser';

// GET hooks - Knowledge Base
export { useGetKnowledgeBases } from './get/useGetKnowledgeBases';
export type { KnowledgeBase } from './get/useGetKnowledgeBases';

// POST hooks
export { useCreateAgent } from './post/useCreateAgent';
export { useLogin } from './post/useLogin';
export { useRegister } from './post/useRegister';
export { useCreateKnowledgeBase } from './post/useCreateKnowledgeBase';
export { useUploadFile } from './post/useUploadFile';
export type { UploadedFile, UploadFileRequest } from './post/useUploadFile';

// PATCH hooks
export { useUpdateAgent } from './patch/useUpdateAgent';
export { useUpdateKnowledgeBase } from './patch/useUpdateKnowledgeBase';

// DELETE hooks
export { useDeleteAgent } from './delete/useDeleteAgent';
export { usePermanentDeleteAgent } from './delete/usePermanentDeleteAgent';
export { useDeleteKnowledgeBase } from './delete/useDeleteKnowledgeBase';
