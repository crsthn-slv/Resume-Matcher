from __future__ import annotations

from pathlib import Path
from unittest.mock import AsyncMock, patch

import pytest
from playwright.async_api import Error as PlaywrightError

from app.pdf import (
    _build_missing_packaged_browser_message,
    _launch_browser,
    _raise_playwright_error,
    PDFRenderError,
)


class _FakePlaywright:
    def __init__(self, side_effect):
        self.chromium = type("Chromium", (), {"launch": AsyncMock(side_effect=side_effect)})()


@pytest.mark.asyncio
async def test_prefers_bundled_playwright_browser_path(monkeypatch, tmp_path):
    browser_root = tmp_path / "playwright"
    browser_root.mkdir(parents=True)
    monkeypatch.setenv("PLAYWRIGHT_BROWSERS_PATH", str(browser_root))

    fake_browser = object()
    playwright = _FakePlaywright(side_effect=[fake_browser])

    with patch("app.pdf._find_chromium_executable") as find_system_browser:
        result = await _launch_browser(playwright)

    assert result is fake_browser
    find_system_browser.assert_not_called()


@pytest.mark.asyncio
async def test_bundled_browser_error_references_playwright_browsers_path(monkeypatch, tmp_path):
    browser_root = tmp_path / "playwright"
    browser_root.mkdir(parents=True)
    monkeypatch.setenv("PLAYWRIGHT_BROWSERS_PATH", str(browser_root))

    playwright = _FakePlaywright(side_effect=PlaywrightError("Executable doesn't exist"))

    with pytest.raises(PDFRenderError) as error:
        await _launch_browser(playwright)

    assert "PLAYWRIGHT_BROWSERS_PATH" in str(error.value)
    assert str(browser_root) in str(error.value)


def test_missing_bundled_browser_message_references_playwright_browsers_path(tmp_path):
    browser_root = tmp_path / "playwright"
    message = _build_missing_packaged_browser_message(browser_root)
    assert "packaged runtime" in message
    assert "PLAYWRIGHT_BROWSERS_PATH" in message
    assert str(browser_root) in message


def test_raise_playwright_error_falls_back_to_system_install_in_dev(monkeypatch):
    monkeypatch.delenv("PLAYWRIGHT_BROWSERS_PATH", raising=False)

    with pytest.raises(PDFRenderError) as error:
        _raise_playwright_error(
            PlaywrightError("Executable doesn't exist"),
            "http://127.0.0.1:3000/print",
        )

    assert "playwright install chromium" in str(error.value)
