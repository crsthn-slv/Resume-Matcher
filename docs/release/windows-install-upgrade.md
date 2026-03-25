# Windows Install and Upgrade

## First-time install

1. Run `ResumeMatcher-Setup-<version>.exe`.
2. Accept the Windows elevation prompt when the installer requests permission.
3. Finish the installation.
4. Open Resume Matcher from the Desktop shortcut or the Start Menu entry.

## Installed app location

The application installs machine-wide under `%ProgramFiles%`.

## User data location

User data is stored separately under `%LOCALAPPDATA%`. That location keeps local resumes, jobs, applications, configuration, and backups outside the install directory so they survive reinstall and upgrade.

## Upgrade with a newer installer

1. Close Resume Matcher.
2. Run the newer `ResumeMatcher-Setup-<version>.exe`.
3. Let the installer replace the existing app.
4. Launch Resume Matcher again from the normal Desktop or Start Menu shortcut.
5. Confirm your existing data is still present.

v1.1 upgrades are performed by running a newer installer over the existing app. Side-by-side installs are not supported.

## What not to do

- Do not keep multiple side-by-side installations of Resume Matcher.
- Do not delete the `%LOCALAPPDATA%` app data directory when upgrading.
- Do not expect auto-update in v1.1.
