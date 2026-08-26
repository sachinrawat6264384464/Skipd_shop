import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_mod15_001_trigger_weekly_admin_report_email():
    """Case 001: Trigger 7-day weekly admin performance report HTML email via Gmail SMTP."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post(
            "/api/v1/admin/send-weekly-report",
            json={"admin_email": "sachinrawat6264384464@gmail.com"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "SUCCESS"
        assert "sachinrawat6264384464@gmail.com" in data.get("message", "")
        metrics = data.get("metrics_summary", {})
        assert "weekly_revenue" in metrics
        assert "weekly_orders" in metrics
        assert "weekly_customers" in metrics
