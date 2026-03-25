'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { InteractiveCardBadge } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Dropdown } from '@/components/ui/dropdown';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Resume, { ResumeData } from '@/components/dashboard/resume-component';
import {
  fetchResume,
  downloadResumePdf,
  getResumePdfUrl,
  deleteResume,
  retryProcessing,
  renameResume,
  fetchJobDescription,
} from '@/lib/api/resume';
import {
  buildOptimisticApplicationStatus,
  createApplication,
  fetchApplicationConfig,
  fetchApplications,
  normalizeApplicationStatuses,
  resolveApplicationByResumeId,
  type ApplicationListItem,
  type ApplicationRecord,
  updateApplication,
  updateApplicationStatus,
} from '@/lib/api/applications';
import { useStatusCache } from '@/lib/context/status-cache';
import {
  ArrowLeft,
  Edit,
  Download,
  Loader2,
  AlertCircle,
  Sparkles,
  Pencil,
  ExternalLink,
  Link2,
  History,
  BadgeCheck,
} from 'lucide-react';
import { EnrichmentModal } from '@/components/enrichment/enrichment-modal';
import { useTranslations } from '@/lib/i18n';
import { withLocalizedDefaultSections } from '@/lib/utils/section-helpers';
import { useLanguage } from '@/lib/context/language-context';
import { downloadBlobAsFile, openUrlInNewTab, sanitizeFilename } from '@/lib/utils/download';
import {
  formatApplicationStatusLabel,
  getApplicationBadgeVariant,
} from '@/lib/dashboard/application-filtering';
import {
  buildPostTailorApplicationCreatePayload,
  buildApplicationPrefillState,
  resolvePostTailorApplicationPrefill,
  stripPostTailorApplicationParams,
  type ApplicationFormState,
  type PostTailorApplicationPrefill,
} from '@/lib/applications/post-tailor-prefill';

type ProcessingStatus = 'pending' | 'processing' | 'ready' | 'failed';
type ApplicationDialogMode = 'create' | 'edit';

const EMPTY_APPLICATION_FORM: ApplicationFormState = {
  company: '',
  role: '',
  jobUrl: '',
  notes: '',
};

function toApplicationFormState(application: ApplicationListItem | null): ApplicationFormState {
  if (!application) {
    return EMPTY_APPLICATION_FORM;
  }

  return {
    company: application.company,
    role: application.role,
    jobUrl: application.job_url ?? '',
    notes: application.notes ?? '',
  };
}

function toApplicationListItem(
  application: ApplicationRecord,
  resumeTitle: string | null,
  hasJobDescription: boolean
): ApplicationListItem {
  return {
    ...application,
    resume_title: resumeTitle,
    has_job_description: hasJobDescription,
  };
}

function formatDateTime(value: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export default function ResumeViewerPage() {
  const { t } = useTranslations();
  const { uiLanguage } = useLanguage();
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { decrementResumes, setHasMasterResume } = useStatusCache();
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus | null>(null);
  const [isMasterResume, setIsMasterResume] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDeleteSuccessDialog, setShowDeleteSuccessDialog] = useState(false);
  const [showDownloadSuccessDialog, setShowDownloadSuccessDialog] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showEnrichmentModal, setShowEnrichmentModal] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [resumeTitle, setResumeTitle] = useState<string | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editingTitleValue, setEditingTitleValue] = useState('');
  const [linkedApplication, setLinkedApplication] = useState<ApplicationListItem | null>(null);
  const [linkedJobDescription, setLinkedJobDescription] = useState<string | null>(null);
  const [linkedJobId, setLinkedJobId] = useState<string | null>(null);
  const [applicationStatuses, setApplicationStatuses] = useState<string[]>([]);
  const [applicationDialogOpen, setApplicationDialogOpen] = useState(false);
  const [applicationDialogMode, setApplicationDialogMode] =
    useState<ApplicationDialogMode>('create');
  const [applicationForm, setApplicationForm] =
    useState<ApplicationFormState>(EMPTY_APPLICATION_FORM);
  const [applicationFormError, setApplicationFormError] = useState<string | null>(null);
  const [applicationActionError, setApplicationActionError] = useState<string | null>(null);
  const [isSavingApplication, setIsSavingApplication] = useState(false);
  const [statusSelection, setStatusSelection] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [applicationStatusNotice, setApplicationStatusNotice] = useState<string | null>(null);
  const [postTailorApplicationPrefill, setPostTailorApplicationPrefill] =
    useState<PostTailorApplicationPrefill | null>(null);
  const postTailorCreateHandled = useRef(false);

  const resumeId = params?.id as string;
  const postTailorPrefill = useMemo(
    () => resolvePostTailorApplicationPrefill(searchParams),
    [searchParams]
  );

  useEffect(() => {
    if (
      (!postTailorPrefill.shouldCreate && !postTailorPrefill.shouldOpenForm) ||
      postTailorApplicationPrefill
    ) {
      return;
    }

    setPostTailorApplicationPrefill(postTailorPrefill);
  }, [postTailorApplicationPrefill, postTailorPrefill]);

  const localizedResumeData = useMemo(() => {
    if (!resumeData) return null;
    return withLocalizedDefaultSections(resumeData, t);
  }, [resumeData, t]);

  const orderedStatusHistory = useMemo(() => {
    return linkedApplication?.status_history ? [...linkedApplication.status_history].reverse() : [];
  }, [linkedApplication]);
  const statusOptions = useMemo(() => {
    if (applicationStatuses.length) {
      return normalizeApplicationStatuses(applicationStatuses);
    }

    if (linkedApplication) {
      return [linkedApplication.status];
    }

    return [];
  }, [applicationStatuses, linkedApplication]);

  useEffect(() => {
    if (!resumeId) return;
    let cancelled = false;

    const loadResume = async () => {
      try {
        setLoading(true);
        setError(null);
        const [resumeResult, applicationResult, configResult, jobDescriptionResult] =
          await Promise.allSettled([
            fetchResume(resumeId),
            fetchApplications(),
            fetchApplicationConfig(),
            fetchJobDescription(resumeId),
          ]);

        if (cancelled) {
          return;
        }

        if (resumeResult.status === 'rejected') {
          throw resumeResult.reason;
        }

        const data = resumeResult.value;
        const application =
          applicationResult.status === 'fulfilled'
            ? resolveApplicationByResumeId(applicationResult.value.items, resumeId)
            : null;

        if (applicationResult.status === 'fulfilled') {
          setLinkedApplication(application);
          setApplicationForm(toApplicationFormState(application));
          setLinkedJobId(application?.job_id ?? null);
          setStatusSelection(application?.status ?? '');
        } else {
          console.error('Failed to load applications for resume detail:', applicationResult.reason);
          setLinkedApplication(null);
          setApplicationForm(EMPTY_APPLICATION_FORM);
          setLinkedJobId(null);
          setStatusSelection('');
        }

        if (configResult.status === 'fulfilled') {
          setApplicationStatuses(configResult.value.statuses);
        } else {
          console.error(
            'Failed to load application statuses for resume detail:',
            configResult.reason
          );
          setApplicationStatuses([]);
        }

        if (jobDescriptionResult.status === 'fulfilled') {
          setLinkedJobId(jobDescriptionResult.value.job_id ?? application?.job_id ?? null);
          setLinkedJobDescription(jobDescriptionResult.value.content ?? null);
        } else {
          if (!application?.job_id) {
            setLinkedJobId(null);
          }
          setLinkedJobDescription(null);
        }

        // Get processing status
        const status = (data.raw_resume?.processing_status || 'pending') as ProcessingStatus;
        setProcessingStatus(status);

        // Capture title for editable display (always set to clear stale state)
        setResumeTitle(data.title ?? null);

        // Prioritize processed_resume if available (structured JSON)
        if (data.processed_resume) {
          setResumeData(data.processed_resume as ResumeData);
          setError(null);
        } else if (status === 'failed') {
          setError(t('resumeViewer.errors.processingFailed'));
        } else if (status === 'processing') {
          setError(t('resumeViewer.errors.stillProcessing'));
        } else if (data.raw_resume?.content) {
          // Try to parse raw_resume content as JSON (for tailored resumes stored as JSON)
          try {
            const parsed = JSON.parse(data.raw_resume.content);
            setResumeData(parsed as ResumeData);
          } catch {
            setError(t('resumeViewer.errors.notProcessedYet'));
          }
        } else {
          setError(t('resumeViewer.errors.noDataAvailable'));
        }
      } catch (err) {
        console.error('Failed to load resume:', err);
        setError(t('resumeViewer.errors.failedToLoad'));
      } finally {
        setLoading(false);
      }
    };

    loadResume();
    setIsMasterResume(localStorage.getItem('master_resume_id') === resumeId);
    return () => {
      cancelled = true;
    };
  }, [resumeId, t]);

  useEffect(() => {
    if (!applicationStatusNotice) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setApplicationStatusNotice(null);
    }, 3500);

    return () => window.clearTimeout(timeoutId);
  }, [applicationStatusNotice]);

  const handleRetryProcessing = async () => {
    if (!resumeId) return;
    setIsRetrying(true);
    try {
      const result = await retryProcessing(resumeId);
      if (result.processing_status === 'ready') {
        // Reload the page to show the processed resume
        window.location.reload();
      } else {
        setError(t('resumeViewer.errors.processingFailed'));
      }
    } catch (err) {
      console.error('Retry processing failed:', err);
      setError(t('resumeViewer.errors.processingFailed'));
    } finally {
      setIsRetrying(false);
    }
  };

  const handleEdit = () => {
    router.push(`/builder?id=${resumeId}`);
  };

  const handleTitleSave = async () => {
    const trimmed = editingTitleValue.trim();
    if (!trimmed || trimmed === resumeTitle) {
      setIsEditingTitle(false);
      return;
    }
    try {
      await renameResume(resumeId, trimmed);
      setResumeTitle(trimmed);
    } catch (err) {
      console.error('Failed to rename resume:', err);
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      setIsEditingTitle(false);
    }
  };

  const openCreateApplicationDialog = (prefill?: PostTailorApplicationPrefill | null) => {
    setApplicationDialogMode('create');
    setApplicationForm(
      prefill?.shouldCreate || prefill?.shouldOpenForm
        ? buildApplicationPrefillState(prefill)
        : EMPTY_APPLICATION_FORM
    );
    setApplicationFormError(null);
    setApplicationActionError(null);
    setApplicationStatusNotice(null);
    setApplicationDialogOpen(true);
  };

  const openEditApplicationDialog = () => {
    if (!linkedApplication) {
      return;
    }

    setApplicationDialogMode('edit');
    setApplicationForm(toApplicationFormState(linkedApplication));
    setApplicationFormError(null);
    setApplicationActionError(null);
    setApplicationStatusNotice(null);
    setApplicationDialogOpen(true);
  };

  const closeApplicationDialog = () => {
    setApplicationDialogOpen(false);
    setApplicationFormError(null);
    setApplicationActionError(null);
  };

  useEffect(() => {
    if (!resumeId || loading || postTailorCreateHandled.current) {
      return;
    }

    if (
      !postTailorApplicationPrefill?.shouldCreate &&
      !postTailorApplicationPrefill?.shouldOpenForm
    ) {
      return;
    }

    const nextUrl = `/resumes/${resumeId}${stripPostTailorApplicationParams(searchParams)}`;

    if (linkedApplication) {
      postTailorCreateHandled.current = true;
      if (postTailorApplicationPrefill.jobId && !linkedJobId) {
        setLinkedJobId(postTailorApplicationPrefill.jobId);
      }
      router.replace(nextUrl);
      return;
    }

    const payload = buildPostTailorApplicationCreatePayload({
      prefill: postTailorApplicationPrefill,
      resumeId,
      jobId: linkedJobId,
    });

    if (postTailorApplicationPrefill.shouldOpenForm || !payload) {
      postTailorCreateHandled.current = true;
      setApplicationForm(buildApplicationPrefillState(postTailorApplicationPrefill));
      setApplicationFormError(
        payload ? null : t('resumeViewer.application.inlinePrefillIncomplete')
      );
      setApplicationActionError(null);
      openCreateApplicationDialog(postTailorApplicationPrefill);
      router.replace(nextUrl);
      return;
    }

    postTailorCreateHandled.current = true;
    setApplicationFormError(null);
    setApplicationActionError(null);

    void (async () => {
      try {
        const savedApplication = await createApplication(payload);
        const nextApplication = toApplicationListItem(
          savedApplication,
          resumeTitle,
          Boolean(linkedJobDescription)
        );
        setLinkedApplication(nextApplication);
        setApplicationForm(toApplicationFormState(nextApplication));
        setStatusSelection(savedApplication.status);
        setLinkedJobId(savedApplication.job_id);
      } catch (err) {
        console.error('Failed to auto-create application from post-tailor handoff:', err);
        setApplicationActionError(t('resumeViewer.application.saveFailed'));
        setApplicationForm(buildApplicationPrefillState(postTailorApplicationPrefill));
      } finally {
        router.replace(nextUrl);
      }
    })();
  }, [
    linkedApplication,
    linkedJobDescription,
    linkedJobId,
    loading,
    postTailorApplicationPrefill,
    resumeId,
    resumeTitle,
    router,
    searchParams,
    t,
  ]);

  const handleApplicationSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const company = applicationForm.company.trim();
    const role = applicationForm.role.trim();
    const jobUrl = applicationForm.jobUrl.trim();
    const notes = applicationForm.notes.trim();

    if (!company || !role) {
      setApplicationFormError(t('resumeViewer.application.formValidation'));
      return;
    }

    setIsSavingApplication(true);
    setApplicationFormError(null);
    setApplicationActionError(null);

    try {
      const payload = {
        company,
        role,
        job_url: jobUrl || null,
        notes: notes || null,
        resume_id: resumeId,
        job_id: linkedJobId,
      };

      const savedApplication =
        applicationDialogMode === 'create'
          ? await createApplication(payload)
          : await updateApplication(linkedApplication?.application_id ?? '', payload);

      setLinkedApplication(
        toApplicationListItem(
          savedApplication,
          linkedApplication?.resume_title ?? resumeTitle,
          Boolean(linkedJobDescription)
        )
      );
      setStatusSelection(savedApplication.status);
      setApplicationDialogOpen(false);
    } catch (err) {
      console.error('Failed to save application from resume viewer:', err);
      setApplicationActionError(t('resumeViewer.application.saveFailed'));
    } finally {
      setIsSavingApplication(false);
    }
  };

  const handleStatusChange = async (nextStatus = statusSelection) => {
    if (!linkedApplication || !nextStatus || nextStatus === linkedApplication.status) {
      return;
    }

    const previousApplication = linkedApplication;
    const optimisticApplication = buildOptimisticApplicationStatus(linkedApplication, nextStatus);

    setLinkedApplication(optimisticApplication);
    setStatusSelection(nextStatus);
    setIsUpdatingStatus(true);
    setApplicationStatusNotice(null);

    try {
      const updatedApplication = await updateApplicationStatus(linkedApplication.application_id, {
        status: nextStatus,
      });

      setLinkedApplication(
        toApplicationListItem(
          updatedApplication,
          linkedApplication.resume_title ?? resumeTitle,
          Boolean(linkedJobDescription)
        )
      );
      setStatusSelection(updatedApplication.status);
    } catch (err) {
      console.error('Failed to update application status from resume viewer:', err);
      setLinkedApplication(previousApplication);
      setStatusSelection(previousApplication.status);
      setApplicationStatusNotice(t('resumeViewer.application.statusUpdateFailed'));
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Reload resume data after enrichment
  const reloadResumeData = async () => {
    try {
      const data = await fetchResume(resumeId);
      if (data.processed_resume) {
        setResumeData(data.processed_resume as ResumeData);
        setError(null);
      }
    } catch (err) {
      console.error('Failed to reload resume:', err);
    }
  };

  const handleEnrichmentComplete = () => {
    setShowEnrichmentModal(false);
    reloadResumeData();
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const blob = await downloadResumePdf(resumeId, undefined, uiLanguage);
      const filename = sanitizeFilename(resumeTitle, resumeId, 'resume');
      downloadBlobAsFile(blob, filename);
      setShowDownloadSuccessDialog(true);
    } catch (err) {
      console.error('Failed to download resume:', err);
      if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
        const fallbackUrl = getResumePdfUrl(resumeId, undefined, uiLanguage);
        const didOpen = openUrlInNewTab(fallbackUrl);
        if (!didOpen) {
          alert(t('common.popupBlocked', { url: fallbackUrl }));
        }
        return;
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDeleteResume = async () => {
    try {
      setDeleteError(null);
      await deleteResume(resumeId);
      // Update cached counters
      decrementResumes();
      if (isMasterResume) {
        localStorage.removeItem('master_resume_id');
        setHasMasterResume(false);
      }
      setShowDeleteDialog(false);
      setShowDeleteSuccessDialog(true);
    } catch (err) {
      console.error('Failed to delete resume:', err);
      setDeleteError(t('resumeViewer.errors.failedToDelete'));
      setShowDeleteDialog(false);
    }
  };

  const handleDeleteSuccessConfirm = () => {
    setShowDeleteSuccessDialog(false);
    router.push('/dashboard');
  };

  const handleDownloadSuccessConfirm = () => {
    setShowDownloadSuccessDialog(false);
  };

  const applicationPanel = (
    <aside className="border-2 border-black bg-white shadow-[8px_8px_0px_0px_#000000] p-5 md:p-6 xl:sticky xl:top-8 no-print">
      <div className="flex flex-col gap-4 border-b border-black pb-5">
        <div className="space-y-2">
          <p className="font-mono text-xs uppercase tracking-wider text-gray-600">
            {t('resumeViewer.application.panelLabel')}
          </p>
          <h3 className="font-serif text-2xl font-bold text-black">
            {linkedApplication
              ? t('resumeViewer.application.panelTitle')
              : t('resumeViewer.application.emptyTitle')}
          </h3>
          <p className="font-mono text-xs leading-5 text-gray-600">
            {linkedApplication
              ? t('resumeViewer.application.panelDescription')
              : t('resumeViewer.application.emptyDescription')}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {linkedApplication ? (
            <Button variant="outline" size="sm" type="button" onClick={openEditApplicationDialog}>
              <Edit className="w-4 h-4" />
              {t('resumeViewer.application.editAction')}
            </Button>
          ) : (
            <Button type="button" onClick={() => openCreateApplicationDialog()}>
              <BadgeCheck className="w-4 h-4" />
              {t('resumeViewer.application.createAction')}
            </Button>
          )}
        </div>
      </div>

      {applicationStatusNotice ? (
        <div className="mt-4 border border-red-600 bg-red-50 p-3 font-mono text-xs uppercase tracking-wider text-red-700">
          {applicationStatusNotice}
        </div>
      ) : null}

      {applicationActionError && (
        <div className="mt-4 border border-red-600 bg-red-50 p-3 font-mono text-xs text-red-700">
          {applicationActionError}
        </div>
      )}

      {linkedApplication ? (
        <div className="mt-5 space-y-5">
          <div className="grid gap-3">
            <div className="border border-black p-4">
              <p className="font-mono text-[11px] uppercase tracking-wider text-gray-600">
                {t('resumeViewer.application.companyLabel')}
              </p>
              <p className="mt-2 font-serif text-lg font-bold">{linkedApplication.company}</p>
            </div>
            <div className="border border-black p-4">
              <p className="font-mono text-[11px] uppercase tracking-wider text-gray-600">
                {t('resumeViewer.application.roleLabel')}
              </p>
              <p className="mt-2 font-serif text-lg font-bold">{linkedApplication.role}</p>
            </div>
            <div className="border border-black p-4">
              <p className="font-mono text-[11px] uppercase tracking-wider text-gray-600">
                {t('resumeViewer.application.statusLabel')}
              </p>
              <div className="mt-2">
                <Dropdown
                  options={statusOptions.map((status) => ({
                    id: status,
                    label: formatApplicationStatusLabel(status),
                  }))}
                  value={statusSelection || linkedApplication.status}
                  onChange={(value) => {
                    if (value !== linkedApplication.status) {
                      void handleStatusChange(value);
                    }
                  }}
                  disabled={!statusOptions.length || isUpdatingStatus}
                  className="space-y-0"
                  menuClassName="min-w-[10rem]"
                  renderTrigger={({ toggle, isOpen, disabled }) => (
                    <InteractiveCardBadge
                      variant={getApplicationBadgeVariant(
                        statusSelection || linkedApplication.status
                      )}
                      isLoading={isUpdatingStatus}
                      disabled={disabled}
                      aria-expanded={isOpen}
                      onClick={(event) => {
                        event.stopPropagation();
                        toggle();
                      }}
                    >
                      {formatApplicationStatusLabel(statusSelection || linkedApplication.status)}
                    </InteractiveCardBadge>
                  )}
                />
              </div>
            </div>
            <div className="border border-black p-4">
              <p className="font-mono text-[11px] uppercase tracking-wider text-gray-600">
                {t('resumeViewer.application.linkedResumeLabel')}
              </p>
              <p className="mt-2 font-mono text-sm">
                {linkedApplication.resume_title ?? resumeTitle ?? resumeId ?? t('common.unknown')}
              </p>
            </div>
            <div className="border border-black p-4">
              <p className="font-mono text-[11px] uppercase tracking-wider text-gray-600">
                {t('resumeViewer.application.jobUrlLabel')}
              </p>
              {linkedApplication.job_url ? (
                <a
                  href={linkedApplication.job_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-2 font-mono text-sm text-blue-700 underline underline-offset-4"
                >
                  <ExternalLink className="w-4 h-4" />
                  {linkedApplication.job_url}
                </a>
              ) : (
                <p className="mt-2 font-mono text-sm text-gray-600">{t('common.unknown')}</p>
              )}
            </div>
            <div className="border border-black p-4">
              <p className="font-mono text-[11px] uppercase tracking-wider text-gray-600">
                {t('resumeViewer.application.notesLabel')}
              </p>
              <p className="mt-2 whitespace-pre-wrap font-sans text-sm leading-6 text-black">
                {linkedApplication.notes ?? t('common.unknown')}
              </p>
            </div>
          </div>

          {linkedJobDescription && (
            <div className="border border-black p-4">
              <div className="flex items-center gap-2">
                <Link2 className="w-4 h-4" />
                <p className="font-mono text-[11px] uppercase tracking-wider text-gray-600">
                  {t('resumeViewer.application.jobDescriptionLabel')}
                </p>
              </div>
              <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-6 text-black">
                {linkedJobDescription}
              </pre>
            </div>
          )}

          <div className="border border-black p-4">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4" />
              <p className="font-mono text-[11px] uppercase tracking-wider text-gray-600">
                {t('resumeViewer.application.historyLabel')}
              </p>
            </div>

            {orderedStatusHistory.length ? (
              <ul className="mt-3 space-y-3">
                {orderedStatusHistory.map((entry, index) => (
                  <li
                    key={`${entry.changed_at}-${index}`}
                    className="border border-black bg-white p-3"
                  >
                    <p className="font-mono text-xs uppercase tracking-wider text-gray-600">
                      {formatDateTime(entry.changed_at, uiLanguage)}
                    </p>
                    <p className="mt-2 font-serif text-base font-bold">
                      {entry.from_status ? `${entry.from_status} → ` : ''}
                      {entry.to_status}
                    </p>
                    <p className="mt-1 font-mono text-xs uppercase tracking-wider text-gray-600">
                      {t(`resumeViewer.application.sources.${entry.source}`)}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 font-mono text-xs uppercase tracking-wider text-gray-600">
                {t('resumeViewer.application.historyEmpty')}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-5 border-2 border-dashed border-black bg-[#F8F8F2] p-5">
          <p className="font-serif text-lg font-bold">
            {t('resumeViewer.application.emptyHeading')}
          </p>
          <p className="mt-2 font-mono text-xs leading-5 uppercase tracking-wider text-gray-600">
            {t('resumeViewer.application.emptyBody')}
          </p>
          <Button className="mt-4 w-full" type="button" onClick={() => openCreateApplicationDialog()}>
            <BadgeCheck className="w-4 h-4" />
            {t('resumeViewer.application.createAction')}
          </Button>
        </div>
      )}
    </aside>
  );

  const applicationDialog = (
    <Dialog
      open={applicationDialogOpen}
      onOpenChange={(open) => {
        if (open) {
          setApplicationDialogOpen(true);
        } else {
          closeApplicationDialog();
        }
      }}
    >
      <DialogContent className="max-w-2xl p-0">
        <form onSubmit={handleApplicationSubmit} className="p-6">
          <DialogHeader className="pr-10 text-left">
            <p className="font-mono text-xs uppercase tracking-wider text-gray-600">
              {t('resumeViewer.application.panelLabel')}
            </p>
            <DialogTitle className="font-serif text-2xl font-bold uppercase tracking-tight">
              {applicationDialogMode === 'create'
                ? t('resumeViewer.application.createDialogTitle')
                : t('resumeViewer.application.editDialogTitle')}
            </DialogTitle>
            <DialogDescription className="font-mono text-xs uppercase tracking-wider text-gray-600">
              {applicationDialogMode === 'create'
                ? t('resumeViewer.application.createDialogDescription')
                : t('resumeViewer.application.editDialogDescription')}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="application-company">
                {t('resumeViewer.application.companyLabel')}
              </Label>
              <Input
                id="application-company"
                value={applicationForm.company}
                onChange={(event) =>
                  setApplicationForm((current) => ({ ...current, company: event.target.value }))
                }
                required
                autoComplete="organization"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="application-role">{t('resumeViewer.application.roleLabel')}</Label>
              <Input
                id="application-role"
                value={applicationForm.role}
                onChange={(event) =>
                  setApplicationForm((current) => ({ ...current, role: event.target.value }))
                }
                required
                autoComplete="organization-title"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="application-job-url">
                {t('resumeViewer.application.jobUrlLabel')}
              </Label>
              <Input
                id="application-job-url"
                value={applicationForm.jobUrl}
                onChange={(event) =>
                  setApplicationForm((current) => ({ ...current, jobUrl: event.target.value }))
                }
                placeholder="https://..."
                autoComplete="url"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="application-notes">{t('resumeViewer.application.notesLabel')}</Label>
              <Textarea
                id="application-notes"
                value={applicationForm.notes}
                onChange={(event) =>
                  setApplicationForm((current) => ({ ...current, notes: event.target.value }))
                }
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.stopPropagation();
                  }
                }}
                rows={5}
              />
            </div>

            {applicationFormError && (
              <div className="border border-red-600 bg-red-50 p-3 font-mono text-xs text-red-700">
                {applicationFormError}
              </div>
            )}

            {applicationActionError && (
              <div className="border border-red-600 bg-red-50 p-3 font-mono text-xs text-red-700">
                {applicationActionError}
              </div>
            )}

            <div className="border border-black bg-[#F8F8F2] p-3 font-mono text-xs uppercase tracking-wider text-gray-600">
              {t('resumeViewer.application.formHint')}
            </div>
          </div>

          <DialogFooter className="mt-6 border-t border-black bg-[#E5E5E0] p-4">
            <Button type="button" variant="outline" onClick={closeApplicationDialog}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isSavingApplication}>
              {isSavingApplication ? t('common.saving') : t('common.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F0F0E8]">
        <Loader2 className="w-10 h-10 animate-spin text-blue-700 mb-4" />
        <p className="font-mono text-sm font-bold uppercase text-blue-700">
          {t('resumeViewer.loading')}
        </p>
      </div>
    );
  }

  if (error || !resumeData) {
    const isProcessing = processingStatus === 'processing';
    const isFailed = processingStatus === 'failed';

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F0F0E8] p-4">
        <div
          className={`border p-6 text-center max-w-md shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] ${
            isProcessing
              ? 'bg-blue-50 border-blue-200'
              : isFailed
                ? 'bg-orange-50 border-orange-200'
                : 'bg-red-50 border-red-200'
          }`}
        >
          <div className="flex justify-center mb-4">
            {isProcessing ? (
              <Loader2 className="w-8 h-8 animate-spin text-blue-700" />
            ) : isFailed ? (
              <AlertCircle className="w-8 h-8 text-orange-600" />
            ) : (
              <AlertCircle className="w-8 h-8 text-red-600" />
            )}
          </div>
          <p
            className={`font-bold mb-4 ${
              isProcessing ? 'text-blue-700' : isFailed ? 'text-orange-700' : 'text-red-700'
            }`}
          >
            {error || t('resumeViewer.resumeNotFound')}
          </p>
          <div className="flex flex-col gap-2">
            {isFailed && (
              <>
                <Button onClick={handleRetryProcessing} disabled={isRetrying}>
                  {isRetrying ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t('common.processing')}
                    </>
                  ) : (
                    t('resumeViewer.retryProcessing')
                  )}
                </Button>
                <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
                  {t('resumeViewer.deleteAndStartOver')}
                </Button>
              </>
            )}
            <Button variant="outline" onClick={() => router.push('/dashboard')}>
              {t('resumeViewer.returnToDashboard')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F0E8] py-12 px-4 md:px-8 overflow-y-auto">
      <div
        className="max-w-7xl mx-auto"
        data-linked-application-id={linkedApplication?.application_id ?? ''}
      >
        {/* Header Actions */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="w-4 h-4" />
            {t('nav.backToDashboard')}
          </Button>

          <div className="flex gap-3">
            {isMasterResume && (
              <Button onClick={() => setShowEnrichmentModal(true)} className="gap-2">
                <Sparkles className="w-4 h-4" />
                {t('resumeViewer.enhanceResume')}
              </Button>
            )}
            <Button variant="outline" onClick={handleEdit}>
              <Edit className="w-4 h-4" />
              {t('dashboard.editResume')}
            </Button>
            <Button variant="success" onClick={handleDownload} disabled={isDownloading}>
              <Download className="w-4 h-4" />
              {isDownloading ? t('common.generating') : t('resumeViewer.downloadResume')}
            </Button>
          </div>
        </div>

        {/* Editable Title (tailored resumes only) */}
        {!isMasterResume && (
          <div className="mb-6 no-print">
            {isEditingTitle ? (
              <input
                type="text"
                value={editingTitleValue}
                onChange={(e) => setEditingTitleValue(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={handleTitleKeyDown}
                autoFocus
                maxLength={80}
                placeholder={t('resumeViewer.titlePlaceholder')}
                className="font-serif text-2xl font-bold border-b-2 border-black bg-transparent outline-none w-full max-w-xl px-0 py-1"
              />
            ) : (
              <button
                onClick={() => {
                  setEditingTitleValue(resumeTitle || '');
                  setIsEditingTitle(true);
                }}
                className="group flex items-center gap-2 cursor-pointer bg-transparent border-none p-0"
              >
                <h2
                  className={`font-serif text-2xl font-bold border-b-2 border-transparent group-hover:border-black transition-colors ${!resumeTitle ? 'text-gray-400' : ''}`}
                >
                  {resumeTitle || t('resumeViewer.titlePlaceholder')}
                </h2>
                <Pencil
                  className={`w-4 h-4 transition-opacity ${resumeTitle ? 'opacity-0 group-hover:opacity-60' : 'opacity-40 group-hover:opacity-60'}`}
                />
              </button>
            )}
          </div>
        )}

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
          {/* Resume Viewer */}
          <div className="flex justify-center pb-4">
            <div className="resume-print w-full max-w-[250mm] shadow-[8px_8px_0px_0px_#000000] border-2 border-black bg-white">
              <Resume
                resumeData={localizedResumeData || resumeData}
                additionalSectionLabels={{
                  technicalSkills: t('resume.additionalLabels.technicalSkills'),
                  languages: t('resume.additionalLabels.languages'),
                  certifications: t('resume.additionalLabels.certifications'),
                  awards: t('resume.additionalLabels.awards'),
                }}
                sectionHeadings={{
                  summary: t('resume.sections.summary'),
                  experience: t('resume.sections.experience'),
                  education: t('resume.sections.education'),
                  projects: t('resume.sections.projects'),
                  certifications: t('resume.sections.certifications'),
                  skills: t('resume.sections.skillsOnly'),
                  languages: t('resume.sections.languages'),
                  awards: t('resume.sections.awards'),
                  links: t('resume.sections.links'),
                }}
                fallbackLabels={{ name: t('resume.defaults.name') }}
              />
            </div>
          </div>

          {applicationPanel}
        </div>

        <div className="flex justify-end pt-6 no-print">
          <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
            {isMasterResume
              ? t('confirmations.deleteMasterResumeTitle')
              : t('dashboard.deleteResume')}
          </Button>
        </div>
      </div>
      {applicationDialog}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title={
          isMasterResume ? t('confirmations.deleteMasterResumeTitle') : t('dashboard.deleteResume')
        }
        description={
          isMasterResume
            ? t('confirmations.deleteMasterResumeDescription')
            : t('confirmations.deleteResumeFromSystemDescription')
        }
        confirmLabel={t('confirmations.deleteResumeConfirmLabel')}
        cancelLabel={t('confirmations.keepResumeCancelLabel')}
        onConfirm={handleDeleteResume}
        variant="danger"
      />

      <ConfirmDialog
        open={showDeleteSuccessDialog}
        onOpenChange={setShowDeleteSuccessDialog}
        title={t('resumeViewer.deletedTitle')}
        description={
          isMasterResume
            ? t('resumeViewer.deletedDescriptionMaster')
            : t('resumeViewer.deletedDescriptionRegular')
        }
        confirmLabel={t('resumeViewer.returnToDashboard')}
        onConfirm={handleDeleteSuccessConfirm}
        variant="success"
        showCancelButton={false}
      />

      <ConfirmDialog
        open={showDownloadSuccessDialog}
        onOpenChange={setShowDownloadSuccessDialog}
        title={t('common.success')}
        description={t('builder.alerts.downloadSuccess')}
        confirmLabel={t('common.ok')}
        onConfirm={handleDownloadSuccessConfirm}
        variant="success"
        showCancelButton={false}
      />

      {deleteError && (
        <ConfirmDialog
          open={!!deleteError}
          onOpenChange={() => setDeleteError(null)}
          title={t('resumeViewer.deleteFailedTitle')}
          description={deleteError}
          confirmLabel={t('common.ok')}
          onConfirm={() => setDeleteError(null)}
          variant="danger"
          showCancelButton={false}
        />
      )}

      {/* Enrichment Modal - Only for master resume */}
      {isMasterResume && (
        <EnrichmentModal
          resumeId={resumeId}
          isOpen={showEnrichmentModal}
          onClose={() => setShowEnrichmentModal(false)}
          onComplete={handleEnrichmentComplete}
        />
      )}
    </div>
  );
}
