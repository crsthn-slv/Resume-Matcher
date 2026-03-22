# Phase 1: Applications Backend Foundation - Context

**Gathered:** 2026-03-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Establish the `application` backend domain for Resume Matcher with TinyDB persistence, API contracts, status history behavior, and application pipeline configuration rules. This phase covers storage and backend behavior only; dashboard presentation, Settings UI, and post-tailoring UX are handled in later phases.

</domain>

<decisions>
## Implementation Decisions

### History semantics
- **D-01:** Creating an application must append an initial `status_history` entry.
- **D-02:** The initial history entry uses the creation source, specifically `manual_create` or `tailor_create`.
- **D-03:** The initial history record should represent the starting transition from no prior status into the created status.

### API payload shape
- **D-04:** `GET /applications` should return a display-ready list for the dashboard table, not a minimal id-only payload.
- **D-05:** Application list items may include resolved linked metadata needed for quick rendering, in addition to the application's own fields.

### Job linkage behavior
- **D-06:** `POST /applications` remains flexible across manual and tailoring flows, but validation rules must be explicit and strict.
- **D-07:** If `job_description` is provided, the backend creates a linked job record.
- **D-08:** If `job_id` is provided, the same payload must not also include `job_description`.
- **D-09:** If `resume_id` or `job_id` is provided, the backend must validate that the referenced record exists and reject invalid references.

### the agent's Discretion
- Exact response field naming for derived display metadata, as long as it is consistent with existing API conventions.
- Internal helper structure for history append logic, config validation, and shared record hydration.
- Whether linked display metadata is assembled in router or database/service helper layers, as long as backend layering stays coherent.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product and milestone scope
- `.planning/PROJECT.md` — Product context, validated capabilities, active milestone goals, and constraints for the application tracker
- `.planning/REQUIREMENTS.md` — Milestone requirement IDs and exact backend-facing acceptance targets for Phase 1
- `.planning/ROADMAP.md` — Phase boundary, success criteria, and plan breakdown for Applications Backend Foundation
- `AGENTS.md` — Repo-wide implementation rules, required skills, backend conventions, and definition of done

### Backend architecture and contracts
- `docs/agent/architecture/backend-architecture.md` — Backend module responsibilities and integration patterns to preserve
- `docs/agent/apis/front-end-apis.md` — Existing API contract conventions relevant to shaping new endpoints
- `.planning/codebase/ARCHITECTURE.md` — Current layered backend/frontend architecture and existing data flows
- `.planning/codebase/STRUCTURE.md` — Where new routers, schemas, services, and tests belong in this repo
- `.planning/codebase/CONVENTIONS.md` — Naming, typing, error handling, and logging conventions to preserve

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `apps/backend/app/database.py`: existing TinyDB access layer already manages `resumes`, `jobs`, and `improvements`, so `applications` should follow the same table/property pattern
- `apps/backend/app/routers/config.py`: existing `_load_config()` and `_save_config()` helpers are the intended model for pipeline config persistence
- `apps/backend/app/routers/resumes.py`: existing resume/job/improvement route patterns are the closest reference for CRUD behavior, linked records, and generic error handling
- `apps/backend/app/schemas/`: current Pydantic schema layout is the right home for `ApplicationRecord`, history entries, and config payloads
- `apps/backend/tests/`: backend test suite already covers router/service behavior with `unittest` and should host the new application coverage

### Established Patterns
- Backend uses layered boundaries: routers call service/data helpers and return validated Pydantic payloads
- Python functions are expected to be fully type-annotated
- Backend logs detailed server-side errors and returns generic client-facing HTTP errors
- File-based persistence and config are local-first; no new database or queue should be introduced for this phase

### Integration Points
- `apps/backend/app/main.py` will need router registration for the new applications endpoints
- `apps/backend/app/database.py` is the integration point for the new TinyDB table and reset behavior
- `apps/backend/app/routers/config.py` and persisted config storage are the integration point for application pipeline settings
- Existing `job` and `resume` records are the integration points for linked application creation and validation

</code_context>

<specifics>
## Specific Ideas

- Initial application creation should be auditable from the first persisted state transition, not only from later status changes.
- The applications listing API should optimize for the dashboard's primary read path by returning display-ready data.
- Manual creation and tailoring creation should share one endpoint contract, but with strict validation around mutually exclusive job-linking inputs.

</specifics>

<deferred>
## Deferred Ideas

- Exact dashboard table presentation and interaction details — Phase 2
- Settings UI behavior for add/remove/reorder pipeline controls — Phase 3
- Post-tailoring application creation UX and prefill behavior in the frontend — Phase 3
- Kanban board, reminders, interview tracking, and smart parsing — future milestone or backlog

</deferred>

---

*Phase: 01-applications-backend-foundation*
*Context gathered: 2026-03-22*
