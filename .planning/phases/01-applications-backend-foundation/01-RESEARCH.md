# Phase 1: Applications Backend Foundation - Research

**Researched:** 2026-03-22
**Domain:** FastAPI + TinyDB backend domain modeling for application tracking
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Creating an application must append an initial `status_history` entry.
- The initial history entry uses the creation source, specifically `manual_create` or `tailor_create`.
- The initial history record should represent the starting transition from no prior status into the created status.
- `GET /applications` should return a display-ready list for the dashboard table, not a minimal id-only payload.
- Application list items may include resolved linked metadata needed for quick rendering, in addition to the application's own fields.
- `POST /applications` remains flexible across manual and tailoring flows, but validation rules must be explicit and strict.
- If `job_description` is provided, the backend creates a linked job record.
- If `job_id` is provided, the same payload must not also include `job_description`.
- If `resume_id` or `job_id` is provided, the backend must validate that the referenced record exists and reject invalid references.

### the agent's Discretion
- Exact response field naming for derived display metadata, as long as it is consistent with existing API conventions.
- Internal helper structure for history append logic, config validation, and shared record hydration.
- Whether linked display metadata is assembled in router or database/service helper layers, as long as backend layering stays coherent.

### Deferred Ideas (OUT OF SCOPE)
- Exact dashboard table presentation and interaction details
- Settings UI behavior for add/remove/reorder pipeline controls
- Post-tailoring application creation UX and prefill behavior in the frontend
- Kanban board, reminders, interview tracking, and smart parsing
</user_constraints>

<research_summary>
## Summary

Phase 1 fits cleanly into the existing backend architecture without introducing new dependencies. The current system already has the right extension points: `Database` owns TinyDB table access, `schemas/models.py` centralizes request/response models, `routers/config.py` owns persisted config helpers, and `main.py` plus `routers/__init__.py` define the router registration pattern.

The standard approach for this repo is to model `application` as a new first-class record in TinyDB, expose a dedicated router under `/api/v1`, and keep business validation at the route/data-access boundary rather than introducing a separate service layer unless the logic becomes LLM-heavy. Display-ready list payloads are best produced server-side because the dashboard read path is the primary consumer and the existing backend already resolves linked entities for other flows.

The biggest planning concern is consistency across linked records and config validation. The implementation should centralize default-status resolution, status-history creation, linked `resume`/`job` validation, and blocked-status-removal checks so later frontend phases can rely on stable backend behavior.

**Primary recommendation:** Build Phase 1 in three layers: shared application schemas and database helpers first, dedicated applications endpoints second, and config endpoints plus comprehensive tests third.
</research_summary>

<standard_stack>
## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| FastAPI | existing repo dependency | HTTP route definitions, validation, error contracts | Already the backend framework and router pattern used everywhere in the app |
| Pydantic v2 | existing repo dependency | Request/response models for `application` payloads and config bodies | Existing schemas are centralized in `apps/backend/app/schemas/models.py` |
| TinyDB | existing repo dependency | JSON persistence for `applications` and lookup/filter operations | Existing app stores `resumes`, `jobs`, and `improvements` with the same wrapper |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Python `datetime` / `timezone` | stdlib | ISO timestamp generation for records and history | Use for all created/updated/status-changed audit fields |
| Python `uuid4` | stdlib | Stable ids like `application_id` | Use when creating new application records |
| TinyDB `Query` | existing repo dependency | Search and filter by ids/status/company/role | Use in data-access helpers for list and validation operations |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| TinyDB application records | Separate SQL/ORM layer | More query power, but unjustified complexity for a single-user local-first MVP |
| Server-side display hydration | Frontend fan-out fetching by `job_id`/`resume_id` | Simpler backend response, but worse dashboard latency and more client coupling |
| Shared config file helpers in `config.py`/router | Dedicated applications settings store | Cleaner isolation, but unnecessary duplication of an already-established config persistence pattern |

**Installation:**
```bash
# No new dependencies required for this phase
```
</standard_stack>

<architecture_patterns>
## Architecture Patterns

### Recommended Project Structure
```text
apps/backend/app/
├── database.py                  # add applications table + data helpers
├── routers/
│   ├── applications.py          # new application endpoints
│   ├── config.py                # application pipeline config endpoints
│   └── __init__.py              # export new router
├── schemas/
│   ├── models.py                # application record/request/response models
│   └── __init__.py              # re-export schema types
└── main.py                      # include applications router
apps/backend/tests/
└── test_applications_endpoints.py
```

### Pattern 1: Database wrapper owns record lifecycle
**What:** Keep raw TinyDB table access, record creation, lookup, update, and reset behavior inside `Database`.
**When to use:** Whenever new persisted domain objects are introduced.
**Example:**
```python
@property
def applications(self) -> Table:
    return self.db.table("applications")

def create_application(self, payload: dict[str, Any]) -> dict[str, Any]:
    application_id = str(uuid4())
    now = datetime.now(timezone.utc).isoformat()
    doc = {
        "application_id": application_id,
        **payload,
        "created_at": now,
        "updated_at": now,
    }
    self.applications.insert(doc)
    return doc
```

### Pattern 2: Router-level validation with generic client errors
**What:** Resolve linked entities and reject invalid states in the router, while logging detailed failures server-side.
**When to use:** For create/update/status/config endpoints where business rules must be enforced consistently.
**Example:**
```python
if request.job_id and request.job_description:
    raise HTTPException(
        status_code=400,
        detail="Provide either job_id or job_description, not both.",
    )

if request.resume_id and db.get_resume(request.resume_id) is None:
    raise HTTPException(status_code=404, detail="Resume not found.")
```

### Anti-Patterns to Avoid
- **Embedding application config logic in the frontend contract:** status validity and in-use removal checks must stay server-side.
- **Duplicating persistence logic in routers:** direct TinyDB manipulation in route handlers will make status history and defaults drift.
- **Using PATCH for status transitions:** phase decisions explicitly reserve status history writes for the dedicated status endpoint.
</architecture_patterns>

<dont_hand_roll>
## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Config persistence | Separate ad-hoc JSON reader/writer for application settings | Reuse `_load_config()` / `_save_config()` in `routers/config.py` | Existing config cache invalidation and file location logic are already correct |
| Linked record resolution | Frontend-side join logic for list views | Hydrate linked display metadata in `GET /applications` | Dashboard is the main consumer and should not need follow-up fetches |
| Mutable status defaults | Shared module-level list reused across writes | Defensive copy when seeding pipeline statuses | Prevents cross-request mutation bugs explicitly called out in repo guidance |
| Audit history timestamps | Custom string formatting scattered across routes | Reuse UTC ISO timestamp pattern from `database.py` | Keeps records consistent with existing resume/job/improvement data |

**Key insight:** The repo already has stable patterns for storage, config, and error handling. Planning should extend those seams rather than inventing a new backend style for the tracker.
</dont_hand_roll>

<common_pitfalls>
## Common Pitfalls

### Pitfall 1: Status rules drift across endpoints
**What goes wrong:** Create, patch, and status endpoints each validate statuses differently, leading to invalid persisted records or missing history.
**Why it happens:** Validation is spread across multiple route branches with no shared helper.
**How to avoid:** Centralize valid-status lookup, default status selection, and history-entry construction in reusable backend helpers.
**Warning signs:** `POST /applications` and `POST /applications/{id}/status` have separate hard-coded status logic.

### Pitfall 2: Linked-record hydration becomes N+1 chaos in the frontend
**What goes wrong:** Dashboard needs extra client fetches for every row to resolve linked resume/job labels.
**Why it happens:** Backend returns only ids even though list view is the primary consumer.
**How to avoid:** Make `GET /applications` return the fields needed for quick rendering, including light linked metadata.
**Warning signs:** Frontend needs per-row lookups just to render the table.

### Pitfall 3: Config deletion checks ignore existing usage
**What goes wrong:** A status is removed from config while applications still reference it, leaving the tracker in an invalid state.
**Why it happens:** The config endpoint treats the status list as isolated settings rather than coupled data.
**How to avoid:** Compute removed statuses during `PUT /config/applications`, scan application records for matches, and reject with affected records.
**Warning signs:** Config update logic only writes the new status array and never inspects stored applications.
</common_pitfalls>

<code_examples>
## Code Examples

Verified patterns from existing repo sources:

### TinyDB table wrapper
```python
# Source: apps/backend/app/database.py
@property
def jobs(self) -> Table:
    """Job descriptions table."""
    return self.db.table("jobs")
```

### Config persistence helper
```python
# Source: apps/backend/app/routers/config.py
def _save_config(config: dict) -> None:
    path = _get_config_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(config, indent=2))
    invalidate_config_cache()
```

### Generic reset endpoint behavior
```python
# Source: apps/backend/app/routers/config.py
if request.confirm != "RESET_ALL_DATA":
    raise HTTPException(
        status_code=400,
        detail="Confirmation required. Pass confirm=RESET_ALL_DATA in request body.",
    )
db.reset_database()
```
</code_examples>

<sota_updates>
## State of the Art (2024-2025)

What's changed recently:

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Thin id-only APIs with frontend joins | Backend responses shaped for their primary UI consumer | Common across modern product APIs | Returning display-ready application rows is normal and reduces frontend orchestration |
| Mutable shared defaults in Python config modules | Defensive copy of list/dict defaults before mutation | Longstanding best practice, especially with Pydantic v2 era emphasis on explicit state | Seeded application statuses should never share mutable references |
| Auditing through generic `updated_at` only | Event history arrays for user-visible workflow transitions | Standard for lightweight workflow tools | `status_history[]` is the right MVP audit primitive for tracker changes |

**New tools/patterns to consider:**
- Structured linked-display fields in list endpoints: useful when one UI owns the read path
- Router-level domain validation with typed request/response models: good fit for FastAPI and this repo's existing style

**Deprecated/outdated:**
- Silent fallback when linked ids do not exist: should be rejected explicitly
- Frontend-owned status validation: conflicts with backend-owned persisted state
</sota_updates>

<open_questions>
## Open Questions

1. **Exact shape of display-ready linked metadata**
   - What we know: `GET /applications` must be table-ready.
   - What's unclear: exact field names for linked resume/job display blocks.
   - Recommendation: Let planning choose a concise, explicit shape aligned with current API naming, then lock it in implementation/tests.

2. **How much list/query logic belongs in `Database` vs router helper code**
   - What we know: `Database` already owns table access, but current repo has limited list filtering helpers.
   - What's unclear: whether search/filter/sort for applications should live entirely in `Database`.
   - Recommendation: Put record filtering helpers in `Database` if they are reused by multiple routes; keep one-off response hydration in the router layer.
</open_questions>

<sources>
## Sources

### Primary (HIGH confidence)
- `apps/backend/app/database.py` - current TinyDB table, id, timestamp, and reset patterns
- `apps/backend/app/routers/config.py` - persisted config helper pattern and reset endpoint behavior
- `apps/backend/app/main.py` - router registration pattern under `/api/v1`
- `apps/backend/app/routers/__init__.py` - router export conventions
- `apps/backend/app/schemas/models.py` and `apps/backend/app/schemas/__init__.py` - schema organization and re-export pattern

### Secondary (MEDIUM confidence)
- `docs/agent/architecture/backend-architecture.md` - architectural summary of the backend module responsibilities
- `.planning/codebase/ARCHITECTURE.md`, `.planning/codebase/STRUCTURE.md`, `.planning/codebase/CONVENTIONS.md` - repo-specific codebase map and preserved conventions
- `apps/backend/tests/test_regenerate_endpoints.py` - current backend test style and async test patterns

### Tertiary (LOW confidence - needs validation)
- None for this phase
</sources>

<metadata>
## Metadata

**Research scope:**
- Core technology: FastAPI route design, TinyDB record modeling, config-backed workflow state
- Ecosystem: existing repo libraries only
- Patterns: record lifecycle, linked-entity validation, config enforcement, backend test strategy
- Pitfalls: state drift, invalid linked refs, config removal safety

**Confidence breakdown:**
- Standard stack: HIGH - no new external dependencies required
- Architecture: HIGH - directly based on existing backend structure
- Pitfalls: HIGH - derived from explicit phase requirements and current repo patterns
- Code examples: HIGH - taken from current repo files

**Research date:** 2026-03-22
**Valid until:** 2026-04-21
</metadata>

---

*Phase: 01-applications-backend-foundation*
*Research completed: 2026-03-22*
*Ready for planning: yes*
