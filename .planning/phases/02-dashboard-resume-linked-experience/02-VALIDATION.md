---
phase: 02
slug: dashboard-resume-linked-experience
status: approved
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-23
---

# Phase 02 — Validation Strategy

> Retroactive Nyquist validation contract reconstructed from the executed Phase 2 artifacts.

---

## Test Infrastructure

| Property               | Value                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Framework**          | Vitest + React Testing Library                                                                                                                                                                                                                                                                                                                                                                                                     |
| **Config file**        | [`apps/frontend/vitest.config.ts`](/Users/cristhian/Downloads/Projetos/Resume Matcher/apps/frontend/vitest.config.ts)                                                                                                                                                                                                                                                                                                              |
| **Quick run command**  | `cd apps/frontend && npx vitest run tests/dashboard-application-filtering.test.ts tests/resume-viewer-applications.test.tsx`                                                                                                                                                                                                                                                                                                       |
| **Full suite command** | `cd apps/frontend && npx eslint tests/dashboard-application-filtering.test.ts tests/resume-viewer-applications.test.tsx app/'(default)'/resumes/'[id]'/page.tsx && npx prettier --check tests/dashboard-application-filtering.test.ts tests/resume-viewer-applications.test.tsx app/'(default)'/resumes/'[id]'/page.tsx && npx vitest run tests/dashboard-application-filtering.test.ts tests/resume-viewer-applications.test.tsx` |
| **Estimated runtime**  | ~3 seconds                                                                                                                                                                                                                                                                                                                                                                                                                         |

## Sampling Rate

- **After every dashboard/viewer task commit:** Run `cd apps/frontend && npx vitest run tests/dashboard-application-filtering.test.ts tests/resume-viewer-applications.test.tsx`
- **After every plan wave:** Run `cd apps/frontend && npx eslint tests/dashboard-application-filtering.test.ts tests/resume-viewer-applications.test.tsx app/'(default)'/resumes/'[id]'/page.tsx && npx prettier --check tests/dashboard-application-filtering.test.ts tests/resume-viewer-applications.test.tsx app/'(default)'/resumes/'[id]'/page.tsx && npx vitest run tests/dashboard-application-filtering.test.ts tests/resume-viewer-applications.test.tsx`
- **Before `$gsd-verify-work`:** Focused suite must be green
- **Max feedback latency:** 5 seconds

## Per-Task Verification Map

| Task ID  | Plan | Wave | Requirement | Test Type            | Automated Command                                                                  | File Exists | Status   |
| -------- | ---- | ---- | ----------- | -------------------- | ---------------------------------------------------------------------------------- | ----------- | -------- |
| 02-01-01 | 01   | 1    | DASH-01     | static + integration | `cd apps/frontend && npx vitest run tests/dashboard-application-filtering.test.ts` | ✅          | ✅ green |
| 02-01-02 | 01   | 1    | PIPE-04     | integration          | `cd apps/frontend && npx vitest run tests/dashboard-application-filtering.test.ts` | ✅          | ✅ green |
| 02-01-03 | 01   | 1    | PIPE-05     | integration          | `cd apps/frontend && npx vitest run tests/dashboard-application-filtering.test.ts` | ✅          | ✅ green |
| 02-02-01 | 02   | 2    | PIPE-04     | integration          | `cd apps/frontend && npx vitest run tests/dashboard-application-filtering.test.ts` | ✅          | ✅ green |
| 02-02-02 | 02   | 2    | DASH-02     | integration          | `cd apps/frontend && npx vitest run tests/dashboard-application-filtering.test.ts` | ✅          | ✅ green |
| 02-02-03 | 02   | 2    | PIPE-05     | integration          | `cd apps/frontend && npx vitest run tests/dashboard-application-filtering.test.ts` | ✅          | ✅ green |
| 02-03-01 | 03   | 3    | APPL-05     | integration          | `cd apps/frontend && npx vitest run tests/resume-viewer-applications.test.tsx`     | ✅          | ✅ green |
| 02-03-02 | 03   | 3    | APPL-06     | integration          | `cd apps/frontend && npx vitest run tests/resume-viewer-applications.test.tsx`     | ✅          | ✅ green |
| 02-03-03 | 03   | 3    | DASH-03     | integration          | `cd apps/frontend && npx vitest run tests/resume-viewer-applications.test.tsx`     | ✅          | ✅ green |

_Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky_

## Evidence Mapping

- [`apps/frontend/tests/dashboard-application-filtering.test.ts`](/Users/cristhian/Downloads/Projetos/Resume Matcher/apps/frontend/tests/dashboard-application-filtering.test.ts) covers:
  - free-text filtering over linked application `company` and `role` for `PIPE-04`
  - multi-status filtering and recent-activity ordering for `PIPE-05`
  - stable badge variant/label behavior that supports `DASH-02`
  - linked results remaining tailored-resume rows, which reinforces `DASH-01`
- [`apps/frontend/tests/resume-viewer-applications.test.tsx`](/Users/cristhian/Downloads/Projetos/Resume Matcher/apps/frontend/tests/resume-viewer-applications.test.tsx) covers:
  - linked application details, linked job description, and reverse-ordered status history for `APPL-05`
  - opening the embedded edit flow with application metadata prefilled for `APPL-06`
  - managing the linked application from the normal resume viewer route for `DASH-03`
- [`apps/frontend/app/(default)/resumes/[id]/page.tsx`](/Users/cristhian/Downloads/Projetos/Resume Matcher/apps/frontend/app/(default)/resumes/[id]/page.tsx) plus [`02-VERIFICATION.md`](/Users/cristhian/Downloads/Projetos/Resume Matcher/.planning/phases/02-dashboard-resume-linked-experience/02-VERIFICATION.md) provide static evidence that metadata patch and dedicated status mutation stay separated, preserving the Phase 1 audit model while satisfying the UI contract for `APPL-06`.

Primary evidence files:

- [`apps/frontend/tests/dashboard-application-filtering.test.ts`](/Users/cristhian/Downloads/Projetos/Resume Matcher/apps/frontend/tests/dashboard-application-filtering.test.ts)
- [`apps/frontend/tests/resume-viewer-applications.test.tsx`](/Users/cristhian/Downloads/Projetos/Resume Matcher/apps/frontend/tests/resume-viewer-applications.test.tsx)

## Wave 0 Requirements

Existing frontend infrastructure covers all phase requirements.

## Manual-Only Verifications

All phase behaviors have automated verification, with code-inspection reinforcement for the metadata/status endpoint split documented in [`02-VERIFICATION.md`](/Users/cristhian/Downloads/Projetos/Resume Matcher/.planning/phases/02-dashboard-resume-linked-experience/02-VERIFICATION.md).

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 5s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-03-23
