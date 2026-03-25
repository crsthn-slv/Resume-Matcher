# Plan 08-03 Summary

## What changed

- Added a Windows install and manual upgrade runbook that documents `%ProgramFiles%` for binaries and `%LOCALAPPDATA%` for upgrade-safe user data.
- Updated the desktop README to point maintainers at the new Windows release commands and release/install docs.
- Updated `EASY-SETUP.md` so the non-technical Windows path points to the installer `.exe` and the manual upgrade guide instead of developer setup steps.

## Key files

- `docs/release/windows-install-upgrade.md`
- `apps/desktop/README.md`
- `EASY-SETUP.md`

## Verification

- `rg -n "First-time install|Installed app location|User data location|Upgrade with a newer installer|What not to do|%ProgramFiles%|%LOCALAPPDATA%" docs/release/windows-install-upgrade.md`
- `rg -n "desktop:release:win|desktop:release:win:dir|dist/desktop-installer" apps/desktop/README.md`
- `rg -n "installer|windows-install-upgrade.md|\\.exe" EASY-SETUP.md`

## Self-Check

PASS
