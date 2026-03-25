# Roadmap: Resume Matcher

## Overview

v1.1 turns the existing local developer workflow into a Windows desktop product without forking the app. The milestone is sequenced around four delivery boundaries: desktop shell control, bundled runtime and persistent data, installer and release flow, and final validation plus diagnostics hardening.

## Milestones

- ✅ **v1.0 Resume-Linked Application Tracker MVP** - Phases 1-5 shipped 2026-03-23. Archive: [`v1.0-ROADMAP.md`](/Users/cristhian/Downloads/Projetos/Resume Matcher/.planning/milestones/v1.0-ROADMAP.md)
- 🚧 **v1.1 Windows Desktop Distribution** - Phases 6-9 in progress

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions between planned phases

- [ ] **Phase 6: Desktop Shell & Lifecycle** - Users can open Resume Matcher as a normal Windows desktop app and close it cleanly.
- [ ] **Phase 7: Bundled Runtime & Persistent Data** - Packaged builds run the existing product flows with embedded dependencies and upgrade-safe local storage.
- [ ] **Phase 8: Installer & Release Delivery** - Maintainers can ship a repeatable Windows installer with normal entry points and a defined upgrade path.
- [ ] **Phase 9: Validation & Diagnostics Hardening** - Packaged releases are validated end to end and failures are debuggable.

## Phase Details

### Phase 6: Desktop Shell & Lifecycle
**Goal**: Users can launch Resume Matcher in a managed Windows desktop window and exit cleanly without developer-style startup behavior.
**Depends on**: Phase 5
**Requirements**: DSK-01, DSK-02, DSK-04
**Success Criteria** (what must be TRUE):
  1. User can launch Resume Matcher from an installed Windows entry point and gets a desktop application window instead of the current browser-plus-terminal workflow.
  2. User does not see terminal or console windows during normal app startup, use, or shutdown.
  3. User can close the desktop app and its managed app processes stop without manual task cleanup.
**Plans**: 3 plans
Plans:
- [ ] `06-01-PLAN.md` — Create the Electron desktop workspace, lifecycle contracts, and safe main/preload shell entrypoints.
- [ ] `06-02-PLAN.md` — Replace `docker/start.sh` behavior with a hidden runtime supervisor, log sinks, and process-tree shutdown.
- [ ] `06-03-PLAN.md` — Add splash/main/error windows, retry and logs actions, external-browser policy, and desktop-shell runbook.
**UI hint**: yes

### Phase 7: Bundled Runtime & Persistent Data
**Goal**: Packaged desktop builds run the full existing product against local data that survives restarts and normal upgrades.
**Depends on**: Phase 6
**Requirements**: DATA-01, DATA-02, DATA-03, DSK-03
**Success Criteria** (what must be TRUE):
  1. User receives a packaged desktop build that already contains the frontend, backend, and required runtimes needed to run locally.
  2. User can use the existing core product flows inside the packaged desktop app, including tailoring, application tracking, settings, and PDF export.
  3. User's local resumes, jobs, applications, and configuration live outside the install directory so normal restarts or reinstalls do not wipe them.
  4. User can move from one released desktop build to a newer one without losing previously stored local data and configuration.
**Plans**: 3 plans
Plans:
- [ ] `07-01-PLAN.md` — Build the packaged runtime bundle contract for frontend, backend, embedded Node, and bundled Chromium assets.
- [ ] `07-02-PLAN.md` — Move backend persistence to a stable per-user data root with startup migration and backup guarantees.
- [ ] `07-03-PLAN.md` — Rewire Electron packaged launches and PDF export to use bundled runtime artifacts plus stable user data.
**UI hint**: yes

### Phase 8: Installer & Release Delivery
**Goal**: Users can install the app from a normal Windows installer, and maintainers can ship repeatable installer releases from the main repository.
**Depends on**: Phase 7
**Requirements**: INST-01, INST-02, INST-03, REL-01, REL-02, REL-03
**Success Criteria** (what must be TRUE):
  1. User can install Resume Matcher from a generated `.exe` installer on a clean Windows machine without manually installing developer runtimes or tools.
  2. User receives desktop and Start menu entry points during installation and can launch the installed app like a normal Windows program.
  3. Maintainer can generate a Windows release from the main repository with a repeatable packaging and versioning workflow instead of a separate distribution fork.
  4. Users have a documented upgrade path for newer versions, even if the first release uses installer-based replacement rather than auto-update.
**Plans**: 3 plans
Plans:
- [ ] `08-01-PLAN.md` — Add the electron-builder NSIS installer contract, machine-wide install defaults, and packaging regression coverage.
- [ ] `08-02-PLAN.md` — Add the canonical GitHub Actions Windows release workflow plus maintainer versioning and packaging documentation.
- [ ] `08-03-PLAN.md` — Document the Windows install and manual upgrade path and align quick-start desktop docs to the installer workflow.

### Phase 9: Validation & Diagnostics Hardening
**Goal**: The Windows release is supportable and ready for handoff because installation, upgrades, core flows, and failures have been validated.
**Depends on**: Phase 8
**Requirements**: QUAL-01, QUAL-02
**Success Criteria** (what must be TRUE):
  1. Maintainer has a concise release checklist that verifies install, first launch, core product flows, restart behavior, and upgrade behavior for the packaged Windows app.
  2. Packaging or startup failures produce logs or diagnostics that are actionable enough to debug release issues without reproducing the full developer workflow.
  3. A release candidate can be evaluated against the checklist before handing the installer to the Windows end user.
**Plans**: TBD

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 6. Desktop Shell & Lifecycle | 3/3 | Awaiting Windows confirmation | - |
| 7. Bundled Runtime & Persistent Data | 3/3 | Awaiting Windows packaged-runtime validation | - |
| 8. Installer & Release Delivery | 3/3 | Planned, ready to execute | - |
| 9. Validation & Diagnostics Hardening | 0/TBD | Not started | - |

## Archived Scope

<details>
<summary>✅ v1.0 Resume-Linked Application Tracker MVP (Phases 1-5) — shipped 2026-03-23</summary>

- [x] Phase 1: Applications Backend Foundation — 3/3 plans complete
- [x] Phase 2: Dashboard Resume-Linked Experience — 3/3 plans complete
- [x] Phase 3: Workflow Integrations — 2/2 plans complete
- [x] Phase 4: Quality and Release Hardening — 2/2 plans complete
- [x] Phase 5: Inline application status editing — 2/2 plans complete

</details>
