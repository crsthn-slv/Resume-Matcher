# Resume Matcher

## What This Is

Resume Matcher is an AI-powered application that helps a job seeker tailor resumes and supporting materials for specific vacancies. In this milestone, it expands from resume tailoring into application tracking so the same user can map opportunities, record where they applied, and follow progress toward getting hired without leaving the product. Instead of introducing a separate tracker surface, the milestone now embeds application tracking directly into the existing tailored-resume workflow.

## Core Value

The product must let the user track real job applications alongside the tailored resumes they used so the job search stays organized and actionable end to end.

## Requirements

### Validated

- ✓ AI-powered resume tailoring from a job description — existing
- ✓ Resume builder with editable sections and PDF export — existing
- ✓ Cover letter and outreach generation linked to tailoring flows — existing
- ✓ Multi-language UI and generated content support — existing

### Active

- [x] User can manage application records from the existing dashboard through tailored-resume entries.
- [x] User can change application status through a configurable pipeline and review status history.
- [x] User can create an application directly after tailoring with linked `resume_id` and `job_id`.
- [x] User can manage the global application pipeline in Settings.

### Out of Scope

- Standalone applications table or kanban board — the MVP will stay inside the existing resume dashboard instead of adding a separate tracker surface.
- Interview scheduling, reminders, contacts, and follow-up automation — not required to prove core tracking value.
- Automatic company/role parsing from freeform job text — deferred to keep the MVP deterministic.
- Multi-user collaboration or actor-level auditing — product remains single-user and local-first.

## Context

Resume Matcher is already a brownfield full-stack app built with FastAPI, TinyDB, Next.js, React, and Tailwind. The current product already stores resumes, jobs, improvements, generated outputs, and configuration locally, so the new `application` model should follow existing persistence and API conventions instead of introducing a new storage pattern.

The motivation for this milestone is practical and user-driven: the user wants to apply for jobs, map the vacancies they are pursuing, track which roles they already applied to, and ultimately improve the odds of getting hired. Success is defined by being able to use the current dashboard as the main hub, recognize which tailored resume is tied to an application, open that item, and manage the linked application details and status from there.

Existing frontend patterns should be preserved: Swiss-style UI, shared components, current dashboard layout, and full i18n coverage across all supported languages. Existing backend principles also remain in force: strong validation, explicit generic client errors, detailed server-side logging, and defensive handling of mutable defaults.

## Constraints

- **Tech stack**: Must extend the existing FastAPI + TinyDB + Next.js architecture — avoid introducing new persistence or state-management systems for this MVP.
- **Product scope**: Tracker is an MVP inside the current product — focus on linking application tracking to the existing tailored-resume flow, not on building a separate CRM-style tracker surface.
- **Integration**: The `application` model is separate from `job` but may link to `job_id` and `resume_id` — preserve this distinction in API and UI behavior.
- **UX consistency**: Dashboard cards, dialogs, detail views, and Settings components must follow the current Swiss-style design system and reuse existing shared UI primitives.
- **Validation**: Application status must always come from the configured pipeline, and status removal rules must be enforced in the backend.
- **Localization**: All user-facing strings for the tracker and pipeline management must be added to every supported locale file.

## Key Decisions

| Decision                                                                                           | Rationale                                                                                                        | Outcome    |
| -------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ---------- |
| Introduce `application` as a first-class model separate from `job`                                 | Tracking user progress through a hiring pipeline is not the same concern as storing a job description            | Phase 1    |
| Use the existing dashboard and tailored-resume flow as the tracker surface                         | The user wants application tracking to live inside the current resume workflow instead of a new standalone table | 2026-03-23 |
| Centralize pipeline validation in backend config endpoints                                         | Status integrity must not depend on frontend behavior                                                            | 2026-03-23 |
| Offer application creation after tailoring through the resume viewer handoff with editable prefill | Preserves a resume-centric workflow while reducing re-entry for `company`, `role`, and `job_url`                 | 2026-03-23 |
| Make the visible status badge the primary interaction trigger on dashboard and resume viewer       | Reduces tracker friction while preserving backend status authority and the existing tracker surfaces             | 2026-03-23 |

## Current State

- `v1.0` shipped on `2026-03-23`
- The product now supports end-to-end resume-linked application tracking inside the existing dashboard, resume viewer, Settings, and tailoring workflow.
- All `21/21` v1 requirements are satisfied, all `5/5` phases are verified, and all `5/5` phases are Nyquist-compliant.

## Next Milestone Goals

- Define the next milestone from a fresh requirements baseline.
- Decide whether the next expansion should focus on tracker depth, broader automation, or non-tracker product areas.
- Start with `[$gsd-new-milestone](/Users/cristhian/Downloads/Projetos/Resume Matcher/.codex/skills/gsd-new-milestone/SKILL.md)` so requirements and roadmap are recreated cleanly.

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

_Last updated: 2026-03-23 after v1.0 milestone completion_
