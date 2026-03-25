# Phase 8: Installer & Release Delivery - Context

**Gathered:** 2026-03-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Turn the packaged runtime produced in Phase 7 into a normal Windows installation experience: one installer `.exe`, machine-wide installation in `Program Files`, desktop and Start Menu entry points, and a repeatable official Windows release flow. This phase is about installer generation and release mechanics, not the final release checklist or post-release diagnostics validation.

</domain>

<decisions>
## Implementation Decisions

### Installer technology
- **D-01:** Phase 8 should use `electron-builder` as the packaging tool for the Windows desktop release.
- **D-02:** The Windows installer format should be `NSIS`, so the desktop app ships as one normal installer `.exe` instead of exposing internal runtime executables to the end user.

### Official release build flow
- **D-03:** The official Windows release build should be generated through `GitHub Actions`, not only from a manually prepared local Windows machine.
- **D-04:** Local/manual Windows builds may still exist as fallback, but the canonical release process should be the CI pipeline.

### Installation behavior
- **D-05:** The default installation target should be machine-wide in `Program Files`.
- **D-06:** Installation should create normal Windows entry points, specifically Desktop and Start Menu shortcuts.
- **D-07:** Upgrading within v1.1 should happen by running a newer installer over the existing installation rather than maintaining multiple side-by-side app installs.

### Update delivery
- **D-08:** v1.1 should use a manual update path: ship a new installer and document the replacement/upgrade process.
- **D-09:** Phase 8 should not introduce full auto-update infrastructure; it only needs a defined manual upgrade path that preserves the local data created in Phase 7.

### the agent's Discretion
- Exact `electron-builder` config structure, artifact naming, and output-directory layout, provided the installer remains a single normal `.exe`.
- Exact GitHub Actions job decomposition and caching strategy, provided the Windows release flow stays repeatable and understandable.
- Exact installer UX copy and checkbox defaults, provided the install flow remains simple for a non-technical Windows user.

</decisions>

<specifics>
## Specific Ideas

- The user explicitly wants to avoid a situation where the spouse sees multiple `.exe` files and has to guess which one to run.
- The internal backend/runtime executables from Phase 7 are acceptable implementation details, but the user-facing delivery must collapse that into one normal Windows installer experience.
- Manual updates are acceptable in v1.1 as long as they are predictable and do not wipe local data.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Milestone scope and requirements
- `.planning/PROJECT.md` — Desktop distribution goals, repo strategy, and release-operation constraints
- `.planning/REQUIREMENTS.md` — Phase-mapped requirements, especially `INST-01`, `INST-02`, `INST-03`, `REL-01`, `REL-02`, and `REL-03`
- `.planning/ROADMAP.md` — Phase 8 scope, dependencies, and success criteria
- `.planning/STATE.md` — Current milestone state and outstanding human validation follow-up

### Existing packaged runtime work
- `.planning/phases/07-bundled-runtime-persistent-data/07-CONTEXT.md` — Runtime/data decisions Phase 8 must package rather than redesign
- `.planning/phases/07-bundled-runtime-persistent-data/07-VERIFICATION.md` — Current packaged-runtime verification status and remaining human validation
- `package.json` — Root maintainer scripts for desktop runtime build orchestration
- `apps/desktop/package.json` — Desktop workspace scripts and packaging entrypoints
- `apps/desktop/src/runtime/packaged-layout.ts` — Internal packaged-runtime artifact layout that the installer must include
- `scripts/desktop/build-runtime.mjs` — Current runtime bundle build flow Phase 8 will consume before installer generation
- `scripts/desktop/build-backend.py` — Backend executable build helper used by the runtime bundle
- `apps/backend/desktop.spec` — Backend Windows-targeted executable specification

### Existing desktop shell expectations
- `.planning/phases/06-desktop-shell-lifecycle/06-CONTEXT.md` — Locked shell/lifecycle behavior that installer delivery must preserve
- `apps/desktop/src/main.ts` — Current Electron app bootstrap and process lifecycle assumptions
- `apps/desktop/src/runtime/command-factory.ts` — Production runtime command model targeting packaged artifacts

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `scripts/desktop/build-runtime.mjs`: already defines the packaged runtime tree that the installer can consume directly.
- `apps/desktop/package.json`: already owns the desktop workspace and is the natural place to add `electron-builder` scripts/config.
- `apps/desktop/src/runtime/packaged-layout.ts`: already centralizes the internal artifact paths, reducing ambiguity about what the installer must ship.

### Established Patterns
- The project keeps one repository for app code and release packaging; installer work must stay additive to that same repo.
- The app is local-first, so installer and upgrade behavior must not overwrite the Phase 7 user-data location.
- The desktop shell has already been implemented around Electron, so installer delivery should package that shell rather than replace it.

### Integration Points
- Phase 8 needs to connect the Phase 7 runtime bundle output into an Electron installer pipeline.
- GitHub Actions needs a Windows job that can build the runtime, package the Electron app, and publish installer artifacts.
- Installer config must align with the stable data-root behavior from Phase 7 so upgrades preserve local data.

</code_context>

<deferred>
## Deferred Ideas

- Automated in-app update checks and hosted update feeds remain out of scope for this phase.
- Final release checklist execution, installer/UAT signoff, and deeper diagnostics hardening belong in Phase 9.
- Cross-platform installers remain deferred until Windows distribution is stable.

</deferred>

---
*Phase: 08-installer-release-delivery*
*Context gathered: 2026-03-25*
