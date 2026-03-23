import { describe, expect, it } from 'vitest';
import {
  buildApplicationPrefillQuery,
  buildPostTailorApplicationCreatePayload,
  buildApplicationPrefillState,
  resolvePostTailorApplicationPrefill,
  stripPostTailorApplicationParams,
} from '@/lib/applications/post-tailor-prefill';

describe('post-tailor application prefill helpers', () => {
  it('reads one-shot create intent from search params', () => {
    const searchParams = new URLSearchParams({
      createApplication: '1',
      company: 'Acme',
      role: 'Platform Engineer',
      jobUrl: 'https://example.com/job',
      jobId: 'job-123',
    });

    expect(resolvePostTailorApplicationPrefill(searchParams)).toEqual({
      shouldCreate: true,
      shouldOpenForm: false,
      company: 'Acme',
      role: 'Platform Engineer',
      jobUrl: 'https://example.com/job',
      jobId: 'job-123',
    });
  });

  it('builds query params for inline status fallback to the create form', () => {
    expect(
      buildApplicationPrefillQuery({
        shouldCreate: true,
        shouldOpenForm: true,
        company: 'Acme',
        role: 'Engineer',
        jobId: 'job-123',
      })
    ).toBe('createApplication=1&openApplicationForm=1&company=Acme&role=Engineer&jobId=job-123');
  });

  it('builds editable form state from prefill values', () => {
    expect(
      buildApplicationPrefillState({
        company: '  Acme  ',
        role: ' Senior Engineer ',
        jobUrl: ' https://example.com/job ',
      })
    ).toEqual({
      company: 'Acme',
      role: 'Senior Engineer',
      jobUrl: 'https://example.com/job',
      notes: '',
    });
  });

  it('builds an auto-create payload when required prefill exists', () => {
    expect(
      buildPostTailorApplicationCreatePayload({
        prefill: {
          shouldCreate: true,
          shouldOpenForm: false,
          company: '  Acme  ',
          role: ' Senior Engineer ',
          jobUrl: ' https://example.com/job ',
          jobId: ' job-123 ',
        },
        resumeId: ' resume-123 ',
      })
    ).toEqual({
      company: 'Acme',
      role: 'Senior Engineer',
      job_url: 'https://example.com/job',
      notes: null,
      resume_id: 'resume-123',
      job_id: 'job-123',
    });
  });

  it('returns null when company or role is missing for auto-create', () => {
    expect(
      buildPostTailorApplicationCreatePayload({
        prefill: {
          shouldCreate: true,
          shouldOpenForm: false,
          company: 'Acme',
          role: '   ',
          jobUrl: null,
          jobId: null,
        },
        resumeId: 'resume-123',
      })
    ).toBeNull();
  });

  it('removes transient post-tailor query params after processing', () => {
    const searchParams = new URLSearchParams({
      createApplication: '1',
      openApplicationForm: '1',
      company: 'Acme',
      role: 'Engineer',
      jobUrl: 'https://example.com/job',
      jobId: 'job-123',
      tab: 'preview',
    });

    expect(stripPostTailorApplicationParams(searchParams)).toBe('?tab=preview');
  });
});
