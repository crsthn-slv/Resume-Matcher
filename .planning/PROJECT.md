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
- ✓ Resume-linked application tracking inside the existing dashboard workflow — v1.0

### Active

- [ ] User can install Resume Matcher on Windows from a normal `.exe` installer without manual runtime setup.
- [ ] User can launch the app from the desktop or Start menu and use it without seeing terminal windows.
- [ ] The packaged app ships with the required frontend, backend, and runtime dependencies embedded.
- [ ] The desktop distribution supports a clear update path for delivering new versions.

### Out of Scope

- Standalone applications table or kanban board — the MVP will stay inside the existing resume dashboard instead of adding a separate tracker surface.
- Interview scheduling, reminders, contacts, and follow-up automation — not required to prove core tracking value.
- Automatic company/role parsing from freeform job text — deferred to keep the MVP deterministic.
- Multi-user collaboration or actor-level auditing — product remains single-user and local-first.
- Public web hosting as the primary delivery model for this milestone — the focus is local desktop distribution for a non-technical Windows user.
- Cross-platform packaging beyond Windows — macOS and Linux installers can be revisited after the Windows flow is reliable.

## Context

Resume Matcher is already a brownfield full-stack app built with FastAPI, TinyDB, Next.js, React, and Tailwind. It currently runs as a local developer workflow with separate backend and frontend processes, while user data, generated outputs, and configuration are stored locally. The new milestone must preserve the local-first single-user model while replacing the manual developer startup flow with a packaged Windows desktop experience.

The motivation for this milestone is practical and user-driven: the product needs to run on the user's spouse's Windows PC with a simple click-to-open experience, no visible terminal, no manual dependency installation, and a maintainable release/update path from the same repository. Success is defined by being able to produce a Windows installer, install the app on a clean machine, open it like a normal desktop app, and later deliver updates without reintroducing a developer-style setup burden.

Existing frontend patterns should be preserved: Swiss-style UI, shared components, current dashboard layout, and full i18n coverage across all supported languages. Existing backend principles also remain in force: strong validation, explicit generic client errors, detailed server-side logging, and defensive handling of mutable defaults. The packaging layer should be additive around the existing app, not a forked product.

## Constraints

- **Tech stack**: Must extend the existing FastAPI + TinyDB + Next.js architecture — avoid introducing new persistence or state-management systems for this MVP.
- **Distribution model**: Must package the current local app into a Windows desktop deliverable — avoid requiring Python, Node.js, uv, npm, or a terminal on the target machine.
- **Repository strategy**: Keep one source repository for development and release packaging — do not create a parallel fork just for the distributed build.
- **Runtime UX**: Desktop launch must feel like a normal installed app — no visible console windows and no separate manual service startup.
- **UX consistency**: Dashboard cards, dialogs, detail views, and Settings components must follow the current Swiss-style design system and reuse existing shared UI primitives.
- **Data safety**: Local user data and configuration must survive app restarts and normal upgrades.
- **Release operations**: The milestone must define how new versions are shipped and applied on the Windows machine.

## Key Decisions

| Decision                                                                                           | Rationale                                                                                                        | Outcome    |
| -------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ---------- |
| Introduce `application` as a first-class model separate from `job`                                 | Tracking user progress through a hiring pipeline is not the same concern as storing a job description            | Phase 1    |
| Use the existing dashboard and tailored-resume flow as the tracker surface                         | The user wants application tracking to live inside the current resume workflow instead of a new standalone table | 2026-03-23 |
| Centralize pipeline validation in backend config endpoints                                         | Status integrity must not depend on frontend behavior                                                            | 2026-03-23 |
| Offer application creation after tailoring through the resume viewer handoff with editable prefill | Preserves a resume-centric workflow while reducing re-entry for `company`, `role`, and `job_url`                 | 2026-03-23 |
| Make the visible status badge the primary interaction trigger on dashboard and resume viewer       | Reduces tracker friction while preserving backend status authority and the existing tracker surfaces             | 2026-03-23 |
| Keep desktop distribution in the same repository as the main app                                  | Release packaging should reuse the existing codebase and avoid maintaining a second divergent project            | 2026-03-24 |

## Current State

- `v1.0` shipped on `2026-03-23`
- The product now supports end-to-end resume-linked application tracking inside the existing dashboard, resume viewer, Settings, and tailoring workflow.
- All `21/21` v1 requirements are satisfied, all `5/5` phases are verified, and all `5/5` phases are Nyquist-compliant.

## Current Milestone: v1.1 Windows Desktop Distribution

**Goal:** transform Resume Matcher into a Windows desktop application that a non-technical user can install and run by double-clicking, without terminals or manual dependency setup.

**Target features:**
- Windows `.exe` installer for normal installation flow
- Desktop launch experience without visible terminal windows
- Embedded runtimes and packaged dependencies
- Defined update strategy for shipping future improvements

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

_Last updated: 2026-03-24 after v1.1 milestone start_
