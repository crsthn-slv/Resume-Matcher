---
phase: 03
slug: workflow-integrations
status: approved
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-23
---

# Phase 03 — Validation Strategy

> Retroactive Nyquist validation contract reconstructed from the executed Phase 3 artifacts.

---

## Test Infrastructure

| Property               | Value                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Framework**          | Vitest + React Testing Library                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| **Config file**        | [`apps/frontend/vitest.config.ts`](/Users/cristhian/Downloads/Projetos/Resume Matcher/apps/frontend/vitest.config.ts)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **Quick run command**  | `cd apps/frontend && npx vitest run tests/applications-config.test.ts tests/settings-application-pipeline.test.tsx tests/post-tailor-prefill.test.ts`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **Full suite command** | `cd apps/frontend && npx eslint tests/applications-config.test.ts tests/settings-application-pipeline.test.tsx tests/post-tailor-prefill.test.ts app/'(default)'/settings/page.tsx app/'(default)'/tailor/page.tsx lib/api/config.ts lib/applications/post-tailor-prefill.ts && npx prettier --check tests/applications-config.test.ts tests/settings-application-pipeline.test.tsx tests/post-tailor-prefill.test.ts app/'(default)'/settings/page.tsx app/'(default)'/tailor/page.tsx lib/api/config.ts lib/applications/post-tailor-prefill.ts && npx vitest run tests/applications-config.test.ts tests/settings-application-pipeline.test.tsx tests/post-tailor-prefill.test.ts` |
| **Estimated runtime**  | ~3 seconds                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |

## Sampling Rate

- **After every Settings or tailoring handoff task commit:** Run `cd apps/frontend && npx vitest run tests/applications-config.test.ts tests/settings-application-pipeline.test.tsx tests/post-tailor-prefill.test.ts`
- **After every plan wave:** Run `cd apps/frontend && npx eslint tests/applications-config.test.ts tests/settings-application-pipeline.test.tsx tests/post-tailor-prefill.test.ts app/'(default)'/settings/page.tsx app/'(default)'/tailor/page.tsx lib/api/config.ts lib/applications/post-tailor-prefill.ts && npx prettier --check tests/applications-config.test.ts tests/settings-application-pipeline.test.tsx tests/post-tailor-prefill.test.ts app/'(default)'/settings/page.tsx app/'(default)'/tailor/page.tsx lib/api/config.ts lib/applications/post-tailor-prefill.ts && npx vitest run tests/applications-config.test.ts tests/settings-application-pipeline.test.tsx tests/post-tailor-prefill.test.ts`
- **Before `$gsd-verify-work`:** Focused suite must be green
- **Max feedback latency:** 5 seconds

## Per-Task Verification Map

| Task ID  | Plan | Wave | Requirement | Test Type            | Automated Command                                                                                                   | File Exists | Status   |
| -------- | ---- | ---- | ----------- | -------------------- | ------------------------------------------------------------------------------------------------------------------- | ----------- | -------- |
| 03-01-01 | 01   | 1    | SET-01      | integration          | `cd apps/frontend && npx vitest run tests/applications-config.test.ts tests/settings-application-pipeline.test.tsx` | ✅          | ✅ green |
| 03-01-02 | 01   | 1    | SET-02      | integration          | `cd apps/frontend && npx vitest run tests/settings-application-pipeline.test.tsx`                                   | ✅          | ✅ green |
| 03-01-03 | 01   | 1    | SET-03      | integration          | `cd apps/frontend && npx vitest run tests/applications-config.test.ts tests/settings-application-pipeline.test.tsx` | ✅          | ✅ green |
| 03-02-01 | 02   | 2    | TAIL-01     | integration          | `cd apps/frontend && npx vitest run tests/post-tailor-prefill.test.ts`                                              | ✅          | ✅ green |
| 03-02-02 | 02   | 2    | TAIL-02     | integration          | `cd apps/frontend && npx vitest run tests/post-tailor-prefill.test.ts`                                              | ✅          | ✅ green |
| 03-02-03 | 02   | 2    | TAIL-01     | static + integration | `cd apps/frontend && npx vitest run tests/post-tailor-prefill.test.ts`                                              | ✅          | ✅ green |

_Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky_

## Evidence Mapping

- [`apps/frontend/tests/applications-config.test.ts`](/Users/cristhian/Downloads/Projetos/Resume Matcher/apps/frontend/tests/applications-config.test.ts) covers:
  - loading the effective application pipeline config from `/config/applications` for `SET-01`
  - preserving backend `affected_applications` payloads in `ApplicationsConfigError` for `SET-03`
- [`apps/frontend/tests/settings-application-pipeline.test.tsx`](/Users/cristhian/Downloads/Projetos/Resume Matcher/apps/frontend/tests/settings-application-pipeline.test.tsx) covers:
  - rendering the current statuses inside the existing Settings page for `SET-01`
  - local add, reorder, remove, and explicit save behavior for `SET-02`
  - rendering the affected application list when a removal is rejected by the backend for `SET-03`
- [`apps/frontend/tests/post-tailor-prefill.test.ts`](/Users/cristhian/Downloads/Projetos/Resume Matcher/apps/frontend/tests/post-tailor-prefill.test.ts) covers:
  - one-shot post-tailoring create intent parsing for `TAIL-01`
  - prefilled `company`, `role`, `job_url`, `resume_id`, and `job_id` payload construction for `TAIL-02`
  - URL cleanup after handoff processing, preserving the normal resume-centric destination for `TAIL-01`
- [`apps/frontend/app/(default)/tailor/page.tsx`](/Users/cristhian/Downloads/Projetos/Resume Matcher/apps/frontend/app/(default)/tailor/page.tsx), [`apps/frontend/app/(default)/resumes/[id]/page.tsx`](/Users/cristhian/Downloads/Projetos/Resume Matcher/apps/frontend/app/(default)/resumes/[id]/page.tsx), and [`03-VERIFICATION.md`](/Users/cristhian/Downloads/Projetos/Resume Matcher/.planning/phases/03-workflow-integrations/03-VERIFICATION.md) provide static evidence that the handoff still lands on `/resumes/[id]` and reuses the existing resume viewer flow instead of a parallel route.

Primary evidence files:

- [`apps/frontend/tests/applications-config.test.ts`](/Users/cristhian/Downloads/Projetos/Resume Matcher/apps/frontend/tests/applications-config.test.ts)
- [`apps/frontend/tests/settings-application-pipeline.test.tsx`](/Users/cristhian/Downloads/Projetos/Resume Matcher/apps/frontend/tests/settings-application-pipeline.test.tsx)
- [`apps/frontend/tests/post-tailor-prefill.test.ts`](/Users/cristhian/Downloads/Projetos/Resume Matcher/apps/frontend/tests/post-tailor-prefill.test.ts)

## Wave 0 Requirements

Existing frontend infrastructure covers all phase requirements.

## Manual-Only Verifications

All phase behaviors have automated verification, with static verification reinforcement for the resume-centric handoff documented in [`03-VERIFICATION.md`](/Users/cristhian/Downloads/Projetos/Resume Matcher/.planning/phases/03-workflow-integrations/03-VERIFICATION.md).

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 5s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-03-23
