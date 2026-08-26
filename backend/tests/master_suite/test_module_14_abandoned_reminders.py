import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_mod14_001_abandoned_reminder_active_unauthorized():
    """Case 001: Active abandoned reminder endpoint requires authentication."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/abandoned-reminders/active")
        assert response.status_code == 401


@pytest.mark.asyncio
async def test_mod14_002_remove_abandoned_item_unauthorized():
    """Case 002: Remove abandoned item endpoint requires authentication."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.request(
            "DELETE",
            "/api/v1/abandoned-reminders/remove",
            json={"item_id": 1, "item_type": "wishlist"}
        )
        assert response.status_code == 401
