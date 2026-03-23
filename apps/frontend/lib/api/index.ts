/**
 * API Module Exports
 *
 * Centralized exports for all API-related functionality.
 */

// Client utilities
export {
  API_URL,
  API_BASE,
  apiFetch,
  apiPost,
  apiPatch,
  apiPut,
  apiDelete,
  getUploadUrl,
} from './client';

// Resume operations
export {
  uploadJobDescriptions,
  improveResume,
  previewImproveResume,
  confirmImproveResume,
  fetchResume,
  fetchResumeList,
  updateResume,
  downloadResumePdf,
  deleteResume,
  type ResumeListItem,
} from './resume';

// Application operations
export {
  fetchApplications,
  fetchApplication,
  fetchApplicationConfig,
  createApplication,
  updateApplication,
  updateApplicationStatus,
  indexApplicationsByResumeId,
  resolveApplicationByResumeId,
  type ApplicationStatusHistorySource,
  type ApplicationStatusHistoryEntry,
  type ApplicationRecord,
  type ApplicationListItem,
  type ApplicationListResponse,
  type ApplicationConfig,
  type ApplicationConfigResponse,
  type ApplicationConfigUpdate,
  type CreateApplicationRequest,
  type UpdateApplicationRequest,
  type UpdateApplicationStatusRequest,
  type ApplicationListFilters,
} from './applications';

// Config operations
export {
  fetchLlmConfig,
  fetchLlmApiKey,
  updateLlmConfig,
  updateLlmApiKey,
  testLlmConnection,
  fetchSystemStatus,
  PROVIDER_INFO,
  fetchPromptConfig,
  updatePromptConfig,
  type LLMProvider,
  type LLMConfig,
  type LLMConfigUpdate,
  type DatabaseStats,
  type SystemStatus,
  type LLMHealthCheck,
  type PromptOption,
  type PromptConfig,
  type PromptConfigUpdate,
} from './config';
