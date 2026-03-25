# Plan 07-03 Summary

## What changed

- Rewired desktop production runtime commands to use the packaged backend executable, packaged Node runtime, stable desktop data roots, and bundled Playwright browser path.
- Added optional `RM_BACKUP_DIR` support to backend storage resolution and made packaged PDF behavior prefer `PLAYWRIGHT_BROWSERS_PATH`.
- Added targeted runtime and PDF tests plus README guidance for bundled runtime validation and desktop data env vars.

## Key files

- `apps/desktop/src/runtime/command-factory.ts`
- `apps/desktop/src/runtime/supervisor.ts`
- `apps/desktop/src/main.ts`
- `apps/backend/app/storage_paths.py`
- `apps/backend/app/pdf.py`
- `apps/desktop/tests/runtime-supervisor.test.ts`
- `apps/backend/tests/unit/test_pdf_runtime.py`
- `apps/desktop/README.md`

## Verification

- `cd apps/desktop && npm run test -- runtime-supervisor.test.ts`
- `cd apps/desktop && npm run typecheck`
- `uv run --project apps/backend --extra dev pytest apps/backend/tests/unit/test_pdf_runtime.py -x`

## Self-Check

PASS
