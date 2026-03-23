---
phase: 04-quality-and-release-hardening
plan: 01
subsystem: quality
tags: [i18n, vitest, unittest, frontend, backend]
requires:
  - phase: 02-dashboard-resume-linked-experience
    provides: dashboard and resume-viewer tracker flows
  - phase: 03-workflow-integrations
    provides: Settings pipeline and post-tailoring tracker integration
provides:
  - Tracker locale coverage audit and confirmation across supported locales
  - Targeted frontend regression tests for dashboard and post-tailoring tracker logic
  - Expanded backend applications endpoint regression coverage
affects: [i18n, tests, dashboard, resume-viewer, settings, tailor]
tech-stack:
  added: []
  patterns:
    - Pure tracker behavior is extracted into helper modules for focused Vitest coverage
    - Backend tracker regression coverage stays inside the existing applications endpoint suite
key-files:
  created:
    - apps/frontend/lib/dashboard/application-filtering.ts
    - apps/frontend/lib/applications/post-tailor-prefill.ts
    - apps/frontend/tests/dashboard-application-filtering.test.ts
    - apps/frontend/tests/post-tailor-prefill.test.ts
    - apps/frontend/tests/applications-config.test.ts
  modified:
    - apps/frontend/app/(default)/dashboard/page.tsx
    - apps/frontend/app/(default)/resumes/[id]/page.tsx
    - apps/frontend/tests/diff-preview-modal.test.tsx
    - apps/frontend/components/tailor/diff-preview-modal.tsx
    - apps/backend/tests/test_applications_endpoints.py
key-decisions:
  - "Cover tracker regression risk with extracted pure helpers and focused tests instead of broad page-level snapshots."
  - "Use the backend virtualenv for tracker tests because the system Python lacks FastAPI in this workspace."
patterns-established:
  - "Dashboard filtering and post-tailoring handoff logic now live in reusable frontend helper modules."
  - "Tracker config error handling is regression-tested at the API-helper layer."
requirements-completed: [QUAL-01, QUAL-02]
duration: 43min
completed: 2026-03-23
---

# Phase 04 Plan 01: Localization and Automated Coverage Summary

**Tracker hardening through locale coverage confirmation, focused frontend regression tests, and expanded backend applications endpoint tests**

## Performance

- **Duration:** 43 min
- **Started:** 2026-03-23T14:34:00Z
- **Completed:** 2026-03-23T15:17:00Z
- **Tasks:** 3
- **Files modified:** 10

## Accomplishments
- Confirmed tracker locale coverage across dashboard, resume viewer, Settings pipeline, and tailoring handoff surfaces, keeping the existing locale structure intact.
- Added focused Vitest coverage for dashboard application filtering, post-tailoring application prefill resolution, and config-level application pipeline error handling.
- Expanded backend applications endpoint coverage with additional release-critical status behavior tests and validated the suite in the backend `.venv`.

## Task Commits

Implemented in the phase execution worktree and grouped into the phase-level implementation commit.

## Files Created/Modified
- `apps/frontend/lib/dashboard/application-filtering.ts` - extracted dashboard tracker filtering and ordering helpers
- `apps/frontend/lib/applications/post-tailor-prefill.ts` - extracted post-tailoring create-flow handoff helpers
- `apps/frontend/tests/dashboard-application-filtering.test.ts` - dashboard tracker helper coverage
- `apps/frontend/tests/post-tailor-prefill.test.ts` - post-tailoring prefill coverage
- `apps/frontend/tests/applications-config.test.ts` - Settings pipeline config helper coverage
- `apps/frontend/app/(default)/dashboard/page.tsx` - dashboard updated to consume extracted tested helpers
- `apps/frontend/app/(default)/resumes/[id]/page.tsx` - resume viewer updated to consume extracted tested helpers
- `apps/frontend/tests/diff-preview-modal.test.tsx` - stabilized existing modal test around actual DOM behavior
- `apps/frontend/components/tailor/diff-preview-modal.tsx` - formatting-only cleanup surfaced by lint
- `apps/backend/tests/test_applications_endpoints.py` - expanded release-critical backend tracker tests

## Decisions Made
- Prefer testing pure tracker behavior modules over trying to mount complex App Router pages in every regression test.
- Treat the repo's backend virtualenv as the authoritative test runner for backend coverage in this workspace.

## Deviations from Plan

- No locale file content changes were needed after the audit because the required tracker key families were already present across supported locales.

## Issues Encountered

- `python3 -m unittest` failed under the system interpreter because `fastapi` was unavailable there; switching to `apps/backend/.venv/bin/python` resolved backend test execution.
- An older `DiffPreviewModal` test was relying on a brittle Lucide CSS class and needed to be updated to assert actual rendered warning-banner behavior.

## User Setup Required

None.

## Next Phase Readiness

- Release validation can now use real automated evidence from frontend lint/tests/format and backend tracker tests.
- Phase 04-02 can focus on final validation and milestone state updates rather than building new coverage from scratch.

---
*Phase: 04-quality-and-release-hardening*
*Completed: 2026-03-23*
