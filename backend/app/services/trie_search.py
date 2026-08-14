from typing import List, Dict, Any, Optional

class TrieNode:
    def __init__(self):
        self.children: Dict[str, TrieNode] = {}
        self.is_end_of_word: bool = False
        self.products: List[Dict[str, Any]] = []

class ProductTrie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word: str, product_meta: Dict[str, Any]):
        """Insert product title/tag into Trie for O(K) prefix lookup."""
        node = self.root
        word_clean = word.lower().strip()
        for char in word_clean:
            if char not in node.children:
                node.children[char] = TrieNode()
            node = node.children[char]
            if not any(p.get("id") == product_meta.get("id") for p in node.products):
                if len(node.products) < 8:
                    node.products.append(product_meta)

        node.is_end_of_word = True

    def search_prefix(self, prefix: str) -> List[Dict[str, Any]]:
        """Search products matching prefix in O(K) time where K = len(prefix)."""
        node = self.root
        prefix_clean = prefix.lower().strip()
        for char in prefix_clean:
            if char not in node.children:
                return []
            node = node.children[char]
        return node.products

# Singleton Global Trie Index
product_trie = ProductTrie()

def build_product_trie_index(products_data: List[Dict[str, Any]]):
    """Build or refresh in-memory Trie index from database products."""
    global product_trie
    new_trie = ProductTrie()
    for prod in products_data:
        meta = {
            "id": prod.get("id"),
            "title": prod.get("title"),
            "handle": prod.get("handle"),
            "price": prod.get("price"),
            "image": prod.get("images", [""])[0] if prod.get("images") else ""
        }
        full_title = prod.get("title", "")
        if full_title:
            new_trie.insert(full_title, meta)

        title_words = full_title.split()
        for word in title_words:
            if len(word) >= 2:
                new_trie.insert(word, meta)

        tags = prod.get("tags", [])
        if isinstance(tags, list):
            for tag in tags:
                if len(tag) >= 2:
                    new_trie.insert(tag, meta)

    product_trie = new_trie
    print(f"[TRIE SEARCH INDEX BUILT] Successfully indexed {len(products_data)} products into Trie Structure.")
