from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.models import Product
from app.services.trie_search import product_trie, build_product_trie_index

router = APIRouter(prefix="/search", tags=["Search & Autocomplete"])

@router.get("/autocomplete")
async def autocomplete_search(
    q: str = Query(..., min_length=1),
    db: AsyncSession = Depends(get_db)
):
    """
    🔍 O(K) Instant Trie Prefix Autocomplete Search:
    Returns matching products in sub-millisecond time using Trie Data Structure.
    """
    suggestions = product_trie.search_prefix(q)
    
    # Lazy build Trie if empty
    if not suggestions and not product_trie.root.children:
        res = await db.execute(select(Product))
        prods = res.scalars().all()
        products_data = [
            {"id": p.id, "title": p.title, "handle": p.handle, "price": p.price, "images": p.images, "tags": p.tags}
            for p in prods
        ]
        build_product_trie_index(products_data)
        suggestions = product_trie.search_prefix(q)

    return {
        "query": q,
        "total_results": len(suggestions),
        "suggestions": suggestions
    }
