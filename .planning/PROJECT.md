# Resume Matcher

## What This Is

Resume Matcher is an AI-powered application that helps a job seeker tailor resumes and supporting materials for specific vacancies. In this milestone, it expands from resume tailoring into application tracking so the same user can map opportunities, record where they applied, and follow progress toward getting hired without leaving the product.

## Core Value

The product must let the user track real job applications alongside the tailored resumes they used so the job search stays organized and actionable end to end.

## Requirements

### Validated

- ✓ AI-powered resume tailoring from a job description — existing
- ✓ Resume builder with editable sections and PDF export — existing
- ✓ Cover letter and outreach generation linked to tailoring flows — existing
- ✓ Multi-language UI and generated content support — existing

### Active

- [ ] User can create and manage application records from the dashboard.
- [ ] User can change application status through a configurable pipeline and review status history.
- [ ] User can create an application directly after tailoring with linked `resume_id` and `job_id`.
- [ ] User can manage the global application pipeline in Settings.

### Out of Scope

- Kanban board for applications — table-first MVP is enough to validate the tracker workflow.
- Interview scheduling, reminders, contacts, and follow-up automation — not required to prove core tracking value.
- Automatic company/role parsing from freeform job text — deferred to keep the MVP deterministic.
- Multi-user collaboration or actor-level auditing — product remains single-user and local-first.

## Context

Resume Matcher is already a brownfield full-stack app built with FastAPI, TinyDB, Next.js, React, and Tailwind. The current product already stores resumes, jobs, improvements, generated outputs, and configuration locally, so the new `application` model should follow existing persistence and API conventions instead of introducing a new storage pattern.

The motivation for this milestone is practical and user-driven: the user wants to apply for jobs, map the vacancies they are pursuing, track which roles they already applied to, and ultimately improve the odds of getting hired. Success is defined by being able to see all active applications, update their status quickly, and know which tailored resume is attached to each application.

Existing frontend patterns should be preserved: Swiss-style UI, shared components, current dashboard layout, and full i18n coverage across all supported languages. Existing backend principles also remain in force: strong validation, explicit generic client errors, detailed server-side logging, and defensive handling of mutable defaults.

## Constraints

- **Tech stack**: Must extend the existing FastAPI + TinyDB + Next.js architecture — avoid introducing new persistence or state-management systems for this MVP.
- **Product scope**: Tracker is an MVP inside the current product — focus on the table workflow, not a broader CRM-style job search suite.
- **Integration**: The `application` model is separate from `job` but may link to `job_id` and `resume_id` — preserve this distinction in API and UI behavior.
- **UX consistency**: Dashboard tracker, dialogs, and Settings components must follow the current Swiss-style design system and reuse existing shared UI primitives.
- **Validation**: Application status must always come from the configured pipeline, and status removal rules must be enforced in the backend.
- **Localization**: All user-facing strings for the tracker and pipeline management must be added to every supported locale file.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Introduce `application` as a first-class model separate from `job` | Tracking user progress through a hiring pipeline is not the same concern as storing a job description | — Pending |
| Use a table with filters as the MVP tracker UI | Fastest path to a practical, scanable workflow that matches the current dashboard patterns | — Pending |
| Centralize pipeline validation in backend config endpoints | Status integrity must not depend on frontend behavior | — Pending |
| Offer application creation after tailoring, but keep `company` and `role` manual in MVP | Preserves useful linking without adding brittle parsing logic too early | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `$gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `$gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-22 after initialization*
