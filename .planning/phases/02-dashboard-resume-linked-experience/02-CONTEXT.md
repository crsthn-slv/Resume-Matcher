# Phase 2: Dashboard Resume-Linked Experience - Context

**Gathered:** 2026-03-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Add application tracking to the existing dashboard and tailored-resume experience instead of introducing a separate applications table. This phase covers dashboard signaling, resume-linked search/filter behavior, and the in-resume application details/edit/status experience. Settings pipeline management and post-tailoring entry remain later phases.

</domain>

<decisions>
## Implementation Decisions

### Dashboard surface
- **D-01:** The product keeps the current dashboard page; there will be no new standalone dashboard or dedicated applications table.
- **D-02:** Application tracking is embedded into the existing `Tailored resumes` experience.
- **D-03:** Dashboard filtering should still support an application-status control, but the visible item remains the tailored resume entry.

### Dashboard signaling
- **D-04:** Tailored-resume entries should indicate a linked application with a simple status badge only.
- **D-05:** The dashboard should not expand each item with company, role, or extra application metadata by default.

### Open flow and actions
- **D-06:** Clicking a tailored resume should keep the normal tailored-resume page flow.
- **D-07:** The tailored-resume page should include a dedicated application area/block for linked application details.
- **D-08:** Viewing details, editing metadata, and changing status all happen from that in-page application area instead of a dashboard modal or separate application page.

### Creation path
- **D-09:** If a tailored resume has no linked application yet, creation starts from the tailored-resume page with a clear `Create application` action.
- **D-10:** The dashboard itself should stay clean and only signal existing linked applications; it should not add a direct create flow for them in this phase.

### the agent's Discretion
- Exact placement of the status badge on the tailored-resume entry, as long as it is visually clear and consistent with the existing dashboard cards.
- Whether search and status filtering act on the full dashboard list or a narrowed tailored-resume subsection, as long as the interaction stays within the current dashboard experience.
- Exact composition of the in-page application block, provided it includes details, metadata editing, and status actions without breaking the existing resume viewing flow.

</decisions>

<specifics>
## Specific Ideas

- The user does not want a standalone applications table anymore.
- The dashboard should remain the same core page they already use.
- Opening a tailored resume should expose the linked application information there, including `job_url` and `job_description`.
- The dashboard signal should stay lightweight: status badge only.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product and milestone scope
- `.planning/PROJECT.md` — Updated milestone direction and product constraints after switching away from a standalone tracker table
- `.planning/REQUIREMENTS.md` — Phase 2 requirements reworded for resume-linked tracking
- `.planning/ROADMAP.md` — Updated Phase 2 goal, success criteria, and plan breakdown
- `AGENTS.md` — Repo-wide implementation rules, required skills, Swiss-style constraints, and definition of done

### Existing frontend surfaces
- `apps/frontend/app/(default)/dashboard/page.tsx` — Current dashboard layout, tailored-resume loading flow, and status/filter patterns to preserve
- `apps/frontend/lib/api/resume.ts` — Existing frontend API patterns and tailored-resume list types
- `apps/frontend/components/ui/dialog.tsx` — Existing Swiss-style dialog primitive for any application edit/detail interactions
- `apps/frontend/components/dashboard/resume-upload-dialog.tsx` — Example of current dashboard dialog behavior and styling

### Prior backend work
- `.planning/phases/01-applications-backend-foundation/01-CONTEXT.md` — Locked backend decisions for application domain behavior and payload shape
- `apps/backend/app/routers/applications.py` — Existing application endpoints now available to Phase 2
- `apps/backend/app/routers/config.py` — Shared application pipeline configuration source

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `apps/frontend/app/(default)/dashboard/page.tsx`: already loads tailored resumes, manages dashboard-level state, and is the primary integration point for status badges, filters, and entry actions
- `apps/frontend/lib/api/client.ts`: existing shared fetch helpers should host any new applications API client functions
- `apps/frontend/lib/api/resume.ts`: current list/detail patterns are the closest reference for new resume-linked application types and fetch helpers
- `apps/frontend/components/ui/dialog.tsx`: shared dialog primitive available if metadata editing needs a modal within the resume page
- `apps/backend/app/routers/applications.py`: already exposes list/detail/create/patch/status endpoints with display-ready payloads

### Established Patterns
- Dashboard is already client-rendered and fetches its own list data with local state plus targeted callbacks
- Existing UI follows Swiss-style hard borders, square corners, and restrained accents
- Frontend API access lives under `apps/frontend/lib/api/` with explicit typed helpers
- The current dashboard centers the resume workflow, so new application behavior must layer into that flow rather than replace it

### Integration Points
- `apps/frontend/app/(default)/dashboard/page.tsx` is the main entry point for application-aware tailored-resume entries
- Tailored-resume detail/view pages are the integration point for the linked application block and `Create application` path
- `apps/frontend/lib/api/` will need a new applications client that can hydrate dashboard and detail flows from the Phase 1 backend
- Backend `GET /applications`, `GET /applications/{id}`, `PATCH /applications/{id}`, and `POST /applications/{id}/status` are the contract surface Phase 2 will consume

</code_context>

<deferred>
## Deferred Ideas

- Dedicated applications table or alternate tracker page — explicitly removed from this milestone direction
- Settings UI for pipeline add/remove/reorder controls — Phase 3
- Post-tailoring application creation entry with prefilled identifiers — Phase 3
- Kanban view, reminders, interview tracking, and auto-parsing — future work only

</deferred>

---

*Phase: 02-dashboard-resume-linked-experience*
*Context gathered: 2026-03-23*
