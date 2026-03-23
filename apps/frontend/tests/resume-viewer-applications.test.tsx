import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const pushMock = vi.fn();
const replaceMock = vi.fn();
const fetchResumeMock = vi.fn();
const fetchJobDescriptionMock = vi.fn();
const fetchApplicationsMock = vi.fn();
const fetchApplicationConfigMock = vi.fn();
const updateApplicationMock = vi.fn();
const updateApplicationStatusMock = vi.fn();
const searchParamsMock = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'resume-1' }),
  useRouter: () => ({ push: pushMock, replace: replaceMock }),
  useSearchParams: () => searchParamsMock,
}));

vi.mock('@/lib/i18n', () => ({
  useTranslations: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('@/lib/context/language-context', () => ({
  useLanguage: () => ({ uiLanguage: 'en' }),
}));

vi.mock('@/lib/context/status-cache', () => ({
  useStatusCache: () => ({
    decrementResumes: vi.fn(),
    setHasMasterResume: vi.fn(),
  }),
}));

vi.mock('@/components/dashboard/resume-component', () => ({
  default: () => <div>resume-preview</div>,
}));

vi.mock('@/components/enrichment/enrichment-modal', () => ({
  EnrichmentModal: () => null,
}));

vi.mock('@/lib/utils/section-helpers', () => ({
  withLocalizedDefaultSections: (data: unknown) => data,
}));

vi.mock('@/lib/utils/download', () => ({
  downloadBlobAsFile: vi.fn(),
  openUrlInNewTab: vi.fn(),
  sanitizeFilename: vi.fn(() => 'resume.pdf'),
}));

vi.mock('@/lib/api/resume', () => ({
  fetchResume: (...args: unknown[]) => fetchResumeMock(...args),
  fetchJobDescription: (...args: unknown[]) => fetchJobDescriptionMock(...args),
  downloadResumePdf: vi.fn(),
  getResumePdfUrl: vi.fn(),
  deleteResume: vi.fn(),
  retryProcessing: vi.fn(),
  renameResume: vi.fn(),
}));

vi.mock('@/lib/api/applications', async () => {
  const actual = await vi.importActual('@/lib/api/applications');
  return {
    ...actual,
    fetchApplications: (...args: unknown[]) => fetchApplicationsMock(...args),
    fetchApplicationConfig: (...args: unknown[]) => fetchApplicationConfigMock(...args),
    createApplication: vi.fn(),
    updateApplication: (...args: unknown[]) => updateApplicationMock(...args),
    updateApplicationStatus: (...args: unknown[]) => updateApplicationStatusMock(...args),
  };
});

describe('ResumeViewerPage application management', () => {
  beforeEach(() => {
    pushMock.mockReset();
    replaceMock.mockReset();
    fetchResumeMock.mockReset();
    fetchJobDescriptionMock.mockReset();
    fetchApplicationsMock.mockReset();
    fetchApplicationConfigMock.mockReset();
    updateApplicationMock.mockReset();
    updateApplicationStatusMock.mockReset();

    fetchResumeMock.mockResolvedValue({
      resume_id: 'resume-1',
      title: 'Frontend Engineer @ Acme',
      raw_resume: {
        content: '{}',
        content_type: 'json',
        created_at: '2026-03-23T10:00:00.000Z',
        processing_status: 'ready',
      },
      processed_resume: {
        personalInfo: {
          name: 'Taylor Dev',
        },
      },
    });

    fetchJobDescriptionMock.mockResolvedValue({
      job_id: 'job-1',
      content: 'Build frontend experiences',
    });

    fetchApplicationConfigMock.mockResolvedValue({
      statuses: ['Applied', 'Interview'],
    });
  });

  it('renders linked application details with reverse-ordered status history', async () => {
    fetchApplicationsMock.mockResolvedValue({
      items: [
        {
          application_id: 'application-1',
          company: 'Acme',
          role: 'Frontend Engineer',
          status: 'Interview',
          job_url: 'https://example.com/job',
          notes: 'Reach out tomorrow',
          resume_id: 'resume-1',
          resume_title: 'Frontend Engineer @ Acme',
          job_id: 'job-1',
          has_job_description: true,
          created_at: '2026-03-23T10:00:00.000Z',
          updated_at: '2026-03-24T10:00:00.000Z',
          status_history: [
            {
              from_status: null,
              to_status: 'Applied',
              changed_at: '2026-03-23T10:00:00.000Z',
              source: 'manual_create',
            },
            {
              from_status: 'Applied',
              to_status: 'Interview',
              changed_at: '2026-03-24T10:00:00.000Z',
              source: 'status_change',
            },
          ],
        },
      ],
    });

    const { default: ResumeViewerPage } = await import('@/app/(default)/resumes/[id]/page');
    render(<ResumeViewerPage />);

    expect(await screen.findByText('Acme')).toBeInTheDocument();
    expect(screen.getByText('Frontend Engineer')).toBeInTheDocument();
    expect(screen.getByText('Reach out tomorrow')).toBeInTheDocument();
    expect(screen.getByText('https://example.com/job')).toBeInTheDocument();
    expect(screen.getByText('Build frontend experiences')).toBeInTheDocument();

    const historySourceEntries = screen.getAllByText(/resumeViewer\.application\.sources\./);
    const historyItems = historySourceEntries.map(
      (entry) => entry.closest('li')?.textContent ?? ''
    );
    expect(historyItems[0]).toContain('Interview');
    expect(historyItems[1]).toContain('Applied');
  });

  it('opens the edit dialog with the linked application metadata prefilled', async () => {
    fetchApplicationsMock.mockResolvedValue({
      items: [
        {
          application_id: 'application-1',
          company: 'Acme',
          role: 'Frontend Engineer',
          status: 'Applied',
          job_url: null,
          notes: null,
          resume_id: 'resume-1',
          resume_title: 'Frontend Engineer @ Acme',
          job_id: 'job-1',
          has_job_description: true,
          created_at: '2026-03-23T10:00:00.000Z',
          updated_at: '2026-03-24T10:00:00.000Z',
          status_history: [
            {
              from_status: null,
              to_status: 'Applied',
              changed_at: '2026-03-23T10:00:00.000Z',
              source: 'manual_create',
            },
          ],
        },
      ],
    });

    const { default: ResumeViewerPage } = await import('@/app/(default)/resumes/[id]/page');
    render(<ResumeViewerPage />);

    fireEvent.click(
      await screen.findByRole('button', { name: 'resumeViewer.application.editAction' })
    );

    await screen.findByText('resumeViewer.application.editDialogTitle');

    const companyInput = await screen.findByLabelText('resumeViewer.application.companyLabel');
    const roleInput = await screen.findByLabelText('resumeViewer.application.roleLabel');
    const jobUrlInput = await screen.findByLabelText('resumeViewer.application.jobUrlLabel');
    const notesInput = await screen.findByLabelText('resumeViewer.application.notesLabel');

    expect(companyInput).toHaveValue('Acme');
    expect(roleInput).toHaveValue('Frontend Engineer');
    expect(jobUrlInput).toHaveValue('');
    expect(notesInput).toHaveValue('');
    expect(updateApplicationMock).not.toHaveBeenCalled();
    expect(updateApplicationStatusMock).not.toHaveBeenCalled();
  });
});
