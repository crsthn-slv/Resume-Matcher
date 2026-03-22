# Requirements: Resume Matcher

**Defined:** 2026-03-22
**Core Value:** The product must let the user track real job applications alongside the tailored resumes they used so the job search stays organized and actionable end to end.

## v1 Requirements

### Applications Core

- [ ] **APPL-01**: User can create an application manually with company, role, and a valid pipeline status.
- [ ] **APPL-02**: User can create an application with optional `resume_id`, `job_id`, `job_url`, and notes.
- [ ] **APPL-03**: User can create an application from manual entry even when no full job description is provided.
- [ ] **APPL-04**: User can create an application from manual entry with a full job description and have it linked to a stored job record.
- [ ] **APPL-05**: User can view an application details dialog with company, role, status, notes, linked resume, linked job description when available, and reverse-ordered status history.
- [ ] **APPL-06**: User can edit application metadata without creating a status history entry.

### Pipeline

- [ ] **PIPE-01**: User can change an application's status only through the dedicated status endpoint, and each change appends a timestamped history entry.
- [ ] **PIPE-02**: User can only create or update applications with statuses that exist in the current configured pipeline.
- [ ] **PIPE-03**: User gets the default `Applied` status on creation when it exists, otherwise the first configured status is used.
- [ ] **PIPE-04**: User can search applications by free text over company and role.
- [ ] **PIPE-05**: User can filter applications by one or more statuses and see results ordered by most recently updated.

### Dashboard

- [ ] **DASH-01**: User can see an applications section in the dashboard without losing the existing resumes grid.
- [ ] **DASH-02**: User can scan application rows with company, role, status, linked resume, created date, updated date, and note indicator.
- [ ] **DASH-03**: User can trigger quick actions from the dashboard to edit, change status, and open details for an application.

### Tailoring Integration

- [ ] **TAIL-01**: User can open the application creation flow immediately after tailoring using the generated `resume_id` and `job_id`.
- [ ] **TAIL-02**: User sees the post-tailoring application modal prefilled with linked identifiers and default status while manually entering company and role.

### Settings

- [ ] **SET-01**: User can view the effective application pipeline configuration from Settings.
- [ ] **SET-02**: User can add, remove, and reorder application statuses from a dedicated Settings component.
- [ ] **SET-03**: User is prevented from removing a status that is still in use and can see which applications are affected.

### Quality

- [ ] **QUAL-01**: User sees localized labels, dialogs, messages, empty states, and settings content for the application tracker in every supported language.
- [ ] **QUAL-02**: User benefits from automated backend and frontend test coverage for manual creation, linked creation, filtering, status history, pipeline validation, and the post-tailoring flow.

## v2 Requirements

### Tracker Expansion

- **TRAK-01**: User can switch between table and kanban views for application management.
- **TRAK-02**: User can track interviews, reminders, follow-ups, and contacts for each application.
- **TRAK-03**: User can auto-extract company and role from raw job description text during application creation.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Kanban application board | Table-first MVP is the fastest way to validate the tracker workflow |
| Interview scheduling and reminders | Adds workflow breadth without proving the core application-tracking value |
| Automatic vacancy parsing for company/role | Deferred to keep MVP implementation explicit and reliable |
| Multi-user tracking or shared audit actors | Product remains single-user and local-first |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| APPL-01 | Phase 1 | Pending |
| APPL-02 | Phase 1 | Pending |
| APPL-03 | Phase 1 | Pending |
| APPL-04 | Phase 1 | Pending |
| PIPE-01 | Phase 1 | Pending |
| PIPE-02 | Phase 1 | Pending |
| PIPE-03 | Phase 1 | Pending |
| PIPE-04 | Phase 2 | Pending |
| PIPE-05 | Phase 2 | Pending |
| APPL-05 | Phase 2 | Pending |
| APPL-06 | Phase 2 | Pending |
| DASH-01 | Phase 2 | Pending |
| DASH-02 | Phase 2 | Pending |
| DASH-03 | Phase 2 | Pending |
| SET-01 | Phase 3 | Pending |
| SET-02 | Phase 3 | Pending |
| SET-03 | Phase 3 | Pending |
| TAIL-01 | Phase 3 | Pending |
| TAIL-02 | Phase 3 | Pending |
| QUAL-01 | Phase 4 | Pending |
| QUAL-02 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 21 total
- Mapped to phases: 21
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-22*
*Last updated: 2026-03-22 after initial definition*
