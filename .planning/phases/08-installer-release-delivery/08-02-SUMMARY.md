# Plan 08-02 Summary

## What changed

- Added root release scripts so maintainers can trigger the Windows desktop packaging flow from the main repository.
- Added the canonical GitHub Actions workflow that builds the Windows installer on `windows-latest`, using Node, Python, and `uv`, then uploads `dist/desktop-installer` as the release artifact.
- Tightened the runtime build contract so bundled Chromium installation also runs through `uv` in the backend project environment, which keeps the CI build aligned with the repo's Python dependency contract.
- Added the maintainer release runbook covering version source, official CI release flow, local Windows fallback, and artifact expectations.

## Key files

- `package.json`
- `scripts/desktop/build-runtime.mjs`
- `.github/workflows/windows-desktop-release.yml`
- `docs/release/windows-desktop-release.md`

## Verification

- `rg -n "desktop:release:win|desktop:release:win:dir" package.json`
- `rg -n "windows-latest|workflow_dispatch|v\\*\\.\\*\\.\\*|dist/desktop-installer|npm run desktop:release:win" .github/workflows/windows-desktop-release.yml`
- `rg -n "Version source|Canonical CI release|Local fallback|Artifacts" docs/release/windows-desktop-release.md`

## Self-Check

PASS
