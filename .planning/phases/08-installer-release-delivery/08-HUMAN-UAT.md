# Phase 08 Human UAT

## Goal

Validate the real Windows installer behavior that cannot be proven from macOS-only automation.

## Environment

- Target OS: Windows 11
- Preferred source: GitHub Actions artifact from `Windows Desktop Release`
- Fallback source: local Windows run of `npm run desktop:release:win`

## Checks

### 1. Installer build output

Expected:
- `dist/desktop-installer` contains `ResumeMatcher-Setup-<version>.exe`

Record:
- Status:
- Notes:

### 2. First-time install

Expected:
- installer requests elevation
- app installs under `Program Files`
- Desktop shortcut exists
- Start Menu shortcut exists
- app launches from shortcut without showing developer tooling

Record:
- Status:
- Notes:

### 3. Upgrade with newer installer

Expected:
- closing the app and running a newer installer replaces the existing install
- local data under `%LOCALAPPDATA%` remains present after relaunch
- no side-by-side duplicate install is created

Record:
- Status:
- Notes:

## Result

- Overall:
- Follow-up:
