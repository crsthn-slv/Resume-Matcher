import type { ApplicationListItem } from '@/lib/api/applications';
import type { ResumeListItem } from '@/lib/api/resume';

export type TailoredResumeRow = ResumeListItem & {
  application: ApplicationListItem | null;
};

export function formatApplicationStatusLabel(status: string): string {
  return status
    .trim()
    .replace(/[\s_-]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function normalizeApplicationStatus(status: string): string {
  return status
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, ' ');
}

export function getApplicationBadgeVariant(
  status: string
): 'default' | 'success' | 'warning' | 'danger' | 'outline' {
  const normalized = normalizeApplicationStatus(status);

  if (normalized.includes('reject') || normalized.includes('declin')) {
    return 'danger';
  }

  if (
    normalized.includes('offer') ||
    normalized.includes('hired') ||
    normalized.includes('accept')
  ) {
    return 'success';
  }

  if (normalized.includes('interview') || normalized.includes('screen')) {
    return 'warning';
  }

  if (normalized.includes('appl')) {
    return 'default';
  }

  return 'outline';
}

export function uniqueStatuses(statuses: string[]): string[] {
  const seen = new Set<string>();
  const unique: string[] = [];

  for (const status of statuses) {
    const normalized = status.trim();
    if (!normalized) {
      continue;
    }

    const key = normalized.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(normalized);
    }
  }

  return unique;
}

export function filterTailoredResumeRows(
  rows: TailoredResumeRow[],
  searchQuery: string,
  statusFilters: string[]
): TailoredResumeRow[] {
  const trimmedApplicationSearchQuery = searchQuery.trim().toLowerCase();

  return rows.filter((resume) => {
    const application = resume.application;
    const searchableText = [application?.company, application?.role]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    const matchesQuery = trimmedApplicationSearchQuery
      ? searchableText.includes(trimmedApplicationSearchQuery)
      : true;
    const matchesStatus =
      statusFilters.length === 0 ||
      (application ? statusFilters.includes(application.status) : false);

    return matchesQuery && matchesStatus;
  });
}

export function sortTailoredResumeRowsByActivity(rows: TailoredResumeRow[]): TailoredResumeRow[] {
  return [...rows].sort((left, right) => {
    const leftApplication = left.application;
    const rightApplication = right.application;

    if (leftApplication && !rightApplication) {
      return -1;
    }

    if (!leftApplication && rightApplication) {
      return 1;
    }

    const leftUpdatedAt = Date.parse(leftApplication?.updated_at ?? left.updated_at ?? '');
    const rightUpdatedAt = Date.parse(rightApplication?.updated_at ?? right.updated_at ?? '');

    if (Number.isNaN(leftUpdatedAt) && Number.isNaN(rightUpdatedAt)) {
      return right.resume_id.localeCompare(left.resume_id);
    }

    if (Number.isNaN(leftUpdatedAt)) {
      return 1;
    }

    if (Number.isNaN(rightUpdatedAt)) {
      return -1;
    }

    return rightUpdatedAt - leftUpdatedAt;
  });
}
