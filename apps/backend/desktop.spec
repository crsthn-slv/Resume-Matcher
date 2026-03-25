from pathlib import Path

from PyInstaller.utils.hooks import collect_data_files


PROJECT_ROOT = Path.cwd().resolve().parents[1]
BACKEND_DIR = PROJECT_ROOT / "apps" / "backend"
PLAYWRIGHT_DRIVER_DIR = PROJECT_ROOT / ".venv" / "lib"

datas = collect_data_files("app", includes=["**/*.json", "**/*.md", "**/*.txt"])
datas += collect_data_files("playwright", includes=["driver/package/**/*.json"])

a = Analysis(
    ["app/main.py"],
    pathex=[str(BACKEND_DIR)],
    binaries=[],
    datas=datas,
    hiddenimports=[],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    noarchive=False,
    optimize=0,
)
pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='rm-backend',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=False,
)

coll = COLLECT(
    exe,
    a.binaries,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name='rm-backend',
)
