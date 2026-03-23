import { describe, expect, it } from 'vitest';
import {
  buildDashboardApplicationQuickCreate,
  buildOptimisticApplicationStatus,
  normalizeApplicationStatuses,
  type ApplicationListItem,
} from '@/lib/api/applications';

function buildApplication(overrides: Partial<ApplicationListItem> = {}): ApplicationListItem {
  return {
    application_id: 'application-1',
    company: 'Acme',
    role: 'Frontend Engineer',
    status: 'Applied',
    job_url: null,
    notes: null,
    resume_id: 'resume-1',
    job_id: 'job-1',
    status_history: [],
    created_at: '2026-03-23T10:00:00.000Z',
    updated_at: '2026-03-23T10:00:00.000Z',
    resume_title: 'Frontend Engineer @ Acme',
    has_job_description: true,
    ...overrides,
  };
}

describe('inline application status helpers', () => {
  it('normalizes configured statuses before rendering inline menus', () => {
    expect(normalizeApplicationStatuses([' Applied ', 'applied', 'Interview'])).toEqual([
      'Applied',
      'Interview',
    ]);
  });

  it('derives a quick-create payload from a dashboard card title when company and role are present', () => {
    expect(
      buildDashboardApplicationQuickCreate(
        {
          resumeId: 'resume-1',
          resumeTitle: 'Frontend Engineer @ Acme',
          jobId: 'job-1',
        },
        'Interview'
      )
    ).toEqual({
      kind: 'ready',
      prefill: {
        company: 'Acme',
        role: 'Frontend Engineer',
        jobUrl: null,
        notes: null,
      },
      payload: {
        company: 'Acme',
        role: 'Frontend Engineer',
        status: 'Interview',
        job_url: null,
        notes: null,
        resume_id: 'resume-1',
        job_id: 'job-1',
      },
    });
  });

  it('falls back to the normal create flow when dashboard inference is incomplete', () => {
    expect(
      buildDashboardApplicationQuickCreate(
        {
          resumeId: 'resume-1',
          resumeTitle: 'Senior Frontend Engineer',
          jobId: 'job-1',
        },
        'Applied'
      )
    ).toEqual({
      kind: 'insufficient',
      prefill: {
        company: null,
        role: 'Senior Frontend Engineer',
        jobUrl: null,
        notes: null,
      },
    });
  });

  it('supports optimistic status updates that can be reverted with the previous snapshot', () => {
    const previousApplication = buildApplication();
    const optimisticApplication = buildOptimisticApplicationStatus(previousApplication, 'Offer');

    expect(optimisticApplication.status).toBe('Offer');
    expect(optimisticApplication.updated_at).not.toBe(previousApplication.updated_at);
    expect(previousApplication.status).toBe('Applied');
  });
});
