import { describe, expect, it } from 'vitest';
import {
  buildApplicationPrefillState,
  resolvePostTailorApplicationPrefill,
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
      company: 'Acme',
      role: 'Platform Engineer',
      jobUrl: 'https://example.com/job',
      jobId: 'job-123',
    });
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
});
