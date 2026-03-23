import { describe, expect, it } from 'vitest';
import {
  filterTailoredResumeRows,
  formatApplicationStatusLabel,
  getApplicationBadgeVariant,
  sortTailoredResumeRowsByActivity,
  uniqueStatuses,
  type TailoredResumeRow,
} from '@/lib/dashboard/application-filtering';

const baseResume = {
  filename: 'resume.json',
  is_master: false,
  parent_id: 'master-id',
  processing_status: 'ready' as const,
  created_at: '2026-03-23T10:00:00.000Z',
  title: 'Tailored Resume',
  jobSnippet: '',
};

function buildRow(overrides: Partial<TailoredResumeRow>): TailoredResumeRow {
  return {
    resume_id: 'resume-1',
    updated_at: '2026-03-23T10:00:00.000Z',
    application: null,
    ...baseResume,
    ...overrides,
  };
}

describe('dashboard application filtering helpers', () => {
  it('formats application status labels for display', () => {
    expect(formatApplicationStatusLabel('in_progress-review')).toBe('In Progress Review');
  });

  it('deduplicates configured statuses case-insensitively', () => {
    expect(uniqueStatuses(['Applied', ' applied ', 'Interview'])).toEqual(['Applied', 'Interview']);
  });

  it('filters resume rows by linked application company and status', () => {
    const rows = [
      buildRow({
        resume_id: 'resume-acme',
        application: {
          application_id: 'application-1',
          company: 'Acme',
          role: 'Frontend Engineer',
          status: 'Interview',
          job_url: null,
          notes: null,
          resume_id: 'resume-acme',
          resume_title: 'Acme Resume',
          job_id: null,
          has_job_description: false,
          status_history: [],
          created_at: '2026-03-23T10:00:00.000Z',
          updated_at: '2026-03-24T10:00:00.000Z',
        },
      }),
      buildRow({
        resume_id: 'resume-globex',
        application: {
          application_id: 'application-2',
          company: 'Globex',
          role: 'Designer',
          status: 'Applied',
          job_url: null,
          notes: null,
          resume_id: 'resume-globex',
          resume_title: 'Globex Resume',
          job_id: null,
          has_job_description: false,
          status_history: [],
          created_at: '2026-03-23T10:00:00.000Z',
          updated_at: '2026-03-23T11:00:00.000Z',
        },
      }),
    ];

    const result = filterTailoredResumeRows(rows, 'acme', ['Interview']);

    expect(result).toHaveLength(1);
    expect(result[0]?.resume_id).toBe('resume-acme');
  });

  it('sorts linked application rows by most recent activity and keeps linked rows first', () => {
    const rows = [
      buildRow({ resume_id: 'no-application', application: null }),
      buildRow({
        resume_id: 'older-linked',
        application: {
          application_id: 'application-2',
          company: 'Globex',
          role: 'Engineer',
          status: 'Applied',
          job_url: null,
          notes: null,
          resume_id: 'older-linked',
          resume_title: 'Older',
          job_id: null,
          has_job_description: false,
          status_history: [],
          created_at: '2026-03-23T10:00:00.000Z',
          updated_at: '2026-03-23T11:00:00.000Z',
        },
      }),
      buildRow({
        resume_id: 'newer-linked',
        application: {
          application_id: 'application-1',
          company: 'Acme',
          role: 'Engineer',
          status: 'Offer',
          job_url: null,
          notes: null,
          resume_id: 'newer-linked',
          resume_title: 'Newer',
          job_id: null,
          has_job_description: false,
          status_history: [],
          created_at: '2026-03-23T10:00:00.000Z',
          updated_at: '2026-03-24T11:00:00.000Z',
        },
      }),
    ];

    expect(sortTailoredResumeRowsByActivity(rows).map((row) => row.resume_id)).toEqual([
      'newer-linked',
      'older-linked',
      'no-application',
    ]);
  });

  it('maps statuses to stable badge variants', () => {
    expect(getApplicationBadgeVariant('Rejected')).toBe('danger');
    expect(getApplicationBadgeVariant('Offer')).toBe('success');
    expect(getApplicationBadgeVariant('Interview')).toBe('warning');
    expect(getApplicationBadgeVariant('Applied')).toBe('default');
  });
});
