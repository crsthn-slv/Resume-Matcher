---
status: partial
phase: 07-bundled-runtime-persistent-data
source: [07-VERIFICATION.md]
started: 2026-03-25T10:55:00Z
updated: 2026-03-25T10:55:00Z
---

## Current Test

Awaiting packaged-runtime validation on a real build, ideally on Windows.

## Tests

### 1. Bundled runtime build
expected: `npm run desktop:bundle-runtime` completes successfully and produces the runtime tree with frontend, backend, embedded Node, and Playwright assets.
result: pending

### 2. Core product flows in packaged mode
expected: The desktop app launched against packaged artifacts keeps settings, tailoring, application tracking, and PDF export working without developer runtimes installed.
result: pending

### 3. Restart and upgrade-safe data
expected: Local data is written outside the install directory, survives app restart, and remains readable after replacing the packaged runtime with a newer build.
result: pending

## Summary

total: 3
passed: 0
issues: 0
pending: 3
skipped: 0
blocked: 0

## Gaps

- Packaged runtime still needs a real build-and-launch validation pass.
- Upgrade behavior still needs a human check using an existing local data set.
