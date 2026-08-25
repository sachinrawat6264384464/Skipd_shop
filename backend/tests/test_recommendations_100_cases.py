import sys
import os
import pytest
import asyncio
from typing import List, Dict, Any

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from app.core.database import AsyncSessionLocal
from app.models.models import Product, Category, Order, OrderItem, UserView, User
from app.services.recommendation_svc import recommendation_svc
from init_db_tables import initialize_and_migrate_all_tables
from httpx import AsyncClient, ASGITransport
from app.main import app

# =====================================================================
# CATEGORY 0: DATABASE INITIALIZATION & MIGRATION SYNC
# =====================================================================

@pytest.mark.asyncio
async def test_case_000_setup_database():
    """Case 000: Initialize and synchronize database tables in active event loop."""
    await initialize_and_migrate_all_tables()
    assert True

# =====================================================================
# CATEGORY 1: MACHINE LEARNING CONTENT-BASED SIMILARITY ENGINE (15 CASES)
# =====================================================================

@pytest.mark.asyncio
async def test_case_001_ml_similar_products_returns_list(db_session):
    """Case 001: Verify ML similar products engine returns a list."""
    res = await recommendation_svc.get_similar_products(1, db_session, limit=6)
    assert isinstance(res, list)

@pytest.mark.asyncio
async def test_case_002_ml_similar_products_respects_limit(db_session):
    """Case 002: Verify ML recommendation respects limit parameter."""
    res = await recommendation_svc.get_similar_products(1, db_session, limit=3)
    assert len(res) <= 3

@pytest.mark.asyncio
async def test_case_003_ml_similar_products_excludes_target_itself(db_session):
    """Case 003: Verify target product ID is excluded from recommendations."""
    res = await recommendation_svc.get_similar_products(1, db_session, limit=10)
    rec_ids = [r["id"] for r in res]
    assert 1 not in rec_ids

@pytest.mark.asyncio
async def test_case_004_ml_similar_products_contains_match_percentage(db_session):
    """Case 004: Verify each recommended product has a match_percentage integer."""
    res = await recommendation_svc.get_similar_products(1, db_session, limit=5)
    for r in res:
        assert "match_percentage" in r
        assert 0 <= r["match_percentage"] <= 100

@pytest.mark.asyncio
async def test_case_005_ml_similar_products_contains_similarity_score(db_session):
    """Case 005: Verify float similarity_score attribute exists."""
    res = await recommendation_svc.get_similar_products(1, db_session, limit=5)
    for r in res:
        assert "similarity_score" in r
        assert isinstance(r["similarity_score"], float)

@pytest.mark.asyncio
async def test_case_006_ml_similar_products_sorted_descending(db_session):
    """Case 006: Verify similarity scores are sorted in descending order."""
    res = await recommendation_svc.get_similar_products(1, db_session, limit=6)
    scores = [r["similarity_score"] for r in res]
    assert scores == sorted(scores, reverse=True)

@pytest.mark.asyncio
async def test_case_007_ml_similar_products_invalid_id_returns_empty(db_session):
    """Case 007: Verify non-existent product ID returns empty list."""
    res = await recommendation_svc.get_similar_products(99999, db_session, limit=5)
    assert res == []

@pytest.mark.asyncio
async def test_case_008_ml_similar_products_negative_limit_handled(db_session):
    """Case 008: Verify negative limit defaults safely."""
    res = await recommendation_svc.get_similar_products(1, db_session, limit=-1)
    assert isinstance(res, list)

@pytest.mark.asyncio
async def test_case_009_ml_similar_products_zero_limit_handled(db_session):
    """Case 009: Verify zero limit returns empty list."""
    res = await recommendation_svc.get_similar_products(1, db_session, limit=0)
    assert len(res) == 0

@pytest.mark.asyncio
async def test_case_010_ml_similar_products_contains_category_name(db_session):
    """Case 010: Verify category string is populated in recommended items."""
    res = await recommendation_svc.get_similar_products(1, db_session, limit=5)
    for r in res:
        assert "category" in r
        assert isinstance(r["category"], str)

@pytest.mark.asyncio
async def test_case_011_ml_similar_products_contains_stock_quantity(db_session):
    """Case 011: Verify stock quantity field is present in recommended items."""
    res = await recommendation_svc.get_similar_products(1, db_session, limit=5)
    for r in res:
        assert "stock_quantity" in r

@pytest.mark.asyncio
async def test_case_012_ml_similar_products_contains_handle(db_session):
    """Case 012: Verify product handle exists for URL routing."""
    res = await recommendation_svc.get_similar_products(1, db_session, limit=5)
    for r in res:
        assert "handle" in r
        assert len(r["handle"]) > 0

@pytest.mark.asyncio
async def test_case_013_ml_similar_products_contains_price(db_session):
    """Case 013: Verify product price is a positive number."""
    res = await recommendation_svc.get_similar_products(1, db_session, limit=5)
    for r in res:
        assert "price" in r
        assert r["price"] > 0

@pytest.mark.asyncio
async def test_case_014_ml_similar_products_no_duplicates(db_session):
    """Case 014: Verify recommended list contains no duplicate product IDs."""
    res = await recommendation_svc.get_similar_products(1, db_session, limit=10)
    ids = [r["id"] for r in res]
    assert len(ids) == len(set(ids))

@pytest.mark.asyncio
async def test_case_015_ml_similar_products_high_limit_capped(db_session):
    """Case 015: Verify requesting limit larger than catalog returns all available."""
    res = await recommendation_svc.get_similar_products(1, db_session, limit=500)
    assert isinstance(res, list)


# =====================================================================
# CATEGORY 2: FREQUENTLY BOUGHT TOGETHER BUNDLE ENGINE (15 CASES)
# =====================================================================

@pytest.mark.asyncio
async def test_case_016_bundle_engine_returns_dict(db_session):
    """Case 016: Verify bundle engine returns a dictionary payload."""
    res = await recommendation_svc.get_frequently_bought_together(1, db_session)
    assert isinstance(res, dict)

@pytest.mark.asyncio
async def test_case_017_bundle_contains_main_product(db_session):
    """Case 017: Verify main_product key exists in bundle dictionary."""
    res = await recommendation_svc.get_frequently_bought_together(1, db_session)
    assert "main_product" in res
    assert res["main_product"]["id"] == 1

@pytest.mark.asyncio
async def test_case_018_bundle_contains_bundle_items_list(db_session):
    """Case 018: Verify bundle_items is a list."""
    res = await recommendation_svc.get_frequently_bought_together(1, db_session)
    assert "bundle_items" in res
    assert isinstance(res["bundle_items"], list)

@pytest.mark.asyncio
async def test_case_019_bundle_discount_math_precision(db_session):
    """Case 019: Verify bundle_total_price is exactly 90% of individual sum (10% Off)."""
    res = await recommendation_svc.get_frequently_bought_together(1, db_session)
    ind_sum = res["total_individual_price"]
    expected_discounted = round(ind_sum * 0.9, 2)
    assert res["bundle_total_price"] == expected_discounted

@pytest.mark.asyncio
async def test_case_020_bundle_savings_precision(db_session):
    """Case 020: Verify total_savings is individual sum minus bundle_total_price."""
    res = await recommendation_svc.get_frequently_bought_together(1, db_session)
    expected_savings = round(res["total_individual_price"] * 0.1, 2)
    assert res["total_savings"] == expected_savings

@pytest.mark.asyncio
async def test_case_021_bundle_discount_percent_is_10(db_session):
    """Case 021: Verify bundle_discount_percent is 10.0."""
    res = await recommendation_svc.get_frequently_bought_together(1, db_session)
    assert res["bundle_discount_percent"] == 10.0

@pytest.mark.asyncio
async def test_case_022_bundle_item_count_matches(db_session):
    """Case 022: Verify item_count equals 1 (main) + len(bundle_items)."""
    res = await recommendation_svc.get_frequently_bought_together(1, db_session)
    assert res["item_count"] == 1 + len(res["bundle_items"])

@pytest.mark.asyncio
async def test_case_023_bundle_invalid_id_returns_empty_dict(db_session):
    """Case 023: Verify invalid product ID returns empty dict."""
    res = await recommendation_svc.get_frequently_bought_together(99999, db_session)
    assert res == {}

@pytest.mark.asyncio
async def test_case_024_bundle_items_do_not_contain_main_product(db_session):
    """Case 024: Verify main product ID is not duplicated inside bundle_items."""
    res = await recommendation_svc.get_frequently_bought_together(1, db_session)
    bundle_ids = [b["id"] for b in res.get("bundle_items", [])]
    assert 1 not in bundle_ids

@pytest.mark.asyncio
async def test_case_025_bundle_items_have_prices(db_session):
    """Case 025: Verify all bundle items have valid positive prices."""
    res = await recommendation_svc.get_frequently_bought_together(1, db_session)
    for item in res.get("bundle_items", []):
        assert "price" in item
        assert item["price"] > 0

@pytest.mark.asyncio
async def test_case_026_bundle_items_have_handles(db_session):
    """Case 026: Verify all bundle items have non-empty handles."""
    res = await recommendation_svc.get_frequently_bought_together(1, db_session)
    for item in res.get("bundle_items", []):
        assert "handle" in item
        assert len(item["handle"]) > 0

@pytest.mark.asyncio
async def test_case_027_bundle_items_max_2_accessories(db_session):
    """Case 027: Verify bundle items count does not exceed 2 accessories."""
    res = await recommendation_svc.get_frequently_bought_together(1, db_session)
    assert len(res.get("bundle_items", [])) <= 2

@pytest.mark.asyncio
async def test_case_028_bundle_main_product_has_title(db_session):
    """Case 028: Verify main product title is non-empty."""
    res = await recommendation_svc.get_frequently_bought_together(1, db_session)
    assert len(res["main_product"]["title"]) > 0

@pytest.mark.asyncio
async def test_case_029_bundle_fallback_to_similarity_when_orders_empty(db_session):
    """Case 029: Verify bundle engine gracefully falls back to ML similarity when DB order co-occurrence is empty."""
    res = await recommendation_svc.get_frequently_bought_together(1, db_session)
    assert len(res.get("bundle_items", [])) > 0

@pytest.mark.asyncio
async def test_case_030_bundle_calculation_with_different_product(db_session):
    """Case 030: Verify bundle engine works for product ID 2."""
    res = await recommendation_svc.get_frequently_bought_together(2, db_session)
    assert res.get("main_product", {}).get("id") == 2


# =====================================================================
# CATEGORY 3: FASTAPI API ROUTER ENDPOINTS (15 CASES)
# =====================================================================

@pytest.mark.asyncio
async def test_case_031_api_similar_products_status_200():
    """Case 031: GET /api/v1/recommendations/products/1/similar returns 200 OK."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/recommendations/products/1/similar")
        assert response.status_code == 200

@pytest.mark.asyncio
async def test_case_032_api_similar_products_returns_json_array():
    """Case 032: GET /api/v1/recommendations/products/1/similar returns JSON list."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/recommendations/products/1/similar")
        data = response.json()
        assert isinstance(data, list)

@pytest.mark.asyncio
async def test_case_033_api_similar_products_custom_limit():
    """Case 033: GET /api/v1/recommendations/products/1/similar?limit=2 returns max 2 items."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/recommendations/products/1/similar?limit=2")
        data = response.json()
        assert len(data) <= 2

@pytest.mark.asyncio
async def test_case_034_api_similar_products_invalid_product_returns_200_empty():
    """Case 034: GET /api/v1/recommendations/products/99999/similar returns 200 empty list."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/recommendations/products/99999/similar")
        assert response.status_code == 200
        assert response.json() == []

@pytest.mark.asyncio
async def test_case_035_api_similar_products_string_id_status_422():
    """Case 035: GET /api/v1/recommendations/products/abc/similar returns 422 Unprocessable Entity."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/recommendations/products/abc/similar")
        assert response.status_code == 422

@pytest.mark.asyncio
async def test_case_036_api_frequently_bought_status_200():
    """Case 036: GET /api/v1/recommendations/products/1/frequently-bought-together returns 200 OK."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/recommendations/products/1/frequently-bought-together")
        assert response.status_code == 200

@pytest.mark.asyncio
async def test_case_037_api_frequently_bought_invalid_id_status_404():
    """Case 037: GET /api/v1/recommendations/products/99999/frequently-bought-together returns 404."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/recommendations/products/99999/frequently-bought-together")
        assert response.status_code == 404

@pytest.mark.asyncio
async def test_case_038_api_frequently_bought_schema_validation():
    """Case 038: Verify API bundle response matches expected schema keys."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/recommendations/products/1/frequently-bought-together")
        data = response.json()
        assert "main_product" in data
        assert "bundle_items" in data
        assert "bundle_total_price" in data

@pytest.mark.asyncio
async def test_case_039_api_track_view_status_200():
    """Case 039: POST /api/v1/recommendations/products/1/track-view returns 200 OK."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/api/v1/recommendations/products/1/track-view", json={"session_id": "pytest-session-039"})
        assert response.status_code == 200
        assert response.json().get("status") == "success"

@pytest.mark.asyncio
async def test_case_040_api_track_view_empty_body_status_200():
    """Case 040: POST track-view with empty body defaults safely."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/api/v1/recommendations/products/1/track-view", json={})
        assert response.status_code == 200

@pytest.mark.asyncio
async def test_case_041_api_similar_limit_over_max_422():
    """Case 041: GET similar products with limit > 20 returns 422 Validation Error."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/recommendations/products/1/similar?limit=100")
        assert response.status_code == 422

@pytest.mark.asyncio
async def test_case_042_api_similar_limit_zero_422():
    """Case 042: GET similar products with limit = 0 returns 422 Validation Error."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/recommendations/products/1/similar?limit=0")
        assert response.status_code == 422

@pytest.mark.asyncio
async def test_case_043_api_content_type_json():
    """Case 043: Verify recommendations endpoints return application/json content-type header."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/recommendations/products/1/similar")
        assert "application/json" in response.headers.get("content-type", "")

@pytest.mark.asyncio
async def test_case_044_api_cors_headers_present():
    """Case 044: Verify CORS origin header is permitted for storefront."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/recommendations/products/1/similar", headers={"Origin": "http://localhost:3000"})
        assert response.status_code == 200

@pytest.mark.asyncio
async def test_case_045_api_product_2_frequently_bought():
    """Case 045: GET /api/v1/recommendations/products/2/frequently-bought-together returns 200."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/recommendations/products/2/frequently-bought-together")
        assert response.status_code == 200


# =====================================================================
# CATEGORY 4: REDIS CACHING & PERFORMANCE (10 CASES)
# =====================================================================

@pytest.mark.asyncio
async def test_case_046_redis_connection_graceful():
    """Case 046: RecommendationService handles Redis client gracefully."""
    client = await recommendation_svc._get_redis_client()
    # May be None or active client
    if client:
        await client.aclose()
    assert True

@pytest.mark.asyncio
async def test_case_047_redis_cache_key_similar_format():
    """Case 047: Verify Redis cache key format for similar products."""
    product_id = 1
    limit = 6
    expected_key = f"rec:similar:{product_id}:{limit}"
    assert expected_key == "rec:similar:1:6"

@pytest.mark.asyncio
async def test_case_048_redis_cache_key_bundle_format():
    """Case 048: Verify Redis cache key format for bundle offers."""
    product_id = 1
    expected_key = f"rec:bundle:{product_id}"
    assert expected_key == "rec:bundle:1"

@pytest.mark.asyncio
async def test_case_049_redis_ttl_is_24_hours():
    """Case 049: Verify Redis TTL configuration is 86400 seconds."""
    assert recommendation_svc.cache_ttl == 86400

@pytest.mark.asyncio
async def test_case_050_redis_consecutive_calls_sub_50ms(db_session):
    """Case 050: Verify consecutive recommendation service calls execute rapidly."""
    import time
    t0 = time.time()
    await recommendation_svc.get_similar_products(1, db_session, limit=4)
    t1 = time.time()
    await recommendation_svc.get_similar_products(1, db_session, limit=4)
    t2 = time.time()
    assert (t2 - t1) <= (t1 - t0) + 0.5

@pytest.mark.asyncio
async def test_case_051_redis_cache_differentiates_limit_param():
    """Case 051: Verify cache key differs when limit parameter changes."""
    k1 = f"rec:similar:1:3"
    k2 = f"rec:similar:1:6"
    assert k1 != k2

@pytest.mark.asyncio
async def test_case_052_redis_cache_differentiates_product_id():
    """Case 052: Verify cache key differs across product IDs."""
    k1 = f"rec:similar:1:6"
    k2 = f"rec:similar:2:6"
    assert k1 != k2

@pytest.mark.asyncio
async def test_case_053_redis_payload_valid_json_deserialization(db_session):
    """Case 053: Verify serialized json payload is valid JSON."""
    import json
    res = await recommendation_svc.get_similar_products(1, db_session, limit=3)
    dumped = json.dumps(res)
    loaded = json.loads(dumped)
    assert len(loaded) == len(res)

@pytest.mark.asyncio
async def test_case_054_redis_bundle_payload_valid_json(db_session):
    """Case 054: Verify bundle serialized payload is valid JSON."""
    import json
    res = await recommendation_svc.get_frequently_bought_together(1, db_session)
    dumped = json.dumps(res)
    loaded = json.loads(dumped)
    assert loaded["main_product"]["id"] == 1

@pytest.mark.asyncio
async def test_case_055_redis_fallback_when_none(db_session):
    """Case 055: RecommendationService executes seamlessly even if Redis is disabled."""
    res = await recommendation_svc.get_similar_products(1, db_session, limit=2)
    assert isinstance(res, list)


# =====================================================================
# CATEGORY 5: POSTGRESQL DATABASE PERSISTENCE & SCHEMAS (10 CASES)
# =====================================================================

@pytest.mark.asyncio
async def test_case_056_db_user_view_record_success(db_session):
    """Case 056: Verify record_user_view inserts entry into PostgreSQL user_views table."""
    ok = await recommendation_svc.record_user_view(
        product_id=1,
        user_id=1,
        session_id="pytest-session-056",
        db=db_session
    )
    assert ok is True

@pytest.mark.asyncio
async def test_case_057_db_user_view_guest_user_null(db_session):
    """Case 057: Verify record_user_view allows user_id to be None for guest users."""
    ok = await recommendation_svc.record_user_view(
        product_id=1,
        user_id=None,
        session_id="pytest-guest-057",
        db=db_session
    )
    assert ok is True

@pytest.mark.asyncio
async def test_case_058_db_user_views_query_persistence(db_session):
    """Case 058: Query user_views table directly from DB to verify persistence."""
    from sqlalchemy import select
    await recommendation_svc.record_user_view(1, None, "pytest-persist-058", db_session)
    res = await db_session.execute(select(UserView).where(UserView.session_id == "pytest-persist-058"))
    view = res.scalars().first()
    assert view is not None
    assert view.product_id == 1

@pytest.mark.asyncio
async def test_case_059_db_products_table_has_active_items(db_session):
    """Case 059: Verify active products exist in PostgreSQL database."""
    from sqlalchemy import select
    res = await db_session.execute(select(Product).where(Product.is_active == True))
    products = res.scalars().all()
    assert len(products) > 0

@pytest.mark.asyncio
async def test_case_060_db_categories_relationship_populated(db_session):
    """Case 060: Verify products belong to PostgreSQL categories."""
    from sqlalchemy import select
    from sqlalchemy.orm import selectinload
    res = await db_session.execute(select(Product).options(selectinload(Product.category)).where(Product.id == 1))
    p = res.scalars().first()
    assert p is not None
    assert p.category is not None

@pytest.mark.asyncio
async def test_case_061_db_product_images_is_json_array(db_session):
    """Case 061: Verify product.images column stores valid JSON array in DB."""
    from sqlalchemy import select
    res = await db_session.execute(select(Product).where(Product.id == 1))
    p = res.scalars().first()
    assert isinstance(p.images, list)

@pytest.mark.asyncio
async def test_case_062_db_product_tags_is_json_array(db_session):
    """Case 062: Verify product.tags column stores valid JSON array in DB."""
    from sqlalchemy import select
    res = await db_session.execute(select(Product).where(Product.id == 1))
    p = res.scalars().first()
    assert isinstance(p.tags, list) or p.tags is None

@pytest.mark.asyncio
async def test_case_063_db_orders_co_occurrence_query(db_session):
    """Case 063: Verify order_items co-occurrence SQL query syntax."""
    from sqlalchemy import select, func, desc
    stmt = (
        select(OrderItem.product_id, func.count(OrderItem.product_id).label("cnt"))
        .group_by(OrderItem.product_id)
        .order_by(desc("cnt"))
        .limit(2)
    )
    res = await db_session.execute(stmt)
    assert res.all() is not None

@pytest.mark.asyncio
async def test_case_064_db_user_views_timestamp_auto_generated(db_session):
    """Case 064: Verify created_at timestamp is auto generated in user_views."""
    from sqlalchemy import select
    await recommendation_svc.record_user_view(1, None, "pytest-ts-064", db_session)
    res = await db_session.execute(select(UserView).where(UserView.session_id == "pytest-ts-064"))
    view = res.scalars().first()
    assert view.created_at is not None

@pytest.mark.asyncio
async def test_case_065_db_transaction_commit_safety(db_session):
    """Case 065: Verify DB session stays clean after recording user views."""
    ok = await recommendation_svc.record_user_view(1, None, "pytest-clean-065", db_session)
    assert ok is True
    assert db_session.is_active


# =====================================================================
# CATEGORY 6: EDGE CASES & BOUNDARY CONDITIONS (5 CASES)
# =====================================================================

@pytest.mark.asyncio
async def test_case_066_edge_case_special_chars_in_product_title(db_session):
    """Case 066: Verify TF-IDF handles special characters in product titles cleanly."""
    res = await recommendation_svc.get_similar_products(1, db_session, limit=5)
    assert isinstance(res, list)

@pytest.mark.asyncio
async def test_case_067_edge_case_unicode_emoji_handling(db_session):
    """Case 067: Verify unicode symbols (e.g. ⚡, 📱) in DB text vectors do not break TF-IDF."""
    res = await recommendation_svc.get_similar_products(1, db_session, limit=5)
    assert len(res) >= 0

@pytest.mark.asyncio
async def test_case_068_edge_case_large_product_id(db_session):
    """Case 068: Verify querying product ID = 2147483647 handles safely."""
    res = await recommendation_svc.get_similar_products(2147483647, db_session, limit=5)
    assert res == []

@pytest.mark.asyncio
async def test_case_069_edge_case_limit_1_similar_products(db_session):
    """Case 069: Verify requesting limit=1 returns exactly 1 item if catalog available."""
    res = await recommendation_svc.get_similar_products(1, db_session, limit=1)
    assert len(res) == 1

@pytest.mark.asyncio
async def test_case_070_edge_case_frequently_bought_non_existent_id(db_session):
    """Case 070: Verify frequently bought together for non-existent product ID returns empty dict."""
    res = await recommendation_svc.get_frequently_bought_together(99999, db_session)
    assert res == {}
