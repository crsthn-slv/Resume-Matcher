export interface PostTailorApplicationPrefill {
  shouldCreate: boolean;
  shouldOpenForm: boolean;
  company: string | null;
  role: string | null;
  jobUrl: string | null;
  jobId: string | null;
}

export interface ApplicationFormState {
  company: string;
  role: string;
  jobUrl: string;
  notes: string;
}

export interface PostTailorApplicationCreatePayload {
  company: string;
  role: string;
  job_url: string | null;
  notes: string | null;
  resume_id: string;
  job_id: string | null;
}

export function buildApplicationPrefillState(prefill: {
  company?: string | null;
  role?: string | null;
  jobUrl?: string | null;
}): ApplicationFormState {
  return {
    company: prefill.company?.trim() ?? '',
    role: prefill.role?.trim() ?? '',
    jobUrl: prefill.jobUrl?.trim() ?? '',
    notes: '',
  };
}

export function resolvePostTailorApplicationPrefill(
  searchParams: URLSearchParams | Pick<URLSearchParams, 'get'>
): PostTailorApplicationPrefill {
  return {
    shouldCreate: searchParams.get('createApplication') === '1',
    shouldOpenForm: searchParams.get('openApplicationForm') === '1',
    company: searchParams.get('company'),
    role: searchParams.get('role'),
    jobUrl: searchParams.get('jobUrl'),
    jobId: searchParams.get('jobId'),
  };
}

export function buildApplicationPrefillQuery(input: {
  shouldCreate?: boolean;
  shouldOpenForm?: boolean;
  company?: string | null;
  role?: string | null;
  jobUrl?: string | null;
  jobId?: string | null;
}): string {
  const params = new URLSearchParams();

  if (input.shouldCreate) {
    params.set('createApplication', '1');
  }

  if (input.shouldOpenForm) {
    params.set('openApplicationForm', '1');
  }

  if (input.company?.trim()) {
    params.set('company', input.company.trim());
  }

  if (input.role?.trim()) {
    params.set('role', input.role.trim());
  }

  if (input.jobUrl?.trim()) {
    params.set('jobUrl', input.jobUrl.trim());
  }

  if (input.jobId?.trim()) {
    params.set('jobId', input.jobId.trim());
  }

  return params.toString();
}

export function buildPostTailorApplicationCreatePayload(input: {
  prefill: PostTailorApplicationPrefill;
  resumeId: string;
  jobId?: string | null;
}): PostTailorApplicationCreatePayload | null {
  const company = input.prefill.company?.trim() ?? '';
  const role = input.prefill.role?.trim() ?? '';
  const resumeId = input.resumeId.trim();

  if (!company || !role || !resumeId) {
    return null;
  }

  const resolvedJobId = input.jobId?.trim() || input.prefill.jobId?.trim() || null;
  const jobUrl = input.prefill.jobUrl?.trim() || null;

  return {
    company,
    role,
    job_url: jobUrl,
    notes: null,
    resume_id: resumeId,
    job_id: resolvedJobId,
  };
}

export function stripPostTailorApplicationParams(
  searchParams: URLSearchParams | Pick<URLSearchParams, 'toString'>
): string {
  const nextParams = new URLSearchParams(searchParams.toString());
  nextParams.delete('createApplication');
  nextParams.delete('openApplicationForm');
  nextParams.delete('company');
  nextParams.delete('role');
  nextParams.delete('jobUrl');
  nextParams.delete('jobId');

  const query = nextParams.toString();
  return query ? `?${query}` : '';
}
