from __future__ import annotations

import shutil
import subprocess
import sys
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[2]
SPEC_PATH = PROJECT_ROOT / "apps" / "backend" / "desktop.spec"
DIST_PATH_RELATIVE = "dist/desktop/runtime/backend"
DIST_PATH = PROJECT_ROOT / DIST_PATH_RELATIVE
WORK_PATH = PROJECT_ROOT / ".tmp" / "desktop-pyinstaller"
EXPECTED_EXECUTABLE = DIST_PATH / "rm-backend" / "rm-backend.exe"


def main() -> int:
    if DIST_PATH.exists():
        shutil.rmtree(DIST_PATH)
    if WORK_PATH.exists():
        shutil.rmtree(WORK_PATH)

    command = [
        sys.executable,
        "-m",
        "PyInstaller",
        str(SPEC_PATH),
        "--noconfirm",
        "--clean",
        "--distpath",
        str(DIST_PATH),
        "--workpath",
        str(WORK_PATH),
    ]
    subprocess.run(command, check=True, cwd=PROJECT_ROOT)

    if not EXPECTED_EXECUTABLE.exists():
        raise FileNotFoundError(
            f"Missing expected backend executable: {EXPECTED_EXECUTABLE}"
        )

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
