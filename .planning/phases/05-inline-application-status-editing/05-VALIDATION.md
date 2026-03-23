---
phase: 05
slug: inline-application-status-editing
status: approved
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-23
---

# Phase 05 — Validation Strategy

> Retroactive Nyquist validation contract reconstructed from the executed Phase 5 artifacts. This phase has no formal requirement IDs in [`ROADMAP.md`](/Users/cristhian/Downloads/Projetos/Resume Matcher/.planning/ROADMAP.md), so coverage is mapped to the plan tasks and must-have behaviors instead.

---

## Test Infrastructure

| Property               | Value                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Framework**          | Vitest + React Testing Library                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| **Config file**        | [`apps/frontend/vitest.config.ts`](/Users/cristhian/Downloads/Projetos/Resume Matcher/apps/frontend/vitest.config.ts)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| **Quick run command**  | `cd apps/frontend && npx vitest run tests/applications-inline-status.test.ts tests/post-tailor-prefill.test.ts tests/resume-viewer-applications.test.tsx`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| **Full suite command** | `cd apps/frontend && npx eslint tests/applications-inline-status.test.ts tests/post-tailor-prefill.test.ts tests/resume-viewer-applications.test.tsx app/'(default)'/dashboard/page.tsx app/'(default)'/resumes/'[id]'/page.tsx components/ui/card.tsx components/ui/dropdown.tsx lib/api/applications.ts lib/applications/post-tailor-prefill.ts && npx prettier --check tests/applications-inline-status.test.ts tests/post-tailor-prefill.test.ts tests/resume-viewer-applications.test.tsx app/'(default)'/dashboard/page.tsx app/'(default)'/resumes/'[id]'/page.tsx components/ui/card.tsx components/ui/dropdown.tsx lib/api/applications.ts lib/applications/post-tailor-prefill.ts messages/en.json messages/es.json messages/ja.json messages/pt-BR.json messages/zh.json && npx vitest run tests/applications-inline-status.test.ts tests/post-tailor-prefill.test.ts tests/resume-viewer-applications.test.tsx` |
| **Estimated runtime**  | ~3 seconds                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |

## Sampling Rate

- **After every inline-status task commit:** Run `cd apps/frontend && npx vitest run tests/applications-inline-status.test.ts tests/post-tailor-prefill.test.ts tests/resume-viewer-applications.test.tsx`
- **After every plan wave:** Run focused frontend lint, format checks, and the focused Vitest suite for dashboard/viewer inline status and fallback helpers.
- **Before `$gsd-verify-work`:** Focused suite must be green.
- **Max feedback latency:** 5 seconds

## Per-Task Verification Map

| Task ID  | Plan | Wave | Behavior Under Test                                                                                                    | Test Type   | Automated Command                                                                                                                                         | File Exists | Status   |
| -------- | ---- | ---- | ---------------------------------------------------------------------------------------------------------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | -------- |
| 05-01-01 | 01   | 1    | Shared inline-status helpers normalize statuses, derive quick-create payloads, and support optimistic status snapshots | integration | `cd apps/frontend && npx vitest run tests/applications-inline-status.test.ts`                                                                             | ✅          | ✅ green |
| 05-01-02 | 01   | 1    | Dashboard quick-create fallback builds the normal create-form query when inference is insufficient                     | integration | `cd apps/frontend && npx vitest run tests/applications-inline-status.test.ts tests/post-tailor-prefill.test.ts`                                           | ✅          | ✅ green |
| 05-02-01 | 02   | 2    | Resume viewer keeps linked-application details intact while using the new inline badge surface                         | integration | `cd apps/frontend && npx vitest run tests/resume-viewer-applications.test.tsx`                                                                            | ✅          | ✅ green |
| 05-02-02 | 02   | 2    | Phase 5 regression coverage protects dashboard helper paths and resume-viewer linked-application rendering             | integration | `cd apps/frontend && npx vitest run tests/applications-inline-status.test.ts tests/post-tailor-prefill.test.ts tests/resume-viewer-applications.test.tsx` | ✅          | ✅ green |

_Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky_

## Evidence Mapping

- [`apps/frontend/tests/applications-inline-status.test.ts`](/Users/cristhian/Downloads/Projetos/Resume Matcher/apps/frontend/tests/applications-inline-status.test.ts) covers:
  - status-option normalization for inline menus
  - dashboard quick-create success when `company` and `role` can be inferred
  - explicit insufficient-inference fallback for unlinked cards
  - optimistic status snapshot generation used by both dashboard and resume viewer
- [`apps/frontend/tests/post-tailor-prefill.test.ts`](/Users/cristhian/Downloads/Projetos/Resume Matcher/apps/frontend/tests/post-tailor-prefill.test.ts) covers the query-param builder used by the Phase 5 fallback path to open the normal creation form with the maximum available prefill.
- [`apps/frontend/tests/resume-viewer-applications.test.tsx`](/Users/cristhian/Downloads/Projetos/Resume Matcher/apps/frontend/tests/resume-viewer-applications.test.tsx) covers the resume viewer linked-application surface that Phase 5 preserves while replacing the old status-change section.
- [`05-VERIFICATION.md`](/Users/cristhian/Downloads/Projetos/Resume Matcher/.planning/phases/05-inline-application-status-editing/05-VERIFICATION.md) provides static evidence for the page-level inline badge interaction in both dashboard and resume viewer, including:
  - clickable status badges on all tailored-resume cards
  - direct status updates through the dedicated endpoint for linked applications
  - quick-create followed by fallback-to-form behavior for unlinked cards
  - removal of the old standalone status-change block in the resume viewer

Primary evidence files:

- [`apps/frontend/tests/applications-inline-status.test.ts`](/Users/cristhian/Downloads/Projetos/Resume Matcher/apps/frontend/tests/applications-inline-status.test.ts)
- [`apps/frontend/tests/post-tailor-prefill.test.ts`](/Users/cristhian/Downloads/Projetos/Resume Matcher/apps/frontend/tests/post-tailor-prefill.test.ts)
- [`apps/frontend/tests/resume-viewer-applications.test.tsx`](/Users/cristhian/Downloads/Projetos/Resume Matcher/apps/frontend/tests/resume-viewer-applications.test.tsx)

## Wave 0 Requirements

The phase has no formal requirement IDs. Existing frontend test infrastructure and focused helper coverage cover the executable behaviors defined in the plan must-haves.

## Manual-Only Verifications

The shared helper behavior is automated. Page-level confirmation that the dashboard and resume viewer both use the badge-triggered inline interaction is reinforced through [`05-VERIFICATION.md`](/Users/cristhian/Downloads/Projetos/Resume Matcher/.planning/phases/05-inline-application-status-editing/05-VERIFICATION.md) rather than a brittle full-page interaction test.

## Validation Sign-Off

- [x] All tasks have automated verify coverage or static verification reinforcement
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all phase behaviors despite the absence of formal requirement IDs
- [x] No watch-mode flags
- [x] Feedback latency < 5s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-03-23
