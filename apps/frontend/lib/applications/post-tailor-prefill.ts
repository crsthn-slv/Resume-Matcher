export interface PostTailorApplicationPrefill {
  shouldCreate: boolean;
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
    company: searchParams.get('company'),
    role: searchParams.get('role'),
    jobUrl: searchParams.get('jobUrl'),
    jobId: searchParams.get('jobId'),
  };
}
