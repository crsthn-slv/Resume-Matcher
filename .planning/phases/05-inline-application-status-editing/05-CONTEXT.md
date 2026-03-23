# Phase 5: Inline application status editing - Context

**Gathered:** 2026-03-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Replace the current explicit status-change section with inline status editing on the existing dashboard cards and the existing resume viewer application panel. This phase is about making status updates faster and more direct inside the current tracker surfaces, without adding a new tracker page or expanding the application model itself.

</domain>

<decisions>
## Implementation Decisions

### Inline interaction model
- **D-01:** The status badge itself becomes the interaction trigger in both places: dashboard cards and resume viewer.
- **D-02:** Clicking the badge should open a small dropdown/menu anchored to the badge, not replace the badge with an inline select.
- **D-03:** The interaction pattern should be the same in both surfaces for consistency.

### Dashboard card behavior
- **D-04:** The dashboard should render a clickable status tag for every tailored-resume card, including cards that do not yet have a linked `application`.
- **D-05:** For cards that already have a linked `application`, choosing a new status from the dropdown should save immediately.
- **D-06:** For cards without a linked `application`, choosing a status should first try a quick-create flow from that card.

### Quick-create fallback rules
- **D-07:** Quick-create from a dashboard card may infer `company`, `role`, and related job context from the resume/job data when available.
- **D-08:** If inference is insufficient, the product should fall back to the normal application creation form with the best available prefill instead of silently failing or creating incomplete records.

### Save feedback and failure behavior
- **D-09:** After the user selects a status, the badge should update optimistically right away.
- **D-10:** While the save is in flight, the loading indicator should appear inside the badge itself.
- **D-11:** If the save fails, the badge should revert to the previous status and the UI should show a global toast-style error rather than a new permanent inline error block.

### the agent's Discretion
- Exact dropdown primitive and positioning details, as long as it feels lightweight and anchored to the badge.
- Exact source for dashboard-side inference of `company` and `role`, provided it follows existing data already available in the resume/job flow.
- Exact toast implementation, as long as it matches existing app feedback patterns and does not introduce a new heavy notification system.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product and roadmap scope
- `.planning/PROJECT.md` — Current product constraints, active tracker goals, and resume-centric workflow principles
- `.planning/REQUIREMENTS.md` — Existing tracker requirements and current acceptance boundaries that this UX improvement must preserve
- `.planning/ROADMAP.md` — Phase 5 slot in the milestone and its dependency on the shipped tracker flow
- `AGENTS.md` — Repo rules, Swiss-style UI constraints, and validation expectations

### Existing tracker surfaces
- `.planning/phases/02-dashboard-resume-linked-experience/02-CONTEXT.md` — Locked dashboard and resume-centric tracker decisions from the original tracker UX phase
- `.planning/phases/03-workflow-integrations/03-CONTEXT.md` — Locked decisions about reuse of the resume viewer and post-tailoring application flow
- `.planning/phases/04-quality-and-release-hardening/04-CONTEXT.md` — Release-hardening constraints and verified behavior that this phase must not regress
- `apps/frontend/app/(default)/dashboard/page.tsx` — Current dashboard card rendering, badge signaling, and data-loading behavior
- `apps/frontend/app/(default)/resumes/[id]/page.tsx` — Current resume viewer application panel, status controls, and linked application flow
- `apps/frontend/lib/api/applications.ts` — Existing application fetch/create/update/status helpers
- `apps/frontend/components/ui/card.tsx` — Current badge primitive used for dashboard signaling

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `apps/frontend/components/ui/card.tsx`: already provides `CardBadge`, which is the natural badge primitive to upgrade into an inline status trigger on dashboard cards.
- `apps/frontend/app/(default)/dashboard/page.tsx`: already loads application records, maps them by `resume_id`, and renders application-aware card metadata.
- `apps/frontend/app/(default)/resumes/[id]/page.tsx`: already holds linked application state, create/edit flows, and the existing status update action path.
- `apps/frontend/lib/api/applications.ts`: already exposes `createApplication` and `updateApplicationStatus`, so the inline status flow should reuse those contracts.
- `apps/frontend/lib/applications/post-tailor-prefill.ts`: already contains application-prefill helpers and may be a useful place for small shared application-creation helpers if the dashboard quick-create flow needs them.

### Established Patterns
- The tracker remains resume-centric: the dashboard shows tailored resumes first, and the resume viewer is the detailed management surface.
- Status integrity must keep using the backend-owned status endpoint and configured pipeline options.
- The UI follows Swiss-style primitives with hard edges, restrained color, and simple affordances rather than dense CRM controls.

### Integration Points
- Dashboard cards need a new inline status interaction that can branch between direct status update and quick-create fallback.
- Resume viewer needs to replace the separate status-change section with the same badge-triggered dropdown interaction.
- Shared status options should still come from the configured application pipeline so both surfaces stay consistent.

</code_context>

<specifics>
## Specific Ideas

- The user wants the status interaction to feel immediate: click the tag, choose a status, done.
- The existing dedicated status-change block in the resume viewer should go away in favor of the badge interaction.
- The dashboard should not force the user into the resume viewer just to set an initial status when a quick-create path can succeed.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---
*Phase: 05-inline-application-status-editing*
*Context gathered: 2026-03-23*
