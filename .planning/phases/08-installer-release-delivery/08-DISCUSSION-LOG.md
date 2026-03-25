# Phase 8: Installer & Release Delivery - Discussion Log

**Date:** 2026-03-25
**Status:** Complete

## Summary

Discussed the key decisions that shape installer delivery in Phase 8: installer technology, official Windows build flow, installation behavior, and update delivery for v1.1. The user accepted the pragmatic recommendation for installer technology, release automation, and manual updates, while explicitly choosing machine-wide installation in `Program Files`.

## Questions and Answers

### Area: Installer technology

**Question:** Which installer technology should package the Windows desktop app?

**Options presented:**
- `electron-builder + NSIS` — Recommended. Best fit for a single `.exe` installer and future release packaging needs.
- `electron-forge` — Valid, but less direct for this repo's packaging goals.
- `Manual external installer` — Not recommended because it adds complexity without clear benefit.

**User selection:** `electron-builder + NSIS`

**Captured decision:** Use `electron-builder` with an `NSIS` installer for the Windows delivery path.

### Area: Release build flow

**Question:** What should be the official Windows release build flow?

**Options presented:**
- `GitHub Actions generating the official Windows build` — Recommended.
- `Manual local Windows build only` — Simpler initially, but less repeatable.
- `Both, with CI as official and local as fallback` — Acceptable, but the official path should still be CI.

**User selection:** `GitHub Actions generating the official Windows build`

**Captured decision:** Use GitHub Actions as the canonical release pipeline for Windows artifacts.

### Area: Install behavior

**Question:** How should installation behave for the end user?

**Options presented:**
- `Per-user install with Desktop + Start Menu shortcuts and reinstall-based upgrades` — Recommended.
- `Machine-wide install in Program Files`
- `Portable/no-installer delivery`
- `Other behavior`

**User selection:** `Machine-wide install in Program Files`

**Captured decision:** Install machine-wide in `Program Files`, while still creating normal Windows entry points.

### Area: Update delivery

**Question:** What update strategy should v1.1 use?

**Options presented:**
- `Manual update through a new installer, with the process documented` — Recommended.
- `Auto-update already in Phase 8` — Possible, but operationally heavier.
- `No defined update path` — Not recommended.

**User selection:** `Manual update through a new installer, with the process documented`

**Captured decision:** Use manual updates via a newer installer release for v1.1.

## Deferred Items

- Hosted auto-update feeds and in-app update automation remain deferred.
- Final release checklist execution and Windows release candidate signoff remain deferred to Phase 9.

---
*Phase: 08-installer-release-delivery*
*Discussion logged: 2026-03-25*
