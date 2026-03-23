# Phase 3: Workflow Integrations - Context

**Gathered:** 2026-03-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Integrate application tracking into the broader Resume Matcher workflow through the existing Settings page and the post-tailoring flow. This phase covers pipeline status management in Settings plus a post-tailoring application creation entry point with linked `resume_id` and `job_id`. It does not add a new tracker surface or release-hardening work.

</domain>

<decisions>
## Implementation Decisions

### Settings pipeline management
- **D-01:** Application pipeline management should live inside the existing Settings page as a dedicated section, not as a separate route.
- **D-02:** Users must be able to add, remove, and reorder statuses inline within that Settings section.
- **D-03:** Removal failures caused by statuses still in use should surface in the Settings UI with the backend-provided context, instead of silent validation or generic alerts.

### Post-tailoring creation flow
- **D-04:** The post-tailoring flow should offer application creation immediately after a tailored resume is confirmed, instead of making the user manually rediscover the resume later.
- **D-05:** The creation flow must carry linked `resume_id` and `job_id` forward automatically, while keeping `company` and `role` editable by the user.
- **D-06:** The post-tailoring creation experience should reuse the resume-linked application flow introduced in Phase 2 where possible, rather than inventing a second application form pattern.

### Flow continuity
- **D-07:** The product should stay resume-centric: after tailoring, the user should still land in the normal tailored-resume experience, with the application action presented as the next logical step.
- **D-08:** Default application status behavior should continue to come from backend pipeline config, not frontend hardcoding.

### the agent's Discretion
- Exact reorder interaction for statuses, as long as it is clear and fits the existing Swiss-style Settings UI.
- Exact presentation of the post-tailoring prompt to create an application, as long as it is immediate, obvious, and does not fork into a separate tracker flow.
- Whether the post-tailoring entry uses a dialog, embedded panel state, or route-triggered create mode, provided it reuses existing application creation patterns.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product and phase scope
- `.planning/PROJECT.md` — active milestone goals, validated requirements, and current product constraints
- `.planning/REQUIREMENTS.md` — Phase 3 requirements `SET-01`, `SET-02`, `SET-03`, `TAIL-01`, `TAIL-02`
- `.planning/ROADMAP.md` — Phase 3 goal, success criteria, and plan split
- `AGENTS.md` — repo-wide implementation rules, required checks, and Swiss-style constraints

### Prior tracker decisions
- `.planning/phases/02-dashboard-resume-linked-experience/02-CONTEXT.md` — locked decisions about dashboard and resume-centric tracker behavior
- `.planning/phases/02-dashboard-resume-linked-experience/02-02-SUMMARY.md` — dashboard filter/badge behavior now in place
- `.planning/phases/02-dashboard-resume-linked-experience/02-03-SUMMARY.md` — resume viewer application management patterns already implemented
- `.planning/phases/02-dashboard-resume-linked-experience/02-VERIFICATION.md` — verified Phase 2 behavior that Phase 3 must extend without breaking

### Settings and pipeline integration
- `apps/frontend/app/(default)/settings/page.tsx` — existing Settings structure and UI patterns to extend
- `apps/frontend/lib/api/config.ts` — frontend config API patterns and current Settings data access
- `apps/backend/app/routers/config.py` — application pipeline config endpoints and in-use validation behavior

### Post-tailoring integration
- `apps/frontend/app/(default)/tailor/page.tsx` — current post-tailoring confirm flow and navigation behavior
- `apps/frontend/app/(default)/resumes/[id]/page.tsx` — existing linked-application create/edit/status management surface
- `apps/frontend/lib/api/applications.ts` — typed frontend application helpers to reuse
- `apps/backend/app/routers/applications.py` — application create/update/status backend contract

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `apps/frontend/app/(default)/settings/page.tsx`: already contains grouped Settings sections, confirm dialogs, dropdowns, and save/error state patterns
- `apps/frontend/lib/api/config.ts`: established frontend API style for config GET/PUT operations and typed payloads
- `apps/frontend/app/(default)/tailor/page.tsx`: already owns the confirm-tailoring path and final redirect after a tailored resume is created
- `apps/frontend/app/(default)/resumes/[id]/page.tsx`: already contains the embedded application panel and create/edit/status flows added in Phase 2
- `apps/frontend/components/ui/dialog.tsx`, `Button`, `Dropdown`, `Input`, `Textarea`: shared Swiss-style primitives available for both Settings and post-tailoring interactions

### Established Patterns
- Settings is a client-rendered page with local save state and sectioned controls rather than route-per-setting
- Pipeline authority lives in backend config endpoints; frontend should reflect backend validation and error responses
- Resume-centric flow is now the primary tracker model: dashboard opens resume page, resume page manages linked application
- Post-tailoring currently confirms the tailored resume and routes the user to `/resumes/[id]`, which is the natural integration point for a create-application next step

### Integration Points
- Add a dedicated application pipeline section to `apps/frontend/app/(default)/settings/page.tsx`
- Extend `apps/frontend/lib/api/config.ts` with application pipeline config helpers if needed by the Settings UI
- Use `apps/frontend/app/(default)/tailor/page.tsx` to trigger the post-tailoring application entry point after confirm
- Reuse `apps/frontend/app/(default)/resumes/[id]/page.tsx` as the final application management destination so Phase 3 builds on Phase 2 instead of duplicating it

</code_context>

<specifics>
## Specific Ideas

- Keep the product inside the existing workflow: Settings for pipeline admin, resume viewer for resume-linked application management, and tailoring as the place that offers the next-step creation entry.
- Prefer reusing the Phase 2 application UI rather than introducing a separate post-tailoring application page.
- Surface backend “status still in use” errors directly in Settings so the user can understand why a pipeline change was rejected.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 03-workflow-integrations*
*Context gathered: 2026-03-23*
