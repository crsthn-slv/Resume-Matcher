# Roadmap: Resume Matcher

## Overview

This roadmap adds a brownfield application tracker to Resume Matcher in a way that respects the existing architecture and user flows. Work starts by establishing the backend data model and API contract, then layers application tracking into the existing dashboard and tailored-resume flow, then connects the tracker into Settings and post-tailoring creation, and finally hardens the feature with localization, tests, and release polish.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Applications Backend Foundation** - Add persistence, schemas, config handling, and API endpoints for application tracking. (completed 2026-03-23)
- [x] **Phase 2: Dashboard Resume-Linked Experience** - Deliver application-aware dashboard entries, filtering, details, edit flow, and status actions through the existing tailored-resume experience. (completed 2026-03-23)
- [ ] **Phase 3: Workflow Integrations** - Connect the tracker to Settings pipeline management and the post-tailoring creation flow.
- [ ] **Phase 4: Quality and Release Hardening** - Complete i18n, tests, validation coverage, and end-to-end polish for the MVP.

## Phase Details

### Phase 1: Applications Backend Foundation
**Goal**: Establish the `application` domain in the backend with durable storage, validated API contracts, status history, and pipeline configuration rules.
**Depends on**: Nothing (first phase)
**Requirements**: [APPL-01, APPL-02, APPL-03, APPL-04, PIPE-01, PIPE-02, PIPE-03]
**Success Criteria** (what must be TRUE):
  1. User can create and fetch application records through the API with optional links to resume and job data.
  2. Status changes only happen through the dedicated endpoint and append correct history entries with timestamps and sources.
  3. Invalid statuses are rejected, and new applications receive the configured default status behavior.
  4. Application pipeline config can be read and updated through backend endpoints with protection against removing statuses in use.
**Plans**: 3 plans

Plans:
- [x] 01-01: Add database table access, schemas, and shared application domain types.
- [x] 01-02: Implement applications CRUD and status-history API endpoints.
- [x] 01-03: Implement application pipeline config endpoints, defaults, and backend tests.

### Phase 2: Dashboard Resume-Linked Experience
**Goal**: Add a usable tracker interface to the existing dashboard by embedding application records into the tailored-resume experience instead of introducing a standalone applications table.
**Depends on**: Phase 1
**Requirements**: [PIPE-04, PIPE-05, APPL-05, APPL-06, DASH-01, DASH-02, DASH-03]
**Success Criteria** (what must be TRUE):
  1. User keeps using the current dashboard and can recognize application state directly from tailored-resume entries.
  2. User can search by company or role, filter by one or more statuses, and see resume-linked application results ordered by most recent activity.
  3. User can open a tailored-resume item and access linked application details, edit controls, and reverse-ordered history.
  4. Status changes still call the dedicated status endpoint instead of metadata patching.
**Plans**: 3 plans

Plans:
- [x] 02-01: Add frontend application API client, types, and dashboard data-loading state for resume-linked application metadata.
- [x] 02-02: Integrate application status, search, and filtering into the existing dashboard tailored-resume entries.
- [x] 02-03: Build linked application details/edit/status flows from the tailored-resume experience.

### Phase 3: Workflow Integrations
**Goal**: Make the tracker part of the broader Resume Matcher workflow through Settings pipeline management and post-tailoring entry points.
**Depends on**: Phase 2
**Requirements**: [SET-01, SET-02, SET-03, TAIL-01, TAIL-02]
**Success Criteria** (what must be TRUE):
  1. User can manage application statuses from a dedicated Settings component with add, remove, and reorder interactions.
  2. User receives backend-driven error feedback when trying to remove statuses that are still in use.
  3. User can launch application creation after tailoring with `resume_id` and `job_id` prefilled and company/role still editable.
**Plans**: 2 plans

Plans:
- [ ] 03-01: Build the Settings application pipeline component and integrate config persistence.
- [ ] 03-02: Add the post-tailoring application creation flow with linked identifiers and default status behavior.

### Phase 4: Quality and Release Hardening
**Goal**: Ensure the tracker is production-ready for this MVP through localization, regression coverage, and UX polish.
**Depends on**: Phase 3
**Requirements**: [QUAL-01, QUAL-02]
**Success Criteria** (what must be TRUE):
  1. User-facing tracker and settings strings exist across all supported locales.
  2. Backend and frontend automated tests cover the main creation, filtering, status, pipeline, and integration paths from the plan.
  3. The feature passes linting and formatting requirements and fits the established Swiss-style UI patterns.
**Plans**: 2 plans

Plans:
- [ ] 04-01: Add i18n coverage and frontend/backend automated tests for the tracker flows.
- [ ] 04-02: Run validation, fix gaps, and finalize MVP release polish.

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Applications Backend Foundation | 3/3 | Complete   | 2026-03-23 |
| 2. Dashboard Resume-Linked Experience | 3/3 | Complete   | 2026-03-23 |
| 3. Workflow Integrations | 0/2 | Not started | - |
| 4. Quality and Release Hardening | 0/2 | Not started | - |
