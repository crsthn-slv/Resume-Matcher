---
phase: 03-workflow-integrations
plan: 02
subsystem: ui
tags: [react, nextjs, tailoring, resume-viewer, applications]
requires:
  - phase: 02-dashboard-resume-linked-experience
    provides: resume viewer linked-application create/edit/status flow
provides:
  - Post-tailoring handoff into application creation
  - Prefilled company, role, job URL, resume_id, and job_id in the linked application flow
  - Resume-centric recovery path for immediate application creation
affects: [tailor, resume-viewer, application-tracker]
tech-stack:
  added: []
  patterns:
    - Tailoring hands off into the existing resume viewer instead of a new application route
    - Resume viewer auto-opens the linked application create flow from a route-safe handoff
key-files:
  created: []
  modified:
    - apps/frontend/app/(default)/tailor/page.tsx
    - apps/frontend/app/(default)/resumes/[id]/page.tsx
    - apps/frontend/messages/en.json
    - apps/frontend/messages/es.json
    - apps/frontend/messages/ja.json
    - apps/frontend/messages/pt-BR.json
    - apps/frontend/messages/zh.json
key-decisions:
  - "Tailoring still lands on /resumes/[id], with create-application intent carried by a transient route handoff."
  - "Company, role, and job URL are captured during tailoring so the post-tailoring application form opens prefilled instead of blank."
patterns-established:
  - "Tailor-side prefill copy lives under tailor.applicationPrefill in each locale file."
  - "Resume viewer reads one-shot post-tailoring create params, auto-opens the dialog, then cleans the URL."
requirements-completed: [TAIL-01, TAIL-02]
duration: 37min
completed: 2026-03-23
---

# Phase 03 Plan 02: Post-Tailoring Application Handoff Summary

**Immediate post-tailoring application creation inside the resume viewer, with linked identifiers and company/role/job URL prefilled when provided**

## Performance

- **Duration:** 37 min
- **Started:** 2026-03-23T14:06:00Z
- **Completed:** 2026-03-23T14:43:00Z
- **Tasks:** 3
- **Files modified:** 7

## Accomplishments
- Extended the tailoring page to collect company, role, and job URL so those values can flow directly into the linked application create form.
- Updated the post-confirm routing path to keep the normal `/resumes/[id]` destination while carrying a one-shot create-application handoff.
- Reused the existing resume viewer application dialog, auto-opening it with prefilled identifiers and metadata, then cleaning the URL after the handoff.

## Task Commits

Implemented in the phase execution worktree and grouped into the phase-level implementation commit.

## Files Created/Modified
- `apps/frontend/app/(default)/tailor/page.tsx` - application-prefill inputs and route handoff into the resume viewer
- `apps/frontend/app/(default)/resumes/[id]/page.tsx` - post-tailoring handoff parsing, auto-open create flow, and prefilled application form state
- `apps/frontend/messages/en.json` - tailoring/application handoff copy in English
- `apps/frontend/messages/es.json` - tailoring/application handoff copy in Spanish
- `apps/frontend/messages/ja.json` - tailoring/application handoff copy in Japanese
- `apps/frontend/messages/pt-BR.json` - tailoring/application handoff copy in Brazilian Portuguese
- `apps/frontend/messages/zh.json` - tailoring/application handoff copy in Chinese

## Decisions Made
- Use the existing resume viewer as the only application-creation destination after tailoring to preserve the product's resume-centric workflow.
- Treat company, role, and job URL as user-provided prefill data from the tailoring step rather than inventing them later from incomplete job records.

## Deviations from Plan

- The implementation expanded the plan slightly by adding explicit tailor-side inputs for `company`, `role`, and `job_url`, which was necessary because those fields were not otherwise available from the current job record shape.

## Issues Encountered

- The current stored job model only exposes `job_id` and raw content, so `job_url` could not be sourced automatically from backend data alone.

## User Setup Required

None - the new handoff is built into the existing tailoring page.

## Next Phase Readiness

- Phase 3 now leaves the user in a continuous flow from tailoring to tracker creation.
- Phase 4 can focus on test coverage, i18n hardening, and release polish across the completed tracker workflow.

---
*Phase: 03-workflow-integrations*
*Completed: 2026-03-23*
