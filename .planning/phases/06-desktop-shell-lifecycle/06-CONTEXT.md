# Phase 6: Desktop Shell & Lifecycle - Context

**Gathered:** 2026-03-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Wrap the existing local Resume Matcher application in a managed Windows desktop shell so the user can launch it as a normal app, see a short startup experience instead of developer tooling, and close it cleanly without orphaned background processes. This phase is about shell and lifecycle behavior only, not full packaging of bundled runtimes or installer delivery.

</domain>

<decisions>
## Implementation Decisions

### Desktop shell choice
- **D-01:** Phase 6 should use `Electron` as the desktop shell for the Windows app.
- **D-02:** The shell should be additive around the current Next.js + FastAPI architecture, not a rewrite of the app into a new frontend/runtime model.

### Startup experience
- **D-03:** App startup should show a short splash/loading experience while the managed runtime becomes ready.
- **D-04:** The main application window should only become the active user surface after the managed runtime is healthy enough to serve the app.

### Window and navigation behavior
- **D-05:** The desktop app should use a single main window for this first release.
- **D-06:** External links should open in the user's default browser instead of new in-app windows.
- **D-07:** Phase 6 should not introduce a system tray or minimize-to-tray behavior.

### Failure handling
- **D-08:** If startup fails, the user should see a friendly failure screen rather than a silent exit or raw technical error.
- **D-09:** The failure screen should include a simple retry action.
- **D-10:** The failure screen should provide a way to open logs or diagnostics for support and debugging.

### Process lifecycle
- **D-11:** The desktop host should own startup and shutdown of the app-managed processes and terminate them cleanly when the main app closes.
- **D-12:** Normal user operation must not show terminal or console windows during startup, use, or shutdown.

### the agent's Discretion
- Exact Electron process structure, IPC shape, and preload boundaries, provided they preserve a simple single-window app model.
- Exact splash visual design and transition timing, provided startup feels intentional and non-technical.
- Exact wording and layout of the failure screen, provided it stays user-friendly and exposes retry plus logs.

</decisions>

<specifics>
## Specific Ideas

- The user wants this to feel like a normal installed Windows app for a non-technical spouse: double-click, wait briefly, app opens.
- The shell choice is intentionally pragmatic: prefer the path with less integration risk for this existing Next.js + FastAPI stack.
- The first desktop release should stay operationally simple: one window, no tray, no advanced background behaviors.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Milestone scope and requirements
- `.planning/PROJECT.md` — Current milestone goals, constraints, and repository strategy for Windows desktop distribution
- `.planning/REQUIREMENTS.md` — Phase-mapped desktop distribution requirements, especially `DSK-01`, `DSK-02`, and `DSK-04`
- `.planning/ROADMAP.md` — Phase 6 scope, dependencies, and success criteria
- `.planning/STATE.md` — Current milestone position and planning state

### Existing runtime behavior
- `docker/start.sh` — Current process lifecycle model for starting backend first, waiting for health, then starting frontend and shutting both down together
- `Dockerfile` — Current production build shape, including standalone Next.js output and combined backend/frontend runtime assumptions
- `apps/backend/app/main.py` — FastAPI startup/shutdown behavior and Windows-specific event loop handling
- `apps/frontend/next.config.ts` — Frontend standalone output and backend rewrite assumptions for local runtime composition
- `apps/frontend/lib/api/client.ts` — Frontend API base resolution and current localhost/internal-origin expectations

### Prior product decisions
- `.planning/phases/05-inline-application-status-editing/05-CONTEXT.md` — Most recent locked product interaction decisions and existing expectation that the desktop shell must preserve current app flows

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `docker/start.sh`: already encodes the intended runtime sequence for a combined app process, including backend health wait, frontend startup, and coordinated shutdown.
- `Dockerfile`: already proves the app can run as a composed production runtime with standalone Next.js output plus backend API.
- `apps/backend/app/main.py`: already contains Windows-aware event loop configuration, reducing risk for a Windows desktop host.
- `apps/frontend/next.config.ts`: already targets `output: 'standalone'`, which is useful for a desktop-hosted production build.

### Established Patterns
- The current app expects the backend to be ready before the frontend can fully operate.
- The frontend assumes a local backend runtime and already resolves internal API origins for server-side execution.
- The product is local-first and single-user, so the desktop shell should preserve local runtime ownership rather than introducing hosted dependencies.

### Integration Points
- The desktop host will need to replace the current shell script orchestration with Windows-friendly managed process startup.
- Startup readiness should be driven by the existing health endpoint and frontend availability expectations.
- Shutdown behavior should mirror the current coordinated cleanup pattern instead of leaving backend/frontend detached.

</code_context>

<deferred>
## Deferred Ideas

- Bundling the full backend/frontend/runtime payload into distributable artifacts belongs in Phase 7.
- Windows installer generation, Start menu/Desktop shortcut delivery, and release packaging belong in Phase 8.
- Rich auto-update behavior, release checklists, and deeper diagnostics hardening belong in Phase 9.

</deferred>

---
*Phase: 06-desktop-shell-lifecycle*
*Context gathered: 2026-03-24*
