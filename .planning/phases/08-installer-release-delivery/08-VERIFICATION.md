---
phase: 08-installer-release-delivery
verified: 2026-03-25T12:45:00Z
status: human_needed
score: 6/6 requirements implemented; Windows installer validation still required
---

# Phase 08: Installer & Release Delivery Verification Report

**Phase Goal:** Users can install the app from a normal Windows installer, and maintainers can ship repeatable installer releases from the main repository.  
**Verified:** 2026-03-25T12:45:00Z  
**Status:** human_needed

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | The desktop workspace now defines a concrete Electron Builder + NSIS contract for one Windows installer `.exe`. | ✓ IMPLEMENTED | `apps/desktop/electron-builder.json`, `apps/desktop/package.json`, `apps/desktop/tests/packaging-config.test.ts` |
| 2 | The main repository now exposes a canonical Windows release path through GitHub Actions instead of a separate distribution fork. | ✓ IMPLEMENTED | `.github/workflows/windows-desktop-release.yml`, `package.json`, `scripts/desktop/build-runtime.mjs`, `docs/release/windows-desktop-release.md` |
| 3 | The user-facing install and manual upgrade flow is documented with machine-wide installation and stable user-data retention. | ✓ IMPLEMENTED | `docs/release/windows-install-upgrade.md`, `apps/desktop/README.md`, `EASY-SETUP.md` |

**Score:** 3/3 truths implemented

## Requirements Coverage

| Requirement | Status | Evidence |
|-------------|--------|----------|
| INST-01 | ⚠ Human verification required | Installer packaging contract exists, but a real Windows installer build still needs to be observed end to end. |
| INST-02 | ⚠ Human verification required | NSIS shortcut and machine-wide install settings are committed, but Desktop and Start Menu entries must still be confirmed on Windows. |
| INST-03 | ⚠ Human verification required | The installer targets a clean Windows machine flow, but that still needs a real install check. |
| REL-01 | ✓ Implemented | The release scripts and workflow stay in the main repository and package from the current repo state. |
| REL-02 | ✓ Implemented | CI build flow and maintainer release runbook are documented and wired. |
| REL-03 | ✓ Implemented | The manual installer-based upgrade path is documented and aligned to stable `%LOCALAPPDATA%` data retention. |

## Commands Run

- `cd apps/desktop && npm install --save-dev electron-builder@^26.0.12`
- `cd apps/desktop && npm run typecheck`
- `cd apps/desktop && npm run test -- packaging-config.test.ts`
- `cd apps/desktop && npm run test`
- `npm run desktop:bundle-runtime:verify`
- `rg -n "pack:win|dist:win|release:win|electron-builder|Resume Matcher|ResumeMatcher-Setup-\\$\\{version\\}\\.\\$\\{ext\\}|nsis|perMachine|createDesktopShortcut|createStartMenuShortcut|\\.\\./\\.\\./dist/desktop|dist/desktop" apps/desktop/package.json apps/desktop/electron-builder.json apps/desktop/tests/packaging-config.test.ts`
- `rg -n "desktop:release:win|desktop:release:win:dir|windows-latest|workflow_dispatch|v\\*\\.\\*\\.\\*|dist/desktop-installer|npm run desktop:release:win" package.json .github/workflows/windows-desktop-release.yml docs/release/windows-desktop-release.md apps/desktop/README.md`
- `rg -n "First-time install|Installed app location|User data location|Upgrade with a newer installer|What not to do|%ProgramFiles%|%LOCALAPPDATA%|side-by-side|auto-update|windows-install-upgrade\\.md|\\.exe" docs/release/windows-install-upgrade.md EASY-SETUP.md apps/desktop/README.md`

## Result

- Desktop typecheck: pass
- Desktop packaging config test: pass
- Desktop full test suite: pass (`4` files, `13` tests)
- Runtime layout verification: pass
- Packaging config grep verification: pass
- Release workflow/doc grep verification: pass
- Install/upgrade doc grep verification: pass

## Human Verification Required

1. Run a Windows installer build, preferably from GitHub Actions, and confirm `dist/desktop-installer` contains the expected `ResumeMatcher-Setup-<version>.exe`.
2. Install that `.exe` on a clean Windows machine and confirm the app lands under `Program Files` with Desktop and Start Menu shortcuts.
3. Replace an existing install with a newer installer and confirm local data under `%LOCALAPPDATA%` remains intact.

## Gaps Summary

No implementation gaps were found in the packaging config, release automation wiring, or documentation. Phase 8 remains open only because the final installer behavior must still be observed on a real Windows environment.

## Verification Metadata

**Verification approach:** code inspection plus automated config/test validation  
**Automated checks:** 6  
**Human checks required:** 3  
**Total verification time:** 22 min

---
*Verified: 2026-03-25T12:45:00Z*  
*Verifier: the agent*
