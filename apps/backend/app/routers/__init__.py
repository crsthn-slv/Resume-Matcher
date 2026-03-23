"""API router exports."""

from importlib import import_module
from typing import Final

_ROUTER_MODULES: Final[dict[str, str]] = {
    "applications_router": "applications",
    "config_router": "config",
    "enrichment_router": "enrichment",
    "health_router": "health",
    "jobs_router": "jobs",
    "resumes_router": "resumes",
}

__all__ = list(_ROUTER_MODULES)


def __getattr__(name: str):
    """Lazily resolve router exports to avoid importing every router eagerly."""
    module_name = _ROUTER_MODULES.get(name)
    if module_name is None:
        raise AttributeError(f"module {__name__!r} has no attribute {name!r}")

    module = import_module(f"app.routers.{module_name}")
    return module.router
