# Plan 07-02 Summary

## What changed

- Added a stable backend storage contract driven by `RM_DATA_DIR`, with schema manifest and backup helpers in `storage_paths.py`.
- Rewired backend config and TinyDB persistence to resolve through the stable storage root instead of repo-local `apps/backend/data`.
- Added startup storage preparation plus integration tests covering legacy-data migration, pre-migration backups, and idempotent restarts.

## Key files

- `apps/backend/app/storage_paths.py`
- `apps/backend/app/config.py`
- `apps/backend/app/database.py`
- `apps/backend/app/main.py`
- `apps/backend/tests/integration/test_desktop_storage.py`

## Verification

- `uv run --project apps/backend --extra dev pytest apps/backend/tests/integration/test_desktop_storage.py -x`

## Self-Check

PASS
