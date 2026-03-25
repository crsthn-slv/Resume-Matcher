# Resume Matcher Desktop Shell

## Install

`cd apps/desktop && npm install`

## Run in desktop dev mode

`npm run dev`

## Build the shell

`npm run build`

## Build bundled runtime

`npm run bundle:runtime`

The packaged runtime is built into these directories:
- `runtime/frontend`
- `runtime/backend`
- `runtime/bin`
- `runtime/playwright`

## Build the Windows installer

From the repo root:

- `npm run desktop:release:win`
- `npm run desktop:release:win:dir`

Installer artifacts are written to `dist/desktop-installer`.

The user-facing Windows result is one installer `.exe` that installs Resume Matcher under `Program Files` and creates Desktop plus Start Menu shortcuts.

## Release docs

- `docs/release/windows-desktop-release.md`
- `docs/release/windows-install-upgrade.md`

## Run tests

`npm run test`

## Validate bundled runtime

From the repo root:

- `npm run desktop:bundle-runtime:verify`
- `uv run --project apps/backend --extra desktop python -m PyInstaller --version`

## Desktop data location

The desktop host passes these env vars to the packaged runtime:
- `RM_DATA_DIR`
- `RM_BACKUP_DIR`
- `PLAYWRIGHT_BROWSERS_PATH`

On Windows, app binaries live under `Program Files` and user data stays under `%LOCALAPPDATA%` so reinstalls and upgrades do not wipe local resumes, jobs, applications, config, or backups.

## Logs

The shell expects the backend on `127.0.0.1:8000` and the frontend on `127.0.0.1:3000`.

Desktop logs are written under the Electron user-data logs directory:
- `desktop-host.log`
- `backend.log`
- `frontend.log`
