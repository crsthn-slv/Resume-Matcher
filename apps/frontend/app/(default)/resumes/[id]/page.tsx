'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
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
  fetchApplications,
  resolveApplicationByResumeId,
  type ApplicationListItem,
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
} from 'lucide-react';
import { EnrichmentModal } from '@/components/enrichment/enrichment-modal';
import { useTranslations } from '@/lib/i18n';
import { withLocalizedDefaultSections } from '@/lib/utils/section-helpers';
import { useLanguage } from '@/lib/context/language-context';
import { downloadBlobAsFile, openUrlInNewTab, sanitizeFilename } from '@/lib/utils/download';

type ProcessingStatus = 'pending' | 'processing' | 'ready' | 'failed';

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
  const [resumeTitle, setResumeTitle] = useState<string | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editingTitleValue, setEditingTitleValue] = useState('');
  const [linkedApplication, setLinkedApplication] = useState<ApplicationListItem | null>(null);
  const [linkedJobDescription, setLinkedJobDescription] = useState<string | null>(null);

  const resumeId = params?.id as string;

  const localizedResumeData = useMemo(() => {
    if (!resumeData) return null;
    return withLocalizedDefaultSections(resumeData, t);
  }, [resumeData, t]);

  const orderedStatusHistory = useMemo(() => {
    return linkedApplication?.status_history ? [...linkedApplication.status_history].reverse() : [];
  }, [linkedApplication]);

  useEffect(() => {
    if (!resumeId) return;
    let cancelled = false;

    const loadResume = async () => {
      try {
        setLoading(true);
        setError(null);
        const [resumeResult, applicationResult, jobDescriptionResult] = await Promise.allSettled([
          fetchResume(resumeId),
          fetchApplications(),
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
        } else {
          console.error('Failed to load applications for resume detail:', applicationResult.reason);
          setLinkedApplication(null);
        }

        if (jobDescriptionResult.status === 'fulfilled') {
          setLinkedJobDescription(jobDescriptionResult.value.content ?? null);
        } else {
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
            <Button variant="outline" size="sm" type="button">
              <Edit className="w-4 h-4" />
              {t('resumeViewer.application.editAction')}
            </Button>
          ) : (
            <Button type="button">
              {t('resumeViewer.application.createAction')}
            </Button>
          )}
        </div>
      </div>

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
              <div className="mt-2 inline-flex items-center border border-black bg-[#F0F0E8] px-3 py-1 font-mono text-xs uppercase tracking-wider">
                {linkedApplication.status}
              </div>
            </div>
            <div className="border border-black p-4">
              <p className="font-mono text-[11px] uppercase tracking-wider text-gray-600">
                {t('resumeViewer.application.linkedResumeLabel')}
              </p>
              <p className="mt-2 font-mono text-sm">{linkedApplication.resume_title ?? resumeTitle ?? resumeId ?? t('common.unknown')}</p>
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
          <Button className="mt-4 w-full" type="button">
            {t('resumeViewer.application.createAction')}
          </Button>
        </div>
      )}
    </aside>
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
            <Button variant="success" onClick={handleDownload}>
              <Download className="w-4 h-4" />
              {t('resumeViewer.downloadResume')}
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
