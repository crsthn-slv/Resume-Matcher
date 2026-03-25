"""Stable per-user storage path resolution and lightweight migrations."""

from __future__ import annotations

import json
import os
import shutil
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

RM_DATA_DIR = "RM_DATA_DIR"
RM_BACKUP_DIR = "RM_BACKUP_DIR"
SCHEMA_VERSION = 1
MANIFEST_RELATIVE_PATH = Path(".meta") / "storage-schema.json"


def _repo_root() -> Path:
    return Path(__file__).resolve().parents[3]


def _legacy_data_dir() -> Path:
    return _repo_root() / "apps" / "backend" / "data"


def resolve_data_dir() -> Path:
    """Resolve the application data directory."""
    data_dir = os.environ.get(RM_DATA_DIR)
    if data_dir:
        return Path(data_dir).expanduser().resolve()
    return _legacy_data_dir()


def resolve_backup_dir() -> Path:
    """Resolve the root directory used for storage backups."""
    backup_dir = os.environ.get(RM_BACKUP_DIR)
    if backup_dir:
        return Path(backup_dir).expanduser().resolve()
    return resolve_data_dir() / "backups"


def resolve_migration_manifest_path() -> Path:
    """Resolve the storage schema manifest path."""
    return resolve_data_dir() / MANIFEST_RELATIVE_PATH


def _read_manifest(path: Path) -> dict[str, Any]:
    if not path.exists():
        return {}
    try:
        return json.loads(path.read_text())
    except (json.JSONDecodeError, OSError):
        return {}


def _write_manifest(path: Path, schema_version: int = SCHEMA_VERSION) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps({"schema_version": schema_version}, indent=2))


def _timestamped_backup_dir() -> Path:
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    return resolve_backup_dir() / "pre-migration" / timestamp


def _copy_if_exists(source: Path, destination: Path) -> None:
    if not source.exists():
        return
    destination.parent.mkdir(parents=True, exist_ok=True)
    if source.is_dir():
        shutil.copytree(source, destination, dirs_exist_ok=True)
    else:
        shutil.copy2(source, destination)


def _is_directory_empty(path: Path) -> bool:
    return not path.exists() or not any(path.iterdir())


def _stable_data_has_payload(data_dir: Path) -> bool:
    payload_paths = (
        data_dir / "database.json",
        data_dir / "config.json",
        data_dir / "uploads",
    )
    return any(path.exists() for path in payload_paths)


def _backup_existing_stable_data(data_dir: Path) -> Path | None:
    backup_dir = _timestamped_backup_dir()
    copied = False
    for name in ("database.json", "config.json", "uploads"):
        source = data_dir / name
        if source.exists():
            _copy_if_exists(source, backup_dir / name)
            copied = True
    return backup_dir if copied else None


def _migrate_legacy_repo_data(data_dir: Path) -> bool:
    legacy_dir = _legacy_data_dir()
    if data_dir == legacy_dir:
        return False
    legacy_payload = (
        legacy_dir / "database.json",
        legacy_dir / "config.json",
        legacy_dir / "uploads",
    )
    if not any(path.exists() for path in legacy_payload):
        return False
    if not _is_directory_empty(data_dir):
        return False

    data_dir.mkdir(parents=True, exist_ok=True)
    for source in legacy_payload:
        _copy_if_exists(source, data_dir / source.name)
    return True


def prepare_storage() -> Path:
    """Prepare the storage directory and apply lightweight file migrations."""
    data_dir = resolve_data_dir()
    manifest_path = resolve_migration_manifest_path()
    data_dir.mkdir(parents=True, exist_ok=True)

    migrated_legacy_data = _migrate_legacy_repo_data(data_dir)
    manifest = _read_manifest(manifest_path)
    current_version = int(manifest.get("schema_version", 0) or 0)

    if current_version >= SCHEMA_VERSION:
        return data_dir

    if _stable_data_has_payload(data_dir) and not migrated_legacy_data:
        _backup_existing_stable_data(data_dir)

    _write_manifest(manifest_path, SCHEMA_VERSION)
    return data_dir
