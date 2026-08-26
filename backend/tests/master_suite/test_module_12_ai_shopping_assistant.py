import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_mod12_001_initial_query_with_followup_question():
    """Case 001: Initial query returns products and interactive follow-up question."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post(
            "/api/v1/chatbot/recommend",
            json={"user_message": "I need a good gaming headset under 3000"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "response_text" in data
        assert len(data.get("products", [])) > 0
        assert "suggested_actions" in data


@pytest.mark.asyncio
async def test_mod12_002_multi_turn_feature_refinement():
    """Case 002: Multi-turn refinement (e.g. 'battery') uses history context."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        history = [
            {"role": "user", "content": "I need a good gaming headset under 3000"},
            {"role": "assistant", "content": "I found options! Do you care more about sound or battery life?"}
        ]
        response = await ac.post(
            "/api/v1/chatbot/recommend",
            json={
                "user_message": "Battery",
                "conversation_history": history
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "battery" in data.get("response_text", "").lower()


@pytest.mark.asyncio
async def test_mod12_003_cheaper_options_filter():
    """Case 003: Multi-turn prompt 'Show me cheaper ones' sorts by price ascending."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        history = [
            {"role": "user", "content": "I need a good gaming headset under 3000"}
        ]
        response = await ac.post(
            "/api/v1/chatbot/recommend",
            json={
                "user_message": "Show me cheaper ones",
                "conversation_history": history
            }
        )
        assert response.status_code == 200
        data = response.json()
        products = data.get("products", [])
        assert len(products) > 0
        if len(products) > 1:
            assert products[0]["price"] <= products[1]["price"]


@pytest.mark.asyncio
async def test_mod12_004_comparison_engine():
    """Case 004: Multi-turn comparison prompt 'Compare these two' triggers comparison engine."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        history = [
            {"role": "user", "content": "I need a good gaming headset under 3000"}
        ]
        response = await ac.post(
            "/api/v1/chatbot/recommend",
            json={
                "user_message": "Compare these two",
                "conversation_history": history
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "Comparison" in data.get("response_text", "") or "comparison" in data.get("response_text", "").lower()


@pytest.mark.asyncio
async def test_mod12_005_best_rating_sort():
    """Case 005: Prompt 'Which has the best rating?' returns top rated choice."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        history = [
            {"role": "user", "content": "I need a good gaming headset under 3000"}
        ]
        response = await ac.post(
            "/api/v1/chatbot/recommend",
            json={
                "user_message": "Which has the best rating?",
                "conversation_history": history
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "Highest Rated" in data.get("response_text", "") or "rating" in data.get("response_text", "").lower()
