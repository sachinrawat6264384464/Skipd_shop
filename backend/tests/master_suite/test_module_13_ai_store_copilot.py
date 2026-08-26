import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_mod13_001_store_health_query():
    """Case 001: Query 'How is my store doing?' returns store health overview."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post(
            "/api/v1/admin/copilot/query",
            json={"query": "How is my store doing?"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "copilot_response" in data
        assert "metrics_summary font" not in data
        assert "insights" in data
        assert len(data.get("insights", [])) > 0


@pytest.mark.asyncio
async def test_mod13_002_recommendations_query():
    """Case 002: Query 'What should I do?' returns actionable merchant recommendations."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post(
            "/api/v1/admin/copilot/query",
            json={"query": "What should I do?"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "copilot_response" in data
        assert "Recommendation" in data.get("copilot_response", "") or "recommend" in data.get("copilot_response", "").lower()
        actions = data.get("recommended_actions", [])
        assert len(actions) > 0


@pytest.mark.asyncio
async def test_mod13_003_stock_audit_query():
    """Case 003: Query 'Show low stock items' returns stock audit diagnostics."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post(
            "/api/v1/admin/copilot/query",
            json={"query": "Show low stock items"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "copilot_response" in data
        assert "Stock" in data.get("copilot_response", "") or "stock" in data.get("copilot_response", "").lower()
