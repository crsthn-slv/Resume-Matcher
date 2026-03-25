"""Integration coverage for desktop storage preparation."""

from __future__ import annotations

import json
from pathlib import Path
from unittest.mock import AsyncMock, patch

import pytest

from app import storage_paths
from app.main import app
from app.storage_paths import prepare_storage, resolve_migration_manifest_path


def _write_json(path: Path, payload: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2))


def _seed_legacy_repo_data(repo_root: Path) -> Path:
    legacy_dir = repo_root / "apps" / "backend" / "data"
    _write_json(legacy_dir / "database.json", {"source": "legacy-db"})
    _write_json(legacy_dir / "config.json", {"content_language": "pt-BR"})
    uploads_dir = legacy_dir / "uploads"
    uploads_dir.mkdir(parents=True, exist_ok=True)
    (uploads_dir / "resume.md").write_text("legacy upload")
    return legacy_dir


def _seed_current_data_dir(data_dir: Path) -> None:
    _write_json(data_dir / "database.json", {"source": "current-db"})
    _write_json(data_dir / "config.json", {"content_language": "en"})


@pytest.mark.asyncio
async def test_migrates_legacy_repo_data_into_rm_data_dir(monkeypatch, tmp_path):
    repo_root = tmp_path / "repo"
    stable_dir = tmp_path / "stable-data"
    _seed_legacy_repo_data(repo_root)

    monkeypatch.setenv(storage_paths.RM_DATA_DIR, str(stable_dir))
    monkeypatch.setattr(storage_paths, "_repo_root", lambda: repo_root)

    with patch("app.main.close_pdf_renderer", new=AsyncMock()):
        async with app.router.lifespan_context(app):
            pass

    assert json.loads((stable_dir / "database.json").read_text())["source"] == "legacy-db"
    assert json.loads((stable_dir / "config.json").read_text())["content_language"] == "pt-BR"
    assert (stable_dir / "uploads" / "resume.md").read_text() == "legacy upload"
    manifest = json.loads(resolve_migration_manifest_path().read_text())
    assert manifest == {"schema_version": 1}


def test_prepare_storage_creates_backup_before_structural_migration(monkeypatch, tmp_path):
    stable_dir = tmp_path / "stable-data"
    _seed_current_data_dir(stable_dir)
    manifest_path = stable_dir / ".meta" / "storage-schema.json"
    _write_json(manifest_path, {"schema_version": 0})

    monkeypatch.setenv(storage_paths.RM_DATA_DIR, str(stable_dir))

    prepare_storage()

    pre_migration_root = stable_dir / "backups" / "pre-migration"
    backup_dirs = [path for path in pre_migration_root.iterdir() if path.is_dir()]
    assert len(backup_dirs) == 1
    backup_dir = backup_dirs[0]
    assert json.loads((backup_dir / "database.json").read_text())["source"] == "current-db"
    assert json.loads((backup_dir / "config.json").read_text())["content_language"] == "en"
    assert json.loads(manifest_path.read_text()) == {"schema_version": 1}


def test_prepare_storage_is_idempotent_for_current_schema(monkeypatch, tmp_path):
    stable_dir = tmp_path / "stable-data"
    _seed_current_data_dir(stable_dir)
    _write_json(stable_dir / ".meta" / "storage-schema.json", {"schema_version": 1})

    monkeypatch.setenv(storage_paths.RM_DATA_DIR, str(stable_dir))

    prepare_storage()
    prepare_storage()

    pre_migration_root = stable_dir / "backups" / "pre-migration"
    assert not pre_migration_root.exists()
    assert json.loads((stable_dir / ".meta" / "storage-schema.json").read_text()) == {
        "schema_version": 1
    }
