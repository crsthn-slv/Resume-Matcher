# Requirements: Resume Matcher

**Defined:** 2026-03-24
**Core Value:** The product must let the user track real job applications alongside the tailored resumes they used so the job search stays organized and actionable end to end.

## v1 Requirements

### Installation

- [ ] **INST-01**: User can install Resume Matcher on Windows through a generated `.exe` installer without manually installing Python, Node.js, uv, npm, or other developer tooling.
- [ ] **INST-02**: User gets desktop and Start menu entry points during installation so the app can be launched like a normal Windows program.
- [ ] **INST-03**: User can complete a first-time installation on a clean Windows machine with the packaged application artifacts only.

### Desktop Runtime

- [x] **DSK-01**: User can launch Resume Matcher from the installed Windows entry point and get a desktop window for the app instead of a browser-and-terminal developer workflow.
- [ ] **DSK-02**: User does not see terminal or console windows during normal app startup, use, or shutdown.
- [ ] **DSK-03**: User can keep using the existing product flows inside the packaged desktop app, including tailoring, application tracking, settings, and PDF export.
- [ ] **DSK-04**: User can close the desktop app and have its managed app processes shut down cleanly without manual task cleanup.

### Bundled Runtime and Data

- [ ] **DATA-01**: User receives a packaged build that includes the required frontend, backend, and runtime dependencies needed for the Windows app to run locally.
- [ ] **DATA-02**: User's local resumes, jobs, applications, and configuration are stored outside the install directory in a location that survives normal app restarts and upgrades.
- [ ] **DATA-03**: User can upgrade to a newer desktop build without losing previously stored local data and configuration.

### Release and Updates

- [ ] **REL-01**: Maintainer can produce a repeatable Windows release from the main repository without maintaining a separate fork of the project.
- [ ] **REL-02**: Maintainer has a documented versioning and packaging flow for generating a new Windows installer release.
- [ ] **REL-03**: User has a defined upgrade path for receiving newer versions, even if the initial milestone uses installer-based updates instead of full auto-update.

### Quality

- [ ] **QUAL-01**: Maintainer can validate the packaged Windows build with a concise release checklist covering install, first launch, existing core flows, restart, and upgrade behavior.
- [ ] **QUAL-02**: The desktop packaging layer surfaces failures through logs or diagnostics that are actionable enough to debug packaging or startup issues.

## v2 Requirements

### Updates

- **UPDT-01**: User receives in-app update checks and can install a newer version without manually downloading a new installer.
- **UPDT-02**: Maintainer can publish signed releases with a hosted update feed for automated desktop updates.

### Distribution

- **DIST-01**: User can install Resume Matcher on macOS through a native desktop packaging flow.
- **DIST-02**: User can install Resume Matcher on Linux through a native desktop packaging flow.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Public web hosting as the primary delivery path | This milestone is focused on a private local desktop experience for a non-technical Windows user. |
| Multi-user accounts or remote sync | The current product remains local-first and single-user. |
| Silent background updates with no user action | Higher operational and signing complexity; define a safe upgrade path first. |
| Cross-platform desktop installers | Windows is the immediate target environment. |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| INST-01 | Phase 8 | Pending |
| INST-02 | Phase 8 | Pending |
| INST-03 | Phase 8 | Pending |
| DSK-01 | Phase 6 | Complete |
| DSK-02 | Phase 6 | Pending |
| DSK-03 | Phase 7 | Pending |
| DSK-04 | Phase 6 | Pending |
| DATA-01 | Phase 7 | Pending |
| DATA-02 | Phase 7 | Pending |
| DATA-03 | Phase 7 | Pending |
| REL-01 | Phase 8 | Pending |
| REL-02 | Phase 8 | Pending |
| REL-03 | Phase 9 | Pending |
| QUAL-01 | Phase 9 | Pending |
| QUAL-02 | Phase 9 | Pending |

**Coverage:**
- v1 requirements: 15 total
- Mapped to phases: 15
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-24*
*Last updated: 2026-03-24 after v1.1 roadmap creation*
