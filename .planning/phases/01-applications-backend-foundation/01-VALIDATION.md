---
phase: 01
slug: applications-backend-foundation
status: approved
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-23
---

# Phase 01 — Validation Strategy

> Retroactive Nyquist validation contract reconstructed from the executed Phase 1 artifacts.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Python `unittest` (`IsolatedAsyncioTestCase`) |
| **Config file** | [`apps/backend/pyproject.toml`](/Users/cristhian/Downloads/Projetos/Resume Matcher/apps/backend/pyproject.toml) |
| **Quick run command** | `./apps/backend/.venv/bin/python -m unittest apps.backend.tests.test_applications_endpoints` |
| **Full suite command** | `PYTHONPYCACHEPREFIX=/tmp/resume-matcher-pycache ./apps/backend/.venv/bin/python -m compileall apps/backend/app && ./apps/backend/.venv/bin/python -m unittest apps.backend.tests.test_applications_endpoints` |
| **Estimated runtime** | ~1 second |

## Sampling Rate

- **After every task commit:** Run `./apps/backend/.venv/bin/python -m unittest apps.backend.tests.test_applications_endpoints`
- **After every plan wave:** Run `PYTHONPYCACHEPREFIX=/tmp/resume-matcher-pycache ./apps/backend/.venv/bin/python -m compileall apps/backend/app && ./apps/backend/.venv/bin/python -m unittest apps.backend.tests.test_applications_endpoints`
- **Before `$gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | APPL-01 | integration | `./apps/backend/.venv/bin/python -m unittest apps.backend.tests.test_applications_endpoints` | ✅ | ✅ green |
| 01-01-02 | 01 | 1 | APPL-02 | integration | `./apps/backend/.venv/bin/python -m unittest apps.backend.tests.test_applications_endpoints` | ✅ | ✅ green |
| 01-01-03 | 01 | 1 | APPL-03 | integration | `./apps/backend/.venv/bin/python -m unittest apps.backend.tests.test_applications_endpoints` | ✅ | ✅ green |
| 01-02-01 | 02 | 2 | APPL-04 | integration | `./apps/backend/.venv/bin/python -m unittest apps.backend.tests.test_applications_endpoints` | ✅ | ✅ green |
| 01-02-02 | 02 | 2 | PIPE-01 | integration | `./apps/backend/.venv/bin/python -m unittest apps.backend.tests.test_applications_endpoints` | ✅ | ✅ green |
| 01-03-01 | 03 | 3 | PIPE-02 | integration | `./apps/backend/.venv/bin/python -m unittest apps.backend.tests.test_applications_endpoints` | ✅ | ✅ green |
| 01-03-02 | 03 | 3 | PIPE-03 | integration | `PYTHONPYCACHEPREFIX=/tmp/resume-matcher-pycache ./apps/backend/.venv/bin/python -m compileall apps/backend/app && ./apps/backend/.venv/bin/python -m unittest apps.backend.tests.test_applications_endpoints` | ✅ | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

## Evidence Mapping

- `test_create_application_manual_without_resume` covers APPL-01 and APPL-03.
- `test_create_application_manual_with_resume_id` and metadata assertions cover APPL-02.
- `test_create_application_with_job_description_creates_job` covers APPL-04.
- `test_status_change_appends_history` and `test_patch_does_not_append_history` cover PIPE-01.
- `test_invalid_status_is_rejected` and `test_invalid_status_change_is_rejected` cover PIPE-02.
- `test_default_status_falls_back_to_first_configured_status` covers PIPE-03.
- `test_remove_status_in_use_is_rejected`, `test_search_matches_company_and_role`, `test_multi_status_filter`, and `test_reset_database_clears_applications` reinforce the phase contract end to end.

Primary evidence file:
- [`apps/backend/tests/test_applications_endpoints.py`](/Users/cristhian/Downloads/Projetos/Resume Matcher/apps/backend/tests/test_applications_endpoints.py)

## Wave 0 Requirements

Existing infrastructure covers all phase requirements.

## Manual-Only Verifications

All phase behaviors have automated verification.

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 5s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-03-23
