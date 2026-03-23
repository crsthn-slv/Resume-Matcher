# Phase 4: Quality and Release Hardening - Context

**Gathered:** 2026-03-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Close the application-tracker MVP with translation coverage, automated regression coverage, and release-hardening validation. This phase is about finishing and proving the tracker workflow already built in Phases 1 through 3. It does not add new tracker capabilities or expand product scope.

</domain>

<decisions>
## Implementation Decisions

### Localization and copy hardening
- **D-01:** Phase 4 should treat missing or inconsistent tracker copy across supported locales as release work, not as a reason to redesign flows.
- **D-02:** Translation work should focus on the tracker surfaces already delivered: dashboard, resume viewer, Settings pipeline management, and post-tailoring application handoff.

### Automated coverage
- **D-03:** Test coverage should prioritize the tracker's main user paths over broad snapshot volume: manual/linked creation, filtering, status changes, pipeline validation, and post-tailoring handoff.
- **D-04:** Backend and frontend tests should extend the existing test/tooling conventions already present in the repo rather than introducing a new testing stack.

### Release polish
- **D-05:** Final polish should preserve the established Swiss-style UI and current resume-centric workflow instead of redesigning screens late in the milestone.
- **D-06:** Validation for this phase should be evidence-driven: linting, formatting, automated tests, and targeted gap fixes based on real failures.

### the agent's Discretion
- Exact split between backend and frontend test files, as long as all Phase 4 requirements are covered.
- Exact order of localization vs tests vs polish work, as long as release-risk items are handled first.
- Whether small UX fixes land inside test-driven changes or in a dedicated polish pass, provided scope stays inside hardening.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product and release scope
- `.planning/PROJECT.md` — current milestone goals and product constraints
- `.planning/REQUIREMENTS.md` — Phase 4 requirements `QUAL-01`, `QUAL-02`
- `.planning/ROADMAP.md` — Phase 4 goal, success criteria, and plan split
- `AGENTS.md` — repo rules, lint/format expectations, and Swiss-style constraints

### Prior verified tracker work
- `.planning/phases/02-dashboard-resume-linked-experience/02-VERIFICATION.md` — verified dashboard and resume-viewer tracker behavior
- `.planning/phases/03-workflow-integrations/03-VERIFICATION.md` — verified Settings pipeline and post-tailoring handoff behavior
- `.planning/phases/03-workflow-integrations/03-01-SUMMARY.md` — pipeline management implementation summary
- `.planning/phases/03-workflow-integrations/03-02-SUMMARY.md` — post-tailoring integration summary

### Frontend coverage and i18n targets
- `apps/frontend/app/(default)/dashboard/page.tsx` — application-aware dashboard filters and badges
- `apps/frontend/app/(default)/resumes/[id]/page.tsx` — linked application create/edit/status flow
- `apps/frontend/app/(default)/settings/page.tsx` — application pipeline settings surface
- `apps/frontend/app/(default)/tailor/page.tsx` — post-tailoring application prefill handoff
- `apps/frontend/messages/en.json` — source locale for tracker copy coverage
- `apps/frontend/tests/` — existing frontend Vitest patterns

### Backend coverage targets
- `apps/backend/app/routers/applications.py` — application create/update/status behavior
- `apps/backend/app/routers/config.py` — pipeline config validation and in-use rejection behavior
- `apps/backend/tests/test_applications_endpoints.py` — existing backend applications test patterns

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Frontend already uses Vitest and has an established `apps/frontend/tests/` directory for targeted component and utility tests.
- Backend already has tracker-focused endpoint tests in `apps/backend/tests/test_applications_endpoints.py`.
- Locale files for the tracker exist in all five supported frontend message files, so Phase 4 is a completeness and consistency pass rather than a first-time i18n rollout.

### Established Patterns
- Tracker UI is resume-centric: dashboard to resume viewer to linked application actions.
- Settings persists application pipeline configuration through `/config/applications`, with the backend as the validation authority.
- Post-tailoring handoff now routes into the existing resume viewer and auto-opens the application create dialog with prefill values.

### Integration Points
- Add or expand frontend tests around dashboard filters, resume viewer application flows, Settings pipeline interactions, and tailor-to-resume handoff behavior.
- Add or expand backend tests for creation defaults, pipeline validation, and status history behavior where coverage is still incomplete.
- Audit all locale files for tracker-specific strings introduced across Phases 2 and 3.

</code_context>

<specifics>
## Specific Ideas

- Treat the existing English tracker copy as the source of truth when checking locale completeness.
- Favor targeted tests around behavior and contracts over broad visual snapshots.
- Use release polish to close real inconsistencies found during test and i18n audits, not to reopen product decisions already settled in prior phases.

</specifics>

<deferred>
## Deferred Ideas

None — this phase is strictly for hardening the current MVP.

</deferred>

---

*Phase: 04-quality-and-release-hardening*
*Context gathered: 2026-03-23*
