---
status: passed_with_followup
phase: 07-bundled-runtime-persistent-data
source: [07-VERIFICATION.md]
started: 2026-03-25T10:55:00Z
updated: 2026-03-25T11:45:00Z
---

## Current Test

Mac validation completed for the automated and contract-level checks. Windows packaged-runtime launch and upgrade validation are still pending for final acceptance.

## Tests

### 1. Bundled runtime build
expected: `npm run desktop:bundle-runtime` completes successfully and produces the runtime tree with frontend, backend, embedded Node, and Playwright assets.
result: passed (contract-level)
notes: On macOS, `node scripts/desktop/build-runtime.mjs --verify-layout` passed and verified the expected runtime tree targets for frontend, backend, embedded Node, and Playwright assets.

### 2. Core product flows in packaged mode
expected: The desktop app launched against packaged artifacts keeps settings, tailoring, application tracking, and PDF export working without developer runtimes installed.
result: partial
notes: Supporting checks passed on macOS: `cd apps/desktop && npm run test`, `cd apps/desktop && npm run typecheck`, and `uv run --project apps/backend --extra dev pytest apps/backend/tests/unit/test_pdf_runtime.py -x`. Full packaged launch validation is still pending on a real Windows-targeted bundle.

### 3. Restart and upgrade-safe data
expected: Local data is written outside the install directory, survives app restart, and remains readable after replacing the packaged runtime with a newer build.
result: partial
notes: Storage migration and idempotency checks passed on macOS via `uv run --project apps/backend --extra dev pytest apps/backend/tests/integration/test_desktop_storage.py -x`. Real restart/upgrade validation against an installed Windows bundle is still pending.

## Summary

total: 3
passed: 1
issues: 0
pending: 2
skipped: 0
blocked: 0

## Gaps

- Full packaged Windows launch still needs to be validated against real bundled artifacts.
- Upgrade behavior still needs a human check using an existing local data set on the target runtime.
