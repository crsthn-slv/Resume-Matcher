import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from fastapi import HTTPException

from app.database import Database
import app.routers.applications as applications_router
import app.routers.config as config_router
from app.schemas import (
    ApplicationConfig,
    CreateApplicationRequest,
    ResetDatabaseRequest,
    UpdateApplicationRequest,
    UpdateApplicationStatusRequest,
)


class TestApplicationEndpoints(unittest.IsolatedAsyncioTestCase):
    def setUp(self) -> None:
        self.temp_dir = tempfile.TemporaryDirectory()
        self.db = Database(Path(self.temp_dir.name) / "test-db.json")
        self.config_store: dict = {}

        def load_config() -> dict:
            return dict(self.config_store)

        def save_config(config: dict) -> None:
            self.config_store.clear()
            self.config_store.update(config)

        self.patches = [
            patch.object(applications_router, "db", self.db),
            patch.object(config_router, "db", self.db),
            patch.object(config_router, "_load_config", side_effect=load_config),
            patch.object(config_router, "_save_config", side_effect=save_config),
        ]
        for active_patch in self.patches:
            active_patch.start()

    def tearDown(self) -> None:
        for active_patch in reversed(self.patches):
            active_patch.stop()
        self.db.close()
        self.temp_dir.cleanup()

    async def test_create_application_manual_without_resume(self) -> None:
        result = await applications_router.create_application(
            CreateApplicationRequest(company="ACME", role="Backend Engineer")
        )

        self.assertEqual(result.company, "ACME")
        self.assertEqual(result.role, "Backend Engineer")
        self.assertEqual(result.status, "Applied")
        self.assertIsNone(result.resume_id)
        self.assertEqual(len(result.status_history), 1)
        self.assertEqual(result.status_history[0].source, "manual_create")

    async def test_create_application_manual_with_resume_id(self) -> None:
        resume = self.db.create_resume(content="{}", content_type="json", filename="resume.json")

        result = await applications_router.create_application(
            CreateApplicationRequest(
                company="ACME",
                role="Platform Engineer",
                resume_id=resume["resume_id"],
            )
        )

        self.assertEqual(result.resume_id, resume["resume_id"])
        self.assertEqual(result.status, "Applied")

    async def test_create_application_with_job_description_creates_job(self) -> None:
        result = await applications_router.create_application(
            CreateApplicationRequest(
                company="ACME",
                role="Data Engineer",
                job_description="Build pipelines",
            )
        )

        self.assertIsNotNone(result.job_id)
        stored_job = self.db.get_job(result.job_id)
        self.assertIsNotNone(stored_job)
        self.assertEqual(stored_job["content"], "Build pipelines")

    async def test_create_application_with_existing_job_id(self) -> None:
        job = self.db.create_job(content="Tailoring JD")

        result = await applications_router.create_application(
            CreateApplicationRequest(
                company="ACME",
                role="ML Engineer",
                job_id=job["job_id"],
            )
        )

        self.assertEqual(result.job_id, job["job_id"])
        self.assertEqual(result.status_history[0].source, "tailor_create")

    async def test_default_status_falls_back_to_first_configured_status(self) -> None:
        self.config_store["application_statuses"] = ["Wishlist", "Interview"]

        result = await applications_router.create_application(
            CreateApplicationRequest(company="ACME", role="Backend Engineer")
        )

        self.assertEqual(result.status, "Wishlist")
        self.assertEqual(result.status_history[0].to_status, "Wishlist")

    async def test_status_change_appends_history(self) -> None:
        created = await applications_router.create_application(
            CreateApplicationRequest(company="ACME", role="Engineer")
        )

        updated = await applications_router.update_application_status(
            created.application_id,
            UpdateApplicationStatusRequest(status="Interview"),
        )

        self.assertEqual(updated.status, "Interview")
        self.assertEqual(len(updated.status_history), 2)
        self.assertEqual(updated.status_history[-1].from_status, "Applied")
        self.assertEqual(updated.status_history[-1].to_status, "Interview")
        self.assertEqual(updated.status_history[-1].source, "status_change")

    async def test_patch_does_not_append_history(self) -> None:
        created = await applications_router.create_application(
            CreateApplicationRequest(company="ACME", role="Engineer")
        )

        updated = await applications_router.update_application(
            created.application_id,
            UpdateApplicationRequest(notes="Reached out"),
        )

        self.assertEqual(updated.notes, "Reached out")
        self.assertEqual(len(updated.status_history), 1)
        self.assertEqual(updated.status_history[0].source, "manual_create")

    async def test_invalid_status_is_rejected(self) -> None:
        self.config_store["application_statuses"] = ["Wishlist"]

        with self.assertRaises(HTTPException) as context:
            await applications_router.create_application(
                CreateApplicationRequest(company="ACME", role="Engineer", status="Applied")
            )

        self.assertEqual(context.exception.status_code, 400)
        self.assertIn("Invalid application status", str(context.exception.detail))

    async def test_invalid_status_change_is_rejected(self) -> None:
        created = await applications_router.create_application(
            CreateApplicationRequest(company="ACME", role="Engineer")
        )
        self.config_store["application_statuses"] = ["Applied", "Interview"]

        with self.assertRaises(HTTPException) as context:
            await applications_router.update_application_status(
                created.application_id,
                UpdateApplicationStatusRequest(status="Offer"),
            )

        self.assertEqual(context.exception.status_code, 400)
        self.assertIn("Invalid application status", str(context.exception.detail))

    async def test_remove_status_in_use_is_rejected(self) -> None:
        await applications_router.create_application(
            CreateApplicationRequest(company="ACME", role="Engineer")
        )

        with self.assertRaises(HTTPException) as context:
            await config_router.update_applications_config(
                ApplicationConfig(statuses=["Interview", "Offer"])
            )

        self.assertEqual(context.exception.status_code, 400)
        detail = context.exception.detail
        self.assertIn("affected_applications", detail)
        self.assertEqual(detail["affected_applications"][0]["status"], "Applied")

    async def test_reset_database_clears_applications(self) -> None:
        await applications_router.create_application(
            CreateApplicationRequest(company="ACME", role="Engineer")
        )
        self.assertEqual(len(self.db.list_applications()), 1)

        await config_router.reset_database_endpoint(ResetDatabaseRequest(confirm="RESET_ALL_DATA"))

        self.assertEqual(self.db.list_applications(), [])

    async def test_search_matches_company_and_role(self) -> None:
        await applications_router.create_application(
            CreateApplicationRequest(company="ACME", role="Backend Engineer")
        )
        await applications_router.create_application(
            CreateApplicationRequest(company="Globex", role="Frontend Developer")
        )

        by_company = await applications_router.list_applications(q="acme")
        by_role = await applications_router.list_applications(q="frontend")

        self.assertEqual(len(by_company.items), 1)
        self.assertEqual(by_company.items[0].company, "ACME")
        self.assertEqual(len(by_role.items), 1)
        self.assertEqual(by_role.items[0].role, "Frontend Developer")

    async def test_multi_status_filter(self) -> None:
        first = await applications_router.create_application(
            CreateApplicationRequest(company="ACME", role="Engineer")
        )
        second = await applications_router.create_application(
            CreateApplicationRequest(company="Globex", role="Manager", status="Wishlist")
        )
        await applications_router.update_application_status(
            first.application_id,
            UpdateApplicationStatusRequest(status="Interview"),
        )

        filtered = await applications_router.list_applications(status="Interview,Wishlist")

        returned_ids = {item.application_id for item in filtered.items}
        self.assertEqual(returned_ids, {first.application_id, second.application_id})
