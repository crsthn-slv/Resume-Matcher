---
phase: 07-bundled-runtime-persistent-data
verified: 2026-03-25T10:55:00Z
status: human_needed
score: 4/4 must-haves implemented; packaged-runtime validation still required
---

# Phase 07: Bundled Runtime & Persistent Data Verification Report

**Phase Goal:** Packaged desktop builds run the full existing product against local data that survives restarts and normal upgrades.  
**Verified:** 2026-03-25T10:55:00Z  
**Status:** human_needed

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | The repo now defines a packaged runtime contract for frontend, backend, embedded Node, and Playwright assets. | ✓ IMPLEMENTED | `scripts/desktop/build-runtime.mjs`, `scripts/desktop/build-backend.py`, `apps/backend/desktop.spec`, `apps/desktop/src/runtime/packaged-layout.ts` |
| 2 | Backend persistence now resolves from a stable user-data contract instead of only repo-local `apps/backend/data`. | ✓ IMPLEMENTED | `apps/backend/app/storage_paths.py`, `apps/backend/app/config.py`, `apps/backend/app/database.py`, `apps/backend/app/main.py` |
| 3 | The desktop production shell now targets packaged runtime artifacts and passes stable data/backup/browser env vars into the managed processes. | ✓ IMPLEMENTED | `apps/desktop/src/runtime/command-factory.ts`, `apps/desktop/src/runtime/supervisor.ts`, `apps/desktop/src/main.ts` |
| 4 | PDF runtime behavior now prefers bundled Chromium via `PLAYWRIGHT_BROWSERS_PATH`, with automated regression coverage. | ✓ IMPLEMENTED | `apps/backend/app/pdf.py`, `apps/backend/tests/unit/test_pdf_runtime.py`, `apps/desktop/tests/runtime-supervisor.test.ts` |

**Score:** 4/4 truths implemented

## Requirements Coverage

| Requirement | Status | Evidence |
|-------------|--------|----------|
| DATA-01 | ⚠ Human verification required | Build pipeline and packaged launch contract exist, but a full bundled runtime build still needs real packaged execution validation. |
| DATA-02 | ✓ Implemented | Stable user-data and backup path resolution now live in backend storage helpers and Electron env handoff. |
| DATA-03 | ⚠ Human verification required | Migration and backup logic exists and tests pass, but restart/upgrade behavior still needs end-to-end packaged validation. |
| DSK-03 | ⚠ Human verification required | Desktop runtime wiring preserves API/PDF/data contracts, but full product-flow validation must happen in a real packaged runtime. |

## Commands Run

- `node scripts/desktop/build-runtime.mjs --verify-layout`
- `uv run --project apps/backend --extra desktop python -m PyInstaller --version`
- `uv run --project apps/backend --extra dev pytest apps/backend/tests/integration/test_desktop_storage.py -x`
- `uv run --project apps/backend --extra dev pytest apps/backend/tests/unit/test_pdf_runtime.py -x`
- `cd apps/desktop && npm run typecheck`
- `cd apps/desktop && npm run test -- runtime-supervisor.test.ts`
- `cd apps/desktop && npm run test`

## Result

- Packaged runtime layout verification: pass
- Backend desktop build dependency check: pass
- Storage integration tests: pass
- PDF packaged-browser tests: pass
- Desktop typecheck: pass
- Desktop targeted runtime tests: pass
- Desktop full test suite: pass

## Human Verification Required

1. Run a real `desktop:bundle-runtime` build and confirm the packaged runtime tree is produced successfully on the target packaging environment.
2. Launch the desktop shell against packaged artifacts and confirm existing app flows still work end to end, including settings, tailoring, application tracking, and PDF export.
3. Confirm local data is written outside the install tree, survives app restart, and remains readable after replacing the runtime with a newer build.

## Gaps Summary

No implementation gaps found in code or automated checks. Phase 7 remains open only because packaged-runtime execution and upgrade behavior still need a human validation pass on a real bundle, ideally on Windows.

## Verification Metadata

**Verification approach:** code inspection plus targeted automated runtime/storage checks  
**Automated checks:** 7  
**Human checks required:** 3  
**Total verification time:** 18 min

---
*Verified: 2026-03-25T10:55:00Z*
*Verifier: the agent*
