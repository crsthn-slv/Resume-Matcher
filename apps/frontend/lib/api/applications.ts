import { apiFetch, apiPatch, apiPost } from './client';

export type ApplicationStatusHistorySource = 'manual_create' | 'tailor_create' | 'status_change';

export interface ApplicationStatusHistoryEntry {
  from_status: string | null;
  to_status: string;
  changed_at: string;
  source: ApplicationStatusHistorySource;
}

export interface ApplicationRecord {
  application_id: string;
  company: string;
  role: string;
  status: string;
  job_url: string | null;
  notes: string | null;
  resume_id: string | null;
  job_id: string | null;
  status_history: ApplicationStatusHistoryEntry[];
  created_at: string;
  updated_at: string;
}

export interface ApplicationListItem extends ApplicationRecord {
  resume_title: string | null;
  has_job_description: boolean;
}

export interface ApplicationListResponse {
  items: ApplicationListItem[];
}

export interface ApplicationConfig {
  statuses: string[];
}

export type ApplicationConfigResponse = ApplicationConfig;
export type ApplicationConfigUpdate = ApplicationConfig;

export interface CreateApplicationRequest {
  company: string;
  role: string;
  status?: string | null;
  job_url?: string | null;
  notes?: string | null;
  resume_id?: string | null;
  job_id?: string | null;
  job_description?: string | null;
}

export interface UpdateApplicationRequest {
  company?: string | null;
  role?: string | null;
  job_url?: string | null;
  notes?: string | null;
  resume_id?: string | null;
  job_id?: string | null;
}

export interface UpdateApplicationStatusRequest {
  status: string;
}

export interface ApplicationListFilters {
  q?: string;
  status?: string[];
}

interface ApplicationReference {
  resume_id?: string | null;
}

function normalizeApplicationId(applicationId: string): string {
  const normalized = applicationId.trim();
  if (!normalized) {
    throw new Error('Application ID is required.');
  }
  return normalized;
}

function buildApplicationQueryParams(filters: ApplicationListFilters = {}): string {
  const params = new URLSearchParams();

  if (filters.q?.trim()) {
    params.set('q', filters.q.trim());
  }

  if (filters.status?.length) {
    const statuses = filters.status.map((status) => status.trim()).filter(Boolean);
    if (statuses.length) {
      params.set('status', statuses.join(','));
    }
  }

  const query = params.toString();
  return query ? `?${query}` : '';
}

async function resolveApplicationError(response: Response, fallback: string): Promise<never> {
  const payload = (await response.json().catch(() => ({}))) as { detail?: unknown };
  const message = typeof payload.detail === 'string' ? payload.detail : fallback;
  throw new Error(message);
}

export function indexApplicationsByResumeId<T extends ApplicationReference>(
  applications: T[]
): Map<string, T> {
  const lookup = new Map<string, T>();

  for (const application of applications) {
    const resumeId = application.resume_id?.trim();
    if (resumeId && !lookup.has(resumeId)) {
      lookup.set(resumeId, application);
    }
  }

  return lookup;
}

export function resolveApplicationByResumeId<T extends ApplicationReference>(
  applications: T[],
  resumeId: string
): T | null {
  const normalizedResumeId = resumeId.trim();
  if (!normalizedResumeId) {
    return null;
  }

  return indexApplicationsByResumeId(applications).get(normalizedResumeId) ?? null;
}

export async function fetchApplications(
  filters: ApplicationListFilters = {}
): Promise<ApplicationListResponse> {
  const res = await apiFetch(`/applications${buildApplicationQueryParams(filters)}`);

  if (!res.ok) {
    throw new Error(`Failed to load applications (status ${res.status}).`);
  }

  return res.json();
}

export async function fetchApplication(applicationId: string): Promise<ApplicationRecord> {
  const normalizedApplicationId = normalizeApplicationId(applicationId);
  const res = await apiFetch(`/applications/${encodeURIComponent(normalizedApplicationId)}`);

  if (!res.ok) {
    return resolveApplicationError(res, `Failed to load application (status ${res.status}).`);
  }

  return res.json();
}

export async function fetchApplicationConfig(): Promise<ApplicationConfigResponse> {
  const res = await apiFetch('/config/applications');

  if (!res.ok) {
    throw new Error(`Failed to load application config (status ${res.status}).`);
  }

  return res.json();
}

export async function createApplication(
  payload: CreateApplicationRequest
): Promise<ApplicationRecord> {
  const res = await apiPost('/applications', payload);

  if (!res.ok) {
    return resolveApplicationError(res, `Failed to create application (status ${res.status}).`);
  }

  return res.json();
}

export async function updateApplication(
  applicationId: string,
  payload: UpdateApplicationRequest
): Promise<ApplicationRecord> {
  const normalizedApplicationId = normalizeApplicationId(applicationId);
  const res = await apiPatch(
    `/applications/${encodeURIComponent(normalizedApplicationId)}`,
    payload
  );

  if (!res.ok) {
    return resolveApplicationError(res, `Failed to update application (status ${res.status}).`);
  }

  return res.json();
}

export async function updateApplicationStatus(
  applicationId: string,
  payload: UpdateApplicationStatusRequest
): Promise<ApplicationRecord> {
  const normalizedApplicationId = normalizeApplicationId(applicationId);
  const res = await apiPost(
    `/applications/${encodeURIComponent(normalizedApplicationId)}/status`,
    payload
  );

  if (!res.ok) {
    return resolveApplicationError(
      res,
      `Failed to update application status (status ${res.status}).`
    );
  }

  return res.json();
}
