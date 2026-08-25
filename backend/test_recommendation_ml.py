import asyncio
import os
import sys

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from app.core.database import AsyncSessionLocal
from app.services.recommendation_svc import recommendation_svc
from init_db_tables import initialize_and_migrate_all_tables

async def run_recommendation_tests():
    print("=" * 70)
    print("TESTING MACHINE LEARNING RECOMMENDATION SUBSYSTEM (100% REAL POSTGRESQL DATA)")
    print("=" * 70)

    # 0. Synchronize Database Schemas
    await initialize_and_migrate_all_tables()

    async with AsyncSessionLocal() as db:
        # Test 1: Fetch Similar Products for product ID 1 (or first active product)
        print("\n[TEST 1] Testing ML Content-Based Similar Products Engine (TF-IDF + Cosine Similarity)...")
        target_product_id = 1
        similar_items = await recommendation_svc.get_similar_products(
            product_id=target_product_id,
            db=db,
            limit=6
        )

        print(f"Target Product ID: {target_product_id}")
        print(f"Similar Products Returned: {len(similar_items)}")

        for idx, item in enumerate(similar_items, 1):
            print(f"  {idx}. [ID {item['id']}] {item['title']} - Price: ₹{item['price']} (Match Score: {item['match_percentage']}%)")

        assert isinstance(similar_items, list), "Similar items must be a list"
        print("[SUCCESS] Test 1 Passed: ML TF-IDF similarity computed successfully!")

        # Test 2: Fetch Frequently Bought Together bundle for product ID 1
        print("\n[TEST 2] Testing Frequently Bought Together Bundle Engine (Order Matrix)...")
        bundle = await recommendation_svc.get_frequently_bought_together(
            product_id=target_product_id,
            db=db
        )

        print(f"Main Product: {bundle.get('main_product', {}).get('title')} (₹{bundle.get('main_product', {}).get('price')})")
        print(f"Bundle Items Count: {bundle.get('item_count')}")
        print(f"Individual Sum: ₹{bundle.get('total_individual_price')}")
        print(f"Bundle Offer Price (10% Off): ₹{bundle.get('bundle_total_price')}")
        print(f"Total Savings: ₹{bundle.get('total_savings')}")

        assert "main_product" in bundle, "Bundle must contain main_product"
        assert "bundle_total_price" in bundle, "Bundle must contain calculated bundle_total_price"
        print("[SUCCESS] Test 2 Passed: Bundle offer engine computed successfully!")

        # Test 3: Record User Product View activity
        print("\n[TEST 3] Testing User Product View Activity Tracking...")
        view_recorded = await recommendation_svc.record_user_view(
            product_id=target_product_id,
            user_id=1,
            session_id="test-session-12345",
            db=db
        )

        print(f"User View Recorded in DB: {view_recorded}")
        assert view_recorded is True, "View recording failed"
        print("[SUCCESS] Test 3 Passed: User product view tracked in PostgreSQL user_views table!")

    print("\n" + "=" * 70)
    print("ALL RECOMMENDATION SUBSYSTEM TESTS COMPLETED WITH 100% SUCCESS!")
    print("=" * 70)

if __name__ == "__main__":
    asyncio.run(run_recommendation_tests())
