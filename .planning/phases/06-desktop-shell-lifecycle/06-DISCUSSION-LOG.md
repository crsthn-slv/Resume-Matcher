# Phase 6: Desktop Shell & Lifecycle - Discussion Log

**Date:** 2026-03-24
**Status:** Complete

## Summary

Discussed the implementation decisions that materially affect the Phase 6 user experience: desktop shell selection, startup UX, window behavior, and startup failure handling. The user accepted the pragmatic recommendations for all four areas.

## Questions and Answers

### Area: Desktop shell

**Question:** Which desktop shell should Phase 6 use?

**Options presented:**
- `Electron` — Recommended. Best fit for the current Next.js + FastAPI stack and child-process control needs.
- `Tauri` — Smaller app footprint, but higher integration complexity for this codebase.
- `Other wrapper` — Not recommended for this phase.

**User selection:** `Electron`

**Captured decision:** Use Electron as the Phase 6 desktop shell.

### Area: Startup UX

**Question:** How should startup feel while the managed runtime becomes ready?

**Options presented:**
- `Splash/loading` short experience — Recommended.
- Open main window immediately and let it wait internally.
- Open only after everything is ready, with no splash.

**User selection:** `Splash/loading`

**Captured decision:** Show a short startup experience and only promote the main window after readiness.

### Area: Window behavior

**Question:** What should the initial window/navigation model be?

**Options presented:**
- `Single window + external browser for links + no tray` — Recommended.
- `Single window + tray`
- `Multiple internal windows`
- `Other behavior`

**User selection:** `Single window + external browser for links + no tray`

**Captured decision:** Keep the first desktop release operationally simple: one window, external browser for links, no tray behavior.

### Area: Failure handling

**Question:** What should the user see if startup fails?

**Options presented:**
- `Friendly error screen with retry and open logs` — Recommended.
- Close silently.
- Show raw technical error.
- Other behavior.

**User selection:** `Friendly error screen with retry and open logs`

**Captured decision:** Startup failures must be user-friendly but still expose actionable diagnostics.

## Deferred Items

- No new product capabilities were proposed during discussion.
- Packaging of embedded runtimes, installer generation, and update delivery remain deferred to later phases of this milestone.

---
*Phase: 06-desktop-shell-lifecycle*
*Discussion logged: 2026-03-24*
