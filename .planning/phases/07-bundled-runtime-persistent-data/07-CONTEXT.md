# Phase 7: Bundled Runtime & Persistent Data - Context

**Gathered:** 2026-03-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Package the existing Resume Matcher application so the desktop build can run the full frontend and backend locally with embedded runtimes, while storing user data in a stable per-user location that survives restarts and normal upgrades. This phase is about bundled execution and upgrade-safe local persistence, not installer UX or release publishing.

</domain>

<decisions>
## Implementation Decisions

### Runtime packaging model
- **D-01:** Phase 7 should ship a built frontend runtime plus a compiled backend runtime, with Electron launching local packaged artifacts instead of relying on developer tools on the target machine.
- **D-02:** The packaged runtime should stay additive around the current Next.js + FastAPI architecture rather than introducing a new hosting model or first-boot dependency installation.

### Persistent data location
- **D-03:** User data and configuration must move out of the repo/install tree and live in a stable per-user application data directory.
- **D-04:** For Windows distribution, the target persistence model is the user's local AppData area rather than the executable directory or a user-selected folder prompt.

### Bundled PDF/runtime dependencies
- **D-05:** The desktop build must preserve the current core product flows, including PDF export.
- **D-06:** The Chromium runtime required by Playwright/PDF generation should be bundled with the desktop app instead of assuming an existing browser installation on the user's machine.

### Upgrade-safe data handling
- **D-07:** The desktop app should use a version-stable user data directory so upgrades keep reading the same underlying local data.
- **D-08:** If local storage structure changes, the app should use lightweight migrations rather than resetting user data.
- **D-09:** Before structural migrations, the app should create a backup so local data can be recovered if migration fails.

### the agent's Discretion
- Exact build pipeline details for the compiled backend artifact and built frontend artifact, provided the Windows target does not require Python, Node.js, uv, or npm to be installed manually.
- Exact storage subdirectory naming, provided it is stable, per-user, and outside the install directory.
- Exact migration manifest/version tracking format, provided upgrades remain deterministic and recoverable.

</decisions>

<specifics>
## Specific Ideas

- The user wants packaged builds to behave like a normal local app on a non-technical Windows PC: install once, click to open, and keep working without setting up runtimes.
- This phase should preserve all existing core flows, not just the main dashboard path, so packaging must account for backend APIs, frontend runtime, settings persistence, and PDF export.
- The app remains local-first and single-user, so local data durability across upgrades matters more than multi-user or cloud-sync concerns.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Milestone scope and requirements
- `.planning/PROJECT.md` — Current desktop-distribution goals, constraints, and repository strategy
- `.planning/REQUIREMENTS.md` — Phase-mapped requirements, especially `DATA-01`, `DATA-02`, `DATA-03`, and `DSK-03`
- `.planning/ROADMAP.md` — Phase 7 scope, dependencies, and success criteria
- `.planning/STATE.md` — Current milestone status and outstanding follow-up from Phase 6

### Existing desktop shell and runtime assumptions
- `.planning/phases/06-desktop-shell-lifecycle/06-CONTEXT.md` — Locked desktop-shell decisions that Phase 7 must preserve
- `apps/desktop/src/runtime/command-factory.ts` — Current dev/prod command model that Phase 7 will replace with packaged artifact launching
- `apps/desktop/src/runtime/supervisor.ts` — Existing lifecycle supervision contract that bundled runtime execution must continue to satisfy
- `apps/desktop/src/main.ts` — Current desktop bootstrap behavior and readiness/error flow

### Current backend/frontend build and data model
- `Dockerfile` — Existing proof that standalone frontend output and combined backend/frontend runtime can run together in production form
- `docker/start.sh` — Current orchestrated startup order and readiness assumptions
- `apps/frontend/next.config.ts` — Standalone frontend output and backend rewrite topology
- `apps/backend/pyproject.toml` — Backend dependency set, Python requirement, and Playwright inclusion
- `apps/backend/app/config.py` — Current config and data path behavior that must be relocated to stable user storage
- `apps/backend/app/database.py` — TinyDB persistence model that must survive upgrades
- `apps/backend/app/main.py` — Backend startup/shutdown lifecycle and Windows event loop behavior
- `apps/backend/app/pdf.py` — Playwright/Chromium PDF runtime assumptions that must keep working in the packaged build

### Prior product decisions
- `.planning/phases/05-inline-application-status-editing/05-CONTEXT.md` — Existing product interaction expectations that Phase 7 must preserve when the app is packaged

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `apps/desktop/src/runtime/command-factory.ts`: already separates development vs production launch modes, giving Phase 7 a clear place to swap raw commands for packaged runtime artifact paths.
- `Dockerfile`: already demonstrates that the frontend can run from standalone build output while the backend runs as a colocated production service.
- `apps/backend/app/config.py` and `apps/backend/app/database.py`: already centralize path resolution for config and TinyDB files, making them good migration points for redirecting storage out of the install tree.
- `apps/backend/app/pdf.py`: already centralizes PDF browser launch behavior, which gives Phase 7 a single integration point for bundled Chromium handling.

### Established Patterns
- The app is local-first and currently expects filesystem-backed persistence via TinyDB and JSON config files.
- The frontend already supports standalone production output and proxying backend requests through a local runtime origin.
- The desktop shell from Phase 6 already assumes backend-first startup and explicit readiness checks before showing the main window.

### Integration Points
- Phase 7 needs to replace production runtime commands with packaged executable/server entrypoints while preserving the existing supervisor contract.
- Storage path redirection must happen early enough that both normal runtime behavior and migrations use the same stable user data root.
- PDF export needs a packaged-browser story that works with the relocated data/runtime layout instead of relying on globally installed browsers.

</code_context>

<deferred>
## Deferred Ideas

- Windows installer generation, Start menu/Desktop entry points, and release packaging belong in Phase 8.
- Update publishing/distribution mechanics belong in Phases 8 and 9; this phase only needs the local runtime/data model to be upgrade-safe.
- Full auto-update infrastructure remains out of scope for this phase.

</deferred>

---
*Phase: 07-bundled-runtime-persistent-data*
*Context gathered: 2026-03-25*
