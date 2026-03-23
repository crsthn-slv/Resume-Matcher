"""Application tracking endpoints."""

import logging
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException

from app.database import db
from app.schemas import (
    ApplicationListItem,
    ApplicationListResponse,
    ApplicationRecord,
    ApplicationStatusHistoryEntry,
    CreateApplicationRequest,
    UpdateApplicationRequest,
    UpdateApplicationStatusRequest,
)
from app.routers.config import get_application_statuses

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/applications", tags=["Applications"])


def _get_default_status(statuses: list[str]) -> str:
    """Resolve the default status for newly created applications."""
    if "Applied" in statuses:
        return "Applied"
    return statuses[0]


def _ensure_status_allowed(status: str, statuses: list[str]) -> None:
    """Validate that a status exists in the current pipeline."""
    if status not in statuses:
        raise HTTPException(status_code=400, detail=f"Invalid application status: {status}")


def _build_status_history_entry(
    from_status: str | None,
    to_status: str,
    source: str,
    changed_at: str,
) -> dict[str, str | None]:
    """Build a status history entry payload."""
    return {
        "from_status": from_status,
        "to_status": to_status,
        "changed_at": changed_at,
        "source": source,
    }


def _ensure_resume_exists(resume_id: str | None) -> None:
    """Validate that a resume reference exists when provided."""
    if resume_id and db.get_resume(resume_id) is None:
        raise HTTPException(status_code=404, detail="Resume not found")


def _ensure_job_exists(job_id: str | None) -> None:
    """Validate that a job reference exists when provided."""
    if job_id and db.get_job(job_id) is None:
        raise HTTPException(status_code=404, detail="Job not found")


def _to_application_record(doc: dict) -> ApplicationRecord:
    """Normalize a raw database document into an application record."""
    return ApplicationRecord.model_validate(doc)


def _to_application_list_item(doc: dict) -> ApplicationListItem:
    """Hydrate an application into a display-ready list item."""
    resume = db.get_resume(doc.get("resume_id")) if doc.get("resume_id") else None
    job = db.get_job(doc.get("job_id")) if doc.get("job_id") else None

    return ApplicationListItem(
        application_id=doc["application_id"],
        company=doc["company"],
        role=doc["role"],
        status=doc["status"],
        job_url=doc.get("job_url"),
        notes=doc.get("notes"),
        resume_id=doc.get("resume_id"),
        resume_title=(resume or {}).get("title") or (resume or {}).get("filename"),
        job_id=doc.get("job_id"),
        has_job_description=bool((job or {}).get("content")),
        status_history=[
            ApplicationStatusHistoryEntry.model_validate(entry)
            for entry in doc.get("status_history", [])
        ],
        created_at=doc["created_at"],
        updated_at=doc["updated_at"],
    )


@router.get("", response_model=ApplicationListResponse)
async def list_applications(
    q: str | None = None,
    status: str | None = None,
) -> ApplicationListResponse:
    """List applications for the dashboard table."""
    items = db.list_applications()

    if q:
        needle = q.strip().casefold()
        items = [
            item
            for item in items
            if needle in item.get("company", "").casefold()
            or needle in item.get("role", "").casefold()
        ]

    if status:
        allowed_statuses = {value.strip() for value in status.split(",") if value.strip()}
        items = [item for item in items if item.get("status") in allowed_statuses]

    items.sort(key=lambda item: item.get("updated_at", ""), reverse=True)
    return ApplicationListResponse(items=[_to_application_list_item(item) for item in items])


@router.post("", response_model=ApplicationRecord)
async def create_application(request: CreateApplicationRequest) -> ApplicationRecord:
    """Create a new application record."""
    if request.job_id and request.job_description:
        raise HTTPException(
            status_code=400,
            detail="Provide either job_id or job_description, not both.",
        )

    _ensure_resume_exists(request.resume_id)
    _ensure_job_exists(request.job_id)

    statuses = get_application_statuses()
    resolved_status = request.status or _get_default_status(statuses)
    _ensure_status_allowed(resolved_status, statuses)

    job_id = request.job_id
    source = "tailor_create" if request.job_id else "manual_create"
    if request.job_description:
        created_job = db.create_job(content=request.job_description.strip(), resume_id=request.resume_id)
        job_id = created_job["job_id"]

    application = db.create_application(
        company=request.company.strip(),
        role=request.role.strip(),
        status=resolved_status,
        job_url=request.job_url,
        notes=request.notes,
        resume_id=request.resume_id,
        job_id=job_id,
    )

    initial_history = _build_status_history_entry(
        from_status=None,
        to_status=resolved_status,
        source=source,
        changed_at=application["created_at"],
    )
    application = db.update_application(
        application["application_id"],
        {"status_history": [initial_history]},
    )
    return _to_application_record(application)


@router.get("/{id}", response_model=ApplicationRecord)
async def get_application(id: str) -> ApplicationRecord:
    """Get an application by ID."""
    application = db.get_application(id)
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    return _to_application_record(application)


@router.patch("/{id}", response_model=ApplicationRecord)
async def update_application(id: str, request: UpdateApplicationRequest) -> ApplicationRecord:
    """Update application metadata without mutating status history."""
    application = db.get_application(id)
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    _ensure_resume_exists(request.resume_id)
    _ensure_job_exists(request.job_id)

    updates = request.model_dump(exclude_none=True)
    if "status" in updates:
        logger.warning("Ignoring unexpected status update in metadata patch for %s", id)
        updates.pop("status", None)

    updated = db.update_application(id, updates)
    return _to_application_record(updated)


@router.post("/{id}/status", response_model=ApplicationRecord)
async def update_application_status(
    id: str,
    request: UpdateApplicationStatusRequest,
) -> ApplicationRecord:
    """Change application status and append history."""
    application = db.get_application(id)
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    statuses = get_application_statuses()
    _ensure_status_allowed(request.status, statuses)

    history = list(application.get("status_history", []))
    changed_at = datetime.now(timezone.utc).isoformat()
    history.append(
        _build_status_history_entry(
            from_status=application.get("status"),
            to_status=request.status,
            source="status_change",
            changed_at=changed_at,
        )
    )

    updated = db.update_application(
        id,
        {
            "status": request.status,
            "status_history": history,
        },
    )
    return _to_application_record(updated)
