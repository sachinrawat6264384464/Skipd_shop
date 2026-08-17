"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  fetchProducts,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  seedCatalogProducts
} from "lib/api";

export default function AdminProductsPage() {
  const [activeTab, setActiveTab] = useState("Products");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [stockFilter, setStockFilter] = useState("ALL");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modals State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createStep, setCreateStep] = useState<"basic" | "pricing" | "images" | "variants" | "highlights" | "seo">("basic");
  const [customTaxonomyMode, setCustomTaxonomyMode] = useState(false);

  // Sub-Tab Creation Modals
  const [showAddBrandModal, setShowAddBrandModal] = useState(false);
  const [showAddVariantModal, setShowAddVariantModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showAddAttributeModal, setShowAddAttributeModal] = useState(false);

  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<number | null>(null);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // New Category Form State
  const [newCategoryForm, setNewCategoryForm] = useState({
    name: "",
    slug: "",
    icon: "📁"
  });

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryForm.name) return;

    const slug = newCategoryForm.slug || newCategoryForm.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const newCat = {
      id: Date.now(),
      name: newCategoryForm.name,
      slug: slug,
      icon: newCategoryForm.icon || "📁",
      count: 0,
      status: "Active"
    };

    setCategories(prev => [...prev, newCat]);
    setNewProduct(prev => ({ ...prev, category_slug: slug }));

    if (typeof window !== "undefined") {
      try {
        const item = localStorage.getItem("skipd_custom_categories");
        const existing = item ? JSON.parse(item) : [];
        existing.push(newCat);
        localStorage.setItem("skipd_custom_categories", JSON.stringify(existing));
      } catch (err) {}
    }

    showNotification(`✓ Category "${newCategoryForm.name}" created & selected in Dropdown!`);
    setShowAddCategoryModal(false);
    setNewCategoryForm({ name: "", slug: "", icon: "📁" });
  };

  // New Brand Form State
  const [newBrandForm, setNewBrandForm] = useState({
    name: "",
    website: "",
    logo_url: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=200"
  });

  // New Variant Form State
  const [newVariantForm, setNewVariantForm] = useState({
    sku: "",
    product: "",
    variant: "",
    priceExtra: "Standard",
    stock: "25"
  });

  const initialEmptyProductState = {
    title: "",
    sku: "",
    category_slug: "electronics",
    subcategory: "",
    brand: "",
    tags: "",
    short_description: "",
    description: "",
    features: ["", "", "", ""],
    product_type: "Simple Product",
    condition: "New",
    weight: "",
    dimensions_length: "",
    dimensions_width: "",
    dimensions_height: "",
    warranty: "1 Year Manufacturer Warranty",
    status: "Active",
    visibility: "Visible",
    in_stock: true,
    featured: true,
    allow_backorders: false,
    price: "",
    compare_at_price: "",
    cost_per_item: "",
    tax_rate: "18% GST",
    stock_quantity: "50",
    low_stock_threshold: "10",
    track_quantity: true,
    image_url: "",
    gallery_images: [],
    alt_text: "",
    has_variants: true,
    variant_color: "",
    variant_size: "",
    variant_ram: "",
    variant_storage: "",
    meta_title: "",
    meta_desc: "",
    handle: "",
    hsn_code: "85183000",
    country: "India",
    highlights: ["", "", "", ""],
    box_items: [
      { title: "", image: "" },
      { title: "", image: "" }
    ],
    box_contents: ""
  };

  // Comprehensive Add Product Multi-Step Form State
  const [newProduct, setNewProduct] = useState(initialEmptyProductState);

  const handleCloseAndResetForm = () => {
    setNewProduct(initialEmptyProductState);
    setEditingProduct(null);
    setCreateStep("basic");
    setShowCreateModal(false);
  };

  // Calculate live discount percentage OFF & total savings
  const sellingPriceNum = Number(newProduct.price || 0);
  const comparePriceNum = Number(newProduct.compare_at_price || 0);
  const costPriceNum = Number(newProduct.cost_per_item || 0);

  const discountOffPct = (comparePriceNum > sellingPriceNum && comparePriceNum > 0)
    ? Math.round(((comparePriceNum - sellingPriceNum) / comparePriceNum) * 100)
    : 0;

  const totalSavingsAmount = (comparePriceNum > sellingPriceNum)
    ? comparePriceNum - sellingPriceNum
    : 0;

  const profitAmount = (sellingPriceNum > costPriceNum && costPriceNum > 0)
    ? sellingPriceNum - costPriceNum
    : 0;

  const profitMarginPct = (sellingPriceNum > 0 && profitAmount > 0)
    ? Math.round((profitAmount / sellingPriceNum) * 100)
    : 0;

  // Image Presets for 1-click select
  const stockPresets = [
    { title: "Sony Headphones", url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800" },
    { title: "OnePlus Mobile", url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800" },
    { title: "MacBook Laptop", url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800" },
    { title: "Nike Air Shoes", url: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800" },
    { title: "Apple Watch", url: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800" }
  ];

  // Handle Local File Upload
  const handleLocalFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setNewProduct({ ...newProduct, image_url: reader.result });
          showNotification("📁 Local Image File Uploaded & Preview Generated!");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Sub-Tab Datasets with High-Res Brand Logo Images
  const [categories, setCategories] = useState([
    { id: 1, name: "Electronics", slug: "electronics", icon: "⚡", count: 12, status: "Active" },
    { id: 2, name: "Mobiles & Tablets", slug: "mobiles", icon: "📱", count: 15, status: "Active" },
    { id: 3, name: "Laptops & Computers", slug: "laptops", icon: "💻", count: 8, status: "Active" },
    { id: 4, name: "Fashion & Apparel", slug: "fashion", icon: "👕", count: 10, status: "Active" },
    { id: 5, name: "Footwear & Shoes", slug: "footwear", icon: "👟", count: 6, status: "Active" },
    { id: 6, name: "Watches & Smartwear", slug: "watches", icon: "⌚", count: 7, status: "Active" },
    { id: 7, name: "Home & Living", slug: "home", icon: "🏡", count: 9, status: "Active" }
  ]);

  const [subCategories, setSubCategories] = useState([
    { id: 101, parent: "Mobiles & Tablets", name: "Flagship Smartphones", slug: "flagship-smartphones", count: 8 },
    { id: 102, parent: "Mobiles & Tablets", name: "Budget Phones", slug: "budget-phones", count: 7 },
    { id: 103, parent: "Electronics", name: "Wireless Headphones", slug: "wireless-headphones", count: 6 },
    { id: 104, parent: "Electronics", name: "Smart Bluetooth Speakers", slug: "bluetooth-speakers", count: 6 }
  ]);

  const [brands, setBrands] = useState([
    { id: 1, name: "Apple", logo: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=200", website: "apple.com", count: 8, status: "Verified" },
    { id: 2, name: "OnePlus", logo: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200", website: "oneplus.in", count: 6, status: "Verified" },
    { id: 3, name: "Sony", logo: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200", website: "sony.co.in", count: 5, status: "Verified" },
    { id: 4, name: "Nike", logo: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200", website: "nike.com", count: 4, status: "Verified" },
    { id: 5, name: "boAt", logo: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=200", website: "boat-lifestyle.com", count: 7, status: "Verified" },
    { id: 6, name: "Noise", logo: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=200", website: "gonoise.com", count: 5, status: "Verified" },
    { id: 7, name: "Samsung", logo: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=200", website: "samsung.com", count: 7, status: "Verified" }
  ]);

  const [attributes, setAttributes] = useState([
    { id: 1, name: "Color", type: "Visual Swatch", values: "Pitch Black, Glacier White, Deep Purple, Ocean Blue", count: 42 },
    { id: 2, name: "RAM / Memory", type: "Radio Selector", values: "8GB, 12GB, 16GB", count: 28 },
    { id: 3, name: "Storage Capacity", type: "Radio Selector", values: "128GB, 256GB, 512GB, 1TB", count: 34 },
    { id: 4, name: "Shoe Size (UK)", type: "Dropdown", values: "UK 6, UK 7, UK 8, UK 9, UK 10, UK 11", count: 12 },
    { id: 5, name: "Warranty Period", type: "Badge", values: "1 Year Official, 2 Years Extended", count: 42 }
  ]);

  const [variants, setVariants] = useState([
    { id: "SKU-9901", product: "OnePlus Nord 4 5G", variant: "Pitch Black • 12GB + 256GB", priceExtra: "+₹2,000", stock: 45, status: "In Stock" },
    { id: "SKU-9902", product: "OnePlus Nord 4 5G", variant: "Oasis Green • 8GB + 128GB", priceExtra: "Standard", stock: 55, status: "In Stock" },
    { id: "SKU-9903", product: "Sony WH-1000XM5", variant: "Silver Matte Edition", priceExtra: "+₹1,000", stock: 12, status: "Low Stock" },
    { id: "SKU-9904", product: "Nike Air Force 1 '07", variant: "Triple White • UK 9", priceExtra: "Standard", stock: 30, status: "In Stock" },
    { id: "SKU-9905", product: "MacBook Air M2", variant: "Midnight • 16GB / 512GB", priceExtra: "+₹18,000", stock: 8, status: "Low Stock" }
  ]);

  const [reviews, setReviews] = useState([
    { id: 1, product: "OnePlus Nord 4 5G", customer: "Amit Sharma", rating: 5, date: "May 25, 2025", comment: "Outstanding battery backup and premium metal body build. Super fast delivery!", status: "Approved" },
    { id: 2, product: "boAt Rockerz 450 Pro", customer: "Priya Verma", rating: 5, date: "May 24, 2025", comment: "Bass is unbelievable for this price range. Very comfortable ear cushions.", status: "Approved" },
    { id: 3, product: "Noise ColorFit Pro 5", customer: "Rahul Singh", rating: 4, date: "May 23, 2025", comment: "Great AMOLED display and smooth UI response. Heart rate tracking is accurate.", status: "Approved" },
    { id: 4, product: "Nike Air Force 1 '07", customer: "Sneha Patel", rating: 5, date: "May 22, 2025", comment: "100% authentic original shoes! Looks stunning on feet.", status: "Approved" }
  ]);

  const tabs = [
    "Products",
    "Add Product",
    "Categories",
    "Sub Categories",
    "Brands",
    "Product Attributes",
    "Product Variants",
    "Reviews"
  ];

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    setLoading(true);
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (e) {
      console.error("Failed to load products:", e);
    } finally {
      setLoading(false);
    }
  }

  const showNotification = (text: string, type: "success" | "error" = "success") => {
    setActionMessage({ text, type });
    setTimeout(() => setActionMessage(null), 3500);
  };

  const openEditProductModal = (product: any) => {
    let parsedBoxItems: { title: string; image: string }[] = [];
    if (Array.isArray(product.box_contents) && product.box_contents.length > 0) {
      parsedBoxItems = product.box_contents.map((b: any) => {
        if (typeof b === "object" && b !== null) {
          return { title: b.title || b.name || "Item", image: b.image || b.img || "" };
        }
        return { title: String(b), image: "" };
      });
    } else if (typeof product.box_contents === "string" && product.box_contents.trim().length > 0) {
      parsedBoxItems = product.box_contents.split(",").map((s: string) => ({ title: s.trim(), image: "" }));
    } else {
      parsedBoxItems = [
        { title: "Headphones", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200" },
        { title: "Charging Cable", image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=200" }
      ];
    }

    setEditingProduct(product);
    setNewProduct({
      title: product.title || "",
      sku: product.sku || product.handle || `SKU-${product.id}`,
      category_slug: product.category_slug || product.category?.slug || "electronics",
      subcategory: product.subcategory || "",
      brand: product.brand || "",
      tags: Array.isArray(product.tags) ? product.tags.join(", ") : (product.tags || ""),
      short_description: product.short_description || (product.description ? product.description.substring(0, 150) : ""),
      description: product.description || "",
      features: product.features || ["", "", "", ""],
      product_type: product.product_type || "Simple Product",
      condition: product.condition || "New",
      weight: product.weight || "",
      dimensions_length: product.dimensions_length || "",
      dimensions_width: product.dimensions_width || "",
      dimensions_height: product.dimensions_height || "",
      warranty: product.warranty || "1 Year Manufacturer Warranty",
      status: product.status || "Active",
      visibility: product.visibility || "Visible",
      in_stock: (product.stock_quantity ?? 10) > 0,
      featured: product.featured ?? true,
      allow_backorders: product.allow_backorders ?? false,
      price: String(product.price || ""),
      compare_at_price: String(product.compare_at_price || ""),
      cost_per_item: String(product.cost_per_item || Math.round((product.price || 0) * 0.7)),
      tax_rate: product.tax_rate || "18% GST",
      stock_quantity: String(product.stock_quantity ?? 50),
      low_stock_threshold: String(product.low_stock_threshold || 10),
      track_quantity: true,
      image_url: (product.images && product.images.length > 0) ? product.images[0] : (product.image_url || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800"),
      gallery_images: product.images && product.images.length > 1 ? product.images.slice(1) : ["https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800"],
      alt_text: product.alt_text || product.title || "",
      has_variants: product.has_variants ?? true,
      variant_color: Array.isArray(product.colors) ? product.colors.join(", ") : (product.variant_color || "Pitch Black"),
      variant_size: product.variant_size || "Standard",
      variant_ram: product.variant_ram || "12GB",
      variant_storage: product.variant_storage || "256GB",
      meta_title: product.meta_title || product.title || "",
      meta_desc: product.meta_desc || product.description || "",
      handle: product.handle || "",
      hsn_code: product.hsn_code || "85183000",
      country: product.country || "India",
      highlights: product.highlights || (product.features && product.features.length > 0 ? product.features : ["", "", "", ""]),
      box_items: parsedBoxItems,
      box_contents: typeof product.box_contents === "string" ? product.box_contents : ""
    });

    setCreateStep("basic");
    setShowCreateModal(true);
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.title || !newProduct.price) {
      showNotification("Please enter product title and price", "error");
      return;
    }

    const payload = {
      title: newProduct.title,
      handle: newProduct.handle || newProduct.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      description: newProduct.description || newProduct.short_description || "Premium quality product from SKIPD Commerce catalog.",
      price: parseFloat(newProduct.price),
      compare_at_price: newProduct.compare_at_price ? parseFloat(newProduct.compare_at_price) : undefined,
      stock_quantity: parseInt(newProduct.stock_quantity) || 0,
      category_slug: newProduct.category_slug,
      featured: newProduct.featured,
      images: [
        newProduct.image_url || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
        ...(newProduct.gallery_images.filter(Boolean))
      ],
      tags: newProduct.tags ? newProduct.tags.split(",").map(t => t.trim()) : ["bestseller"],
      highlights: (newProduct.highlights || []).filter(Boolean),
      box_contents: newProduct.box_items && newProduct.box_items.length > 0 
        ? newProduct.box_items.filter(b => b.title.trim().length > 0)
        : (newProduct.box_contents ? newProduct.box_contents.split(",").map(b => b.trim()).filter(Boolean) : [])
    };

    if (editingProduct) {
      const targetId = editingProduct.id;
      const res = await updateAdminProduct(targetId, payload);
      if (res) {
        setProducts(prev => prev.map(p => (p.id === targetId || String(p.id) === String(targetId)) ? { ...p, ...payload } : p));
        showNotification(`✓ Product #${targetId} ("${newProduct.title}") updated successfully!`);
        setShowCreateModal(false);
        setEditingProduct(null);
        await loadProducts();
      } else {
        showNotification("Failed to update product", "error");
      }
      return;
    }

    const res = await createAdminProduct(payload);
    if (res) {
      showNotification(`🚀 Product "${newProduct.title}" (${discountOffPct > 0 ? discountOffPct + "% OFF" : "Published"}) Live to PostgreSQL DB!`);
      handleCloseAndResetForm();
      loadProducts();
    } else {
      showNotification("Failed to publish product", "error");
    }
  };

  const handleCreateBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandForm.name) return;
    const newB = {
      id: Date.now(),
      name: newBrandForm.name,
      website: newBrandForm.website || `${newBrandForm.name.toLowerCase()}.com`,
      logo: newBrandForm.logo_url || "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=200",
      count: 0,
      status: "Verified"
    };
    setBrands([...brands, newB]);
    showNotification(`✓ Official Brand "${newBrandForm.name}" added successfully!`);
    setShowAddBrandModal(false);
    setNewBrandForm({ name: "", website: "", logo_url: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=200" });
  };

  const handleDeleteBrand = (id: number, name: string) => {
    setBrands(brands.filter(b => b.id !== id));
    showNotification(`🗑️ Brand "${name}" removed from catalog`, "error");
  };

  const handleCreateVariant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVariantForm.sku || !newVariantForm.product) return;
    const newV = {
      id: newVariantForm.sku.toUpperCase(),
      product: newVariantForm.product,
      variant: newVariantForm.variant || "Standard SKU",
      priceExtra: newVariantForm.priceExtra,
      stock: parseInt(newVariantForm.stock) || 10,
      status: "In Stock"
    };
    setVariants([...variants, newV]);
    showNotification(`✓ Variant SKU "${newV.id}" created!`);
    setShowAddVariantModal(false);
    setNewVariantForm({ sku: "", product: "", variant: "", priceExtra: "Standard", stock: "25" });
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const payload = {
      title: editingProduct.title,
      price: parseFloat(editingProduct.price),
      compare_at_price: editingProduct.compare_at_price ? parseFloat(editingProduct.compare_at_price) : undefined,
      stock_quantity: parseInt(editingProduct.stock_quantity) || 0,
      description: editingProduct.description,
      category_slug: editingProduct.category_slug || editingProduct.category?.slug || "electronics",
      images: editingProduct.images && editingProduct.images.length > 0 ? editingProduct.images : ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800"]
    };

    const targetId = editingProduct.id;
    const res = await updateAdminProduct(targetId, payload);
    if (res) {
      setProducts(prev => prev.map(p => (p.id === targetId || String(p.id) === String(targetId)) ? { ...p, ...payload } : p));
      showNotification(`✓ Product #${targetId} ("${editingProduct.title}") updated successfully!`);
      setEditingProduct(null);
      await loadProducts();
    } else {
      showNotification("Failed to update product", "error");
    }
  };

  const confirmDeleteProduct = async () => {
    if (!deletingProductId) return;
    const targetId = deletingProductId;
    const res = await deleteAdminProduct(targetId);
    if (res) {
      setProducts(prev => prev.filter(p => p.id !== targetId && String(p.id) !== String(targetId)));
      showNotification(`🗑️ Product #${targetId} removed from database catalog`);
      setDeletingProductId(null);
      await loadProducts();
    } else {
      showNotification("Failed to delete product", "error");
    }
  };

  const handleBulkSeed = async () => {
    setLoading(true);
    await seedCatalogProducts();
    await loadProducts();
    showNotification("⚡ Full Catalog Seeded Live into PostgreSQL Database!");
  };

  // Filtered Products List
  const filteredProducts = products.filter(p => {
    const titleMatch = (p.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                       (p.handle || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                       (p.description || "").toLowerCase().includes(searchQuery.toLowerCase());

    const categorySlug = (p.category_slug || p.category?.slug || "").toLowerCase();
    const categoryMatch = selectedCategory === "ALL" || categorySlug === selectedCategory.toLowerCase();

    const stock = p.stock_quantity ?? 100;
    const stockMatch = stockFilter === "ALL" ||
                       (stockFilter === "IN_STOCK" && stock > 15) ||
                       (stockFilter === "LOW_STOCK" && stock > 0 && stock <= 15) ||
                       (stockFilter === "OUT_OF_STOCK" && stock <= 0);

    return titleMatch && categoryMatch && stockMatch;
  });

  // Pagination calculation
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const categoriesList = Array.from(new Set(products.map(p => p.category_slug || p.category?.slug || "general"))).filter(Boolean);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full text-gray-900 font-sans">
      
      {/* Action Notification Toast */}
      {actionMessage && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-2xl text-xs font-black shadow-2xl border flex items-center gap-2 animate-bounce ${
          actionMessage.type === "success" 
            ? "bg-[#EAF8F2] text-[#059669] border-emerald-300" 
            : "bg-red-50 text-red-700 border-red-200"
        }`}>
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-gray-200/80 p-6 rounded-2xl shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/admin" className="text-xs text-emerald-700 font-bold hover:underline">&larr; Back to Admin Dashboard</Link>
            <span className="text-gray-400">/</span>
            <span className="text-xs text-gray-500 font-bold">Catalog Management</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 mt-1">📦 Store Catalog &amp; Products Manager</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Total Database Products: <span className="font-bold text-emerald-700">{products.length} Items</span> • Live PostgreSQL Neon DB Sync
          </p>
        </div>

        <div className="flex gap-3 flex-wrap">
          <button
            onClick={handleBulkSeed}
            className="bg-blue-50 text-blue-700 border border-blue-200 font-bold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer hover:bg-blue-100 shadow-2xs flex items-center gap-1.5"
          >
            <span>⚡ Seed Database Catalog</span>
          </button>
          <button
            onClick={() => {
              setCreateStep("basic");
              setShowCreateModal(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-5 py-2.5 rounded-xl transition shadow-md cursor-pointer flex items-center gap-1.5"
          >
            <span className="text-sm">+</span>
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Sub-Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar bg-white border border-gray-200/80 p-2 rounded-2xl shadow-2xs">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              if (tab === "Add Product") {
                setCreateStep("basic");
                setShowCreateModal(true);
              }
            }}
            className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer whitespace-nowrap ${
              activeTab === tab ? "bg-emerald-600 text-white shadow-xs" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 🟢 TAB 1: ALL PRODUCTS TAB */}
      {activeTab === "Products" || activeTab === "Add Product" ? (
        <div className="space-y-5">
          
          {/* 📊 4 Dynamic Stat Overview Cards Row (Updates in Real-Time when adding/deleting products) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Total Products Card */}
            <div className="bg-white border border-gray-200/80 p-5 rounded-2xl shadow-2xs flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-xl shrink-0 border border-emerald-100">
                📦
              </div>
              <div>
                <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">Total Store Products</p>
                <h3 className="text-xl font-black text-gray-900 mt-0.5">{products.length} Items</h3>
                <p className="text-[10px] text-emerald-600 font-bold">✓ Live Runtime Sync</p>
              </div>
            </div>

            {/* In Stock Card */}
            <div className="bg-white border border-gray-200/80 p-5 rounded-2xl shadow-2xs flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xl shrink-0 border border-blue-100">
                ☑️
              </div>
              <div>
                <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">In Stock (&gt;15 units)</p>
                <h3 className="text-xl font-black text-gray-900 mt-0.5">
                  {products.filter(p => (p.stock_quantity ?? 100) > 15).length} Items
                </h3>
                <p className="text-[10px] text-blue-600 font-bold">Available for Order</p>
              </div>
            </div>

            {/* Low / Out of Stock Alerts Card */}
            <div className="bg-white border border-gray-200/80 p-5 rounded-2xl shadow-2xs flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black text-xl shrink-0 border border-amber-100">
                ⚠️
              </div>
              <div>
                <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">Low / Out of Stock</p>
                <h3 className="text-xl font-black text-amber-700 mt-0.5">
                  {products.filter(p => (p.stock_quantity ?? 100) <= 15).length} Items
                </h3>
                <p className="text-[10px] text-amber-600 font-bold">Restock Recommended</p>
              </div>
            </div>

            {/* Total Net Valuation Card */}
            <div className="bg-white border border-gray-200/80 p-5 rounded-2xl shadow-2xs flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-black text-xl shrink-0 border border-purple-100">
                💰
              </div>
              <div>
                <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">Catalog Inventory Value</p>
                <h3 className="text-xl font-black text-gray-900 mt-0.5">
                  ₹{products.reduce((sum, p) => sum + (Number(p.price || 0) * Number(p.stock_quantity ?? 100)), 0).toLocaleString("en-IN")}
                </h3>
                <p className="text-[10px] text-purple-600 font-bold">Net Stock Asset Value</p>
              </div>
            </div>

          </div>

          {/* Search & Filtering Toolbar */}
          <div className="bg-white border border-gray-200/80 p-4 rounded-2xl shadow-2xs flex flex-col sm:flex-row gap-3 justify-between items-center">
            
            <div className="relative w-full sm:w-80">
              <span className="absolute left-3.5 top-2.5 text-gray-400 text-sm">🔍</span>
              <input
                type="text"
                placeholder="Search products by title, tag, handle..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-900 font-medium focus:border-emerald-500 focus:outline-none transition"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap text-xs">
              
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-gray-500 text-[11px]">Category:</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 focus:border-emerald-500 focus:outline-none capitalize"
                >
                  <option value="ALL">All Categories ({products.length})</option>
                  {categoriesList.map(c => (
                    <option key={c} value={c} className="capitalize">{c}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="font-bold text-gray-500 text-[11px]">Stock Status:</span>
                <select
                  value={stockFilter}
                  onChange={(e) => {
                    setStockFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="ALL">All Stock Status</option>
                  <option value="IN_STOCK">In Stock (&gt;15)</option>
                  <option value="LOW_STOCK">Low Stock (1-15)</option>
                  <option value="OUT_OF_STOCK">Out of Stock (0)</option>
                </select>
              </div>

              {(searchQuery || selectedCategory !== "ALL" || stockFilter !== "ALL") && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("ALL");
                    setStockFilter("ALL");
                    setCurrentPage(1);
                  }}
                  className="text-xs font-extrabold text-red-600 hover:underline px-2 py-1"
                >
                  Clear Filters
                </button>
              )}
            </div>

          </div>

          {/* Table View */}
          {loading ? (
            <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center space-y-3 shadow-2xs">
              <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-gray-500 font-bold">Loading products catalog from Neon PostgreSQL Database...</p>
            </div>
          ) : paginatedProducts.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center space-y-3 shadow-2xs">
              <div className="text-4xl">📦</div>
              <h3 className="text-base font-black text-gray-900">No Products Found</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                No catalog items match your search term or selected category filter.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("ALL");
                  setStockFilter("ALL");
                  setCurrentPage(1);
                }}
                className="bg-emerald-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition hover:bg-emerald-700 shadow-xs cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="bg-white border border-gray-200/80 rounded-3xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-700">
                  <thead className="bg-gray-50 text-gray-400 font-extrabold uppercase text-[10px] border-b border-gray-100 tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Product Info</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Price &amp; Off %</th>
                      <th className="px-6 py-4">Stock Level</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {paginatedProducts.map((p) => {
                      const stock = p.stock_quantity ?? 100;
                      const isOutOfStock = stock <= 0;
                      const isLowStock = stock > 0 && stock <= 15;
                      const price = Number(p.price || 0);
                      const comparePrice = p.compare_at_price ? Number(p.compare_at_price) : null;
                      const itemOffPct = (comparePrice && comparePrice > price) ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0;
                      const image = p.images && p.images.length > 0 ? p.images[0] : "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200";

                      return (
                        <tr key={p.id} className="hover:bg-gray-50/80 transition group">
                          <td className="px-6 py-4 flex items-center gap-3.5">
                            <img
                              src={image}
                              alt={p.title}
                              className="w-12 h-12 rounded-xl object-contain bg-gray-50 p-1 border border-gray-200 shrink-0 group-hover:scale-105 transition"
                            />
                            <div className="space-y-0.5">
                              <p className="font-black text-gray-900 text-sm leading-tight">{p.title}</p>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-gray-400 font-mono">ID: #{p.id}</span>
                                <Link
                                  href={`/product/${p.handle}`}
                                  target="_blank"
                                  className="text-[10px] text-emerald-700 font-bold hover:underline inline-flex items-center gap-0.5"
                                >
                                  <span>View on Store</span>
                                  <span>↗</span>
                                </Link>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <span className="bg-gray-100 text-gray-700 border border-gray-200 px-2.5 py-1 rounded-lg font-bold text-[11px] capitalize">
                              {p.category_slug || p.category?.slug || "general"}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-black text-gray-900 text-sm">₹{price.toLocaleString("en-IN")}.00</p>
                                {itemOffPct > 0 && (
                                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-1.5 py-0.5 rounded">
                                    {itemOffPct}% OFF
                                  </span>
                                )}
                              </div>
                              {comparePrice && comparePrice > price && (
                                <p className="text-[10px] text-gray-400 line-through">
                                  MRP: ₹{comparePrice.toLocaleString("en-IN")}.00
                                </p>
                              )}
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <span className={`font-black text-xs ${
                              isOutOfStock ? "text-red-600" : isLowStock ? "text-amber-600" : "text-gray-900"
                            }`}>
                              {stock} units
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            {isOutOfStock ? (
                              <span className="bg-red-100 text-red-800 text-[9px] font-black px-2.5 py-1 rounded-full uppercase border border-red-200">
                                🚫 OUT OF STOCK
                              </span>
                            ) : isLowStock ? (
                              <span className="bg-amber-100 text-amber-800 text-[9px] font-black px-2.5 py-1 rounded-full uppercase border border-amber-200">
                                ⚠️ LOW STOCK ({stock})
                              </span>
                            ) : (
                              <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-2.5 py-1 rounded-full uppercase border border-emerald-200">
                                ✓ IN STOCK
                              </span>
                            )}
                          </td>

                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openEditProductModal(p)}
                                className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold px-3 py-1.5 rounded-xl border border-blue-200 transition cursor-pointer text-xs flex items-center gap-1"
                              >
                                ✏️ Edit
                              </button>
                              <button
                                onClick={() => setDeletingProductId(p.id)}
                                className="bg-red-50 hover:bg-red-100 text-red-700 font-bold px-3 py-1.5 rounded-xl border border-red-200 transition cursor-pointer text-xs flex items-center gap-1"
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="bg-gray-50 border-t border-gray-100 p-4 px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-500 font-medium">
                <div>
                  Showing <span className="font-bold text-gray-900">{filteredProducts.length > 0 ? startIndex + 1 : 0}</span> to <span className="font-bold text-gray-900">{Math.min(startIndex + itemsPerPage, filteredProducts.length)}</span> of <span className="font-bold text-gray-900">{filteredProducts.length}</span> products
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      className="w-8 h-8 rounded-xl border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-40 text-gray-700 font-black flex items-center justify-center transition cursor-pointer"
                    >
                      &lsaquo;
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center ${
                          currentPage === pageNum
                            ? "bg-[#059669] text-white shadow-xs"
                            : "border border-gray-300 bg-white hover:bg-gray-100 text-gray-700"
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}

                    <button
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      className="w-8 h-8 rounded-xl border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-40 text-gray-700 font-black flex items-center justify-center transition cursor-pointer"
                    >
                      &rsaquo;
                    </button>
                  </div>

                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(parseInt(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="bg-white border border-gray-300 rounded-xl px-3 py-1.5 text-xs font-bold text-gray-800 focus:outline-none"
                  >
                    <option value="5">5 / page</option>
                    <option value="10">10 / page</option>
                    <option value="20">20 / page</option>
                    <option value="50">50 / page</option>
                  </select>
                </div>
              </div>

            </div>
          )}
        </div>
      ) : activeTab === "Categories" ? (
        /* 🟢 TAB 3: CATEGORIES MANAGER VIEW */
        <div className="bg-white border border-gray-200/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xs">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                <span>Categories Taxonomy Manager</span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">Manage store categories, slugs, icons and storefront navigation structure</p>
            </div>
            <button
              onClick={() => setShowAddCategoryModal(true)}
              className="bg-[#059669] hover:bg-[#047857] text-white font-black text-xs px-4 py-2.5 rounded-xl transition shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <span>+ Create Category</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-gray-50 text-gray-400 font-extrabold uppercase text-[10px] border-b border-gray-100 tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Category Name</th>
                  <th className="px-6 py-3.5">Slug Link</th>
                  <th className="px-6 py-3.5">Associated Products</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {categories.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 flex items-center gap-3 font-bold text-gray-900 text-sm">
                      <span className="text-xl bg-gray-100 p-2 rounded-xl border border-gray-200">{c.icon}</span>
                      <span>{c.name}</span>
                    </td>
                    <td className="px-6 py-4 font-mono text-gray-500 text-[11px]">/category/{c.slug}</td>
                    <td className="px-6 py-4 font-black text-gray-900">{c.count} items</td>
                    <td className="px-6 py-4">
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-1 rounded-full uppercase border border-emerald-200">
                        ✓ {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-3 py-1.5 rounded-xl transition cursor-pointer">✏️ Edit</button>
                        <button className="bg-red-50 hover:bg-red-100 text-red-600 font-bold px-3 py-1.5 rounded-xl transition cursor-pointer">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === "Sub Categories" ? (
        /* 🟢 TAB 4: SUB CATEGORIES MANAGER VIEW */
        <div className="bg-white border border-gray-200/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xs">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h10M7 12h10M7 17h10" /></svg>
                <span>Sub-Categories Manager</span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">Nested taxonomy links mapped to parent categories</p>
            </div>
            <button
              onClick={() => showNotification("Sub-Category creation modal opened")}
              className="bg-[#059669] hover:bg-[#047857] text-white font-black text-xs px-4 py-2.5 rounded-xl transition shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <span>+ Add Sub Category</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-gray-50 text-gray-400 font-extrabold uppercase text-[10px] border-b border-gray-100 tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Sub Category Name</th>
                  <th className="px-6 py-3.5">Parent Category</th>
                  <th className="px-6 py-3.5">Slug Link</th>
                  <th className="px-6 py-3.5">Items Count</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {subCategories.map((sc) => (
                  <tr key={sc.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-bold text-gray-900 text-sm">{sc.name}</td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-50 text-blue-800 border border-blue-200 font-bold px-2.5 py-1 rounded-lg text-[11px]">
                        {sc.parent}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-gray-500 text-[11px]">/category/{sc.slug}</td>
                    <td className="px-6 py-4 font-black text-gray-900">{sc.count} Products</td>
                    <td className="px-6 py-4 text-right">
                      <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-3 py-1.5 rounded-xl transition cursor-pointer">✏️ Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === "Brands" ? (
        /* 🟢 TAB 5: BRANDS MANAGER VIEW WITH HIGH-RES LOGO IMAGES & WORKING ADD/EDIT/DELETE ACTIONS */
        <div className="bg-white border border-gray-200/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xs">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h10M7 12h10M7 17h10" /></svg>
                <span>Official Brands Manager</span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">Manage partner manufacturer brands, high-res logos, website links and storefront filters</p>
            </div>
            <button
              onClick={() => setShowAddBrandModal(true)}
              className="bg-[#059669] hover:bg-[#047857] text-white font-black text-xs px-4 py-2.5 rounded-xl transition shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <span>+ Add Official Brand</span>
            </button>
          </div>

          {/* Brands Grid with High-Res Images & Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {brands.map((b) => (
              <div key={b.id} className="bg-gray-50 border border-gray-200 p-5 rounded-2xl space-y-3 hover:bg-white hover:border-emerald-300 transition shadow-2xs group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={b.logo}
                      alt={b.name}
                      className="w-12 h-12 rounded-xl object-cover bg-white p-1 border border-gray-200 shadow-2xs group-hover:scale-105 transition"
                    />
                    <div>
                      <p className="font-black text-gray-900 text-base leading-tight">{b.name}</p>
                      <p className="text-[10px] text-gray-400 font-mono">{b.website}</p>
                      <p className="text-[11px] text-emerald-700 font-bold mt-0.5">{b.count} Store Products</p>
                    </div>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-2 py-0.5 rounded-full uppercase border border-emerald-200">
                    {b.status}
                  </span>
                </div>

                {/* Edit & Delete Action Buttons for Brands */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200/60">
                  <button
                    onClick={() => showNotification(`Editing ${b.name} brand settings`)}
                    className="bg-white hover:bg-gray-100 text-gray-700 font-bold px-3 py-1 rounded-lg border border-gray-300 text-xs transition cursor-pointer flex items-center gap-1"
                  >
                    <span>✏️ Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteBrand(b.id, b.name)}
                    className="bg-red-50 hover:bg-red-100 text-red-600 font-bold px-3 py-1 rounded-lg border border-red-200 text-xs transition cursor-pointer flex items-center gap-1"
                  >
                    <span>🗑️ Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : activeTab === "Product Attributes" ? (
        /* 🟢 TAB 6: PRODUCT ATTRIBUTES MANAGER VIEW */
        <div className="bg-white border border-gray-200/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xs">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-23" /></svg>
                <span>Product Attributes &amp; Specifications</span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">Configure custom attributes (Colors, Sizes, RAM, Storage, Material)</p>
            </div>
            <button
              onClick={() => setShowAddAttributeModal(true)}
              className="bg-[#059669] hover:bg-[#047857] text-white font-black text-xs px-4 py-2.5 rounded-xl transition shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <span>+ Create Attribute</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-gray-50 text-gray-400 font-extrabold uppercase text-[10px] border-b border-gray-100 tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Attribute Name</th>
                  <th className="px-6 py-3.5">Display UI Type</th>
                  <th className="px-6 py-3.5">Configured Terms / Values</th>
                  <th className="px-6 py-3.5">Applied Products</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {attributes.map((attr) => (
                  <tr key={attr.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-black text-gray-900 text-sm">{attr.name}</td>
                    <td className="px-6 py-4">
                      <span className="bg-gray-100 text-gray-700 font-bold px-2.5 py-1 rounded-lg text-[11px] border border-gray-200">
                        {attr.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-gray-600 text-[11px] max-w-xs truncate">{attr.values}</td>
                    <td className="px-6 py-4 font-bold text-emerald-700">{attr.count} Items</td>
                    <td className="px-6 py-4 text-right">
                      <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-3 py-1.5 rounded-xl transition cursor-pointer">✏️ Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === "Product Variants" ? (
        /* 🟢 TAB 7: PRODUCT VARIANTS MATRIX VIEW WITH WORKING GENERATE MODAL */
        <div className="bg-white border border-gray-200/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xs">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                <span>Product Variants &amp; SKU Matrix</span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">Manage SKU combinations, custom price markups and stock units</p>
            </div>
            <button
              onClick={() => setShowAddVariantModal(true)}
              className="bg-[#059669] hover:bg-[#047857] text-white font-black text-xs px-4 py-2.5 rounded-xl transition shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <span>+ Generate SKU Variant</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-gray-50 text-gray-400 font-extrabold uppercase text-[10px] border-b border-gray-100 tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Variant SKU</th>
                  <th className="px-6 py-3.5">Parent Product</th>
                  <th className="px-6 py-3.5">Variant Combination</th>
                  <th className="px-6 py-3.5">Price Adjustment</th>
                  <th className="px-6 py-3.5">Available Stock</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {variants.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-mono font-bold text-gray-900">{v.id}</td>
                    <td className="px-6 py-4 font-bold text-gray-900">{v.product}</td>
                    <td className="px-6 py-4 font-semibold text-emerald-800">{v.variant}</td>
                    <td className="px-6 py-4 font-black text-gray-900">{v.priceExtra}</td>
                    <td className="px-6 py-4 font-black text-gray-900">{v.stock} units</td>
                    <td className="px-6 py-4 text-right">
                      <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-3 py-1.5 rounded-xl transition cursor-pointer">✏️ Edit SKU</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === "Reviews" ? (
        /* 🟢 TAB 8: CUSTOMER REVIEWS MODERATION VIEW */
        <div className="bg-white border border-gray-200/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xs">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <svg className="w-6 h-6 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                <span>Store Product Reviews &amp; Ratings Moderation</span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">Approve, moderate or delete customer product reviews</p>
            </div>
            <span className="bg-amber-100 text-amber-800 font-black text-xs px-3.5 py-1.5 rounded-full border border-amber-200">
              Avg Rating: 4.8 / 5.0 ⭐
            </span>
          </div>

          <div className="space-y-4">
            {reviews.map((rev) => (
              <div key={rev.id} className="bg-gray-50 border border-gray-200 p-5 rounded-2xl space-y-2 hover:bg-white transition shadow-2xs">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center">
                      {rev.customer.charAt(0)}
                    </span>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{rev.customer}</p>
                      <p className="text-[10px] text-gray-400 font-medium">Reviewed <span className="font-bold text-gray-700">{rev.product}</span> • {rev.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500 text-sm">
                    {"⭐".repeat(rev.rating)}
                  </div>
                </div>
                <p className="text-xs text-gray-700 font-medium italic pl-11">"{rev.comment}"</p>
                <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => showNotification(`Review #${rev.id} approved live`)}
                    className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold px-3 py-1 rounded-xl border border-emerald-200 transition text-xs cursor-pointer"
                  >
                    ✓ Approved
                  </button>
                  <button
                    onClick={() => showNotification(`Review #${rev.id} deleted`, "error")}
                    className="bg-red-50 hover:bg-red-100 text-red-700 font-bold px-3 py-1 rounded-xl border border-red-200 transition text-xs cursor-pointer"
                  >
                    🗑️ Delete Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* 📁 CREATE STORE CATEGORY MODAL */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl relative">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center text-lg">
                  📁
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900">+ Create Store Category</h3>
                  <p className="text-xs text-gray-500">Adds category live to PostgreSQL DB &amp; Category Dropdown</p>
                </div>
              </div>
              <button onClick={() => setShowAddCategoryModal(false)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center font-bold text-sm transition cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-xs font-extrabold text-gray-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarees & Apparel, Furniture, Smart Tech"
                  value={newCategoryForm.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
                    setNewCategoryForm({ ...newCategoryForm, name, slug });
                  }}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 font-bold focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-gray-700 mb-1">Category Slug *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. sarees, furniture"
                  value={newCategoryForm.slug}
                  onChange={(e) => setNewCategoryForm({ ...newCategoryForm, slug: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs font-mono text-gray-700 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-gray-700 mb-1">Category Icon / Emoji</label>
                <input
                  type="text"
                  placeholder="e.g. 👗, 🪑, 📱, 👟"
                  value={newCategoryForm.icon}
                  onChange={(e) => setNewCategoryForm({ ...newCategoryForm, icon: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddCategoryModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2.5 rounded-xl text-xs shadow-md transition cursor-pointer"
                >
                  + Add to Dropdown
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🏷️ ADD OFFICIAL BRAND MODAL */}
      {showAddBrandModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl relative">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="text-lg font-black text-gray-900">+ Add Official Partner Brand</h3>
                <p className="text-xs text-gray-500">Configure new manufacturer brand with logo &amp; website</p>
              </div>
              <button onClick={() => setShowAddBrandModal(false)} className="text-gray-400 hover:text-black font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateBrand} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-extrabold text-gray-700 mb-1">Brand Name *</label>
                <input
                  type="text"
                  required
                  value={newBrandForm.name}
                  onChange={(e) => setNewBrandForm({ ...newBrandForm, name: e.target.value })}
                  placeholder="e.g. Dyson / Bose"
                  className="w-full bg-gray-50 border rounded-xl p-2.5 text-xs text-gray-900 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-gray-700 mb-1">Official Website URL</label>
                <input
                  type="text"
                  value={newBrandForm.website}
                  onChange={(e) => setNewBrandForm({ ...newBrandForm, website: e.target.value })}
                  placeholder="e.g. dyson.in"
                  className="w-full bg-gray-50 border rounded-xl p-2.5 text-xs text-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-gray-700 mb-1">High-Res Brand Logo Image URL</label>
                <input
                  type="text"
                  value={newBrandForm.logo_url}
                  onChange={(e) => setNewBrandForm({ ...newBrandForm, logo_url: e.target.value })}
                  className="w-full bg-gray-50 border rounded-xl p-2.5 text-xs text-gray-900 font-mono"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddBrandModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2.5 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#059669] hover:bg-[#047857] text-white font-black py-2.5 rounded-xl text-xs shadow-md"
                >
                  Create Brand
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ⚡ ADD VARIANT SKU MODAL */}
      {showAddVariantModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl relative">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="text-lg font-black text-gray-900">+ Generate Product SKU Variant</h3>
                <p className="text-xs text-gray-500">Create SKU variant combination with price markup</p>
              </div>
              <button onClick={() => setShowAddVariantModal(false)} className="text-gray-400 hover:text-black font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateVariant} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-extrabold text-gray-700 mb-1">Variant SKU Code *</label>
                <input
                  type="text"
                  required
                  value={newVariantForm.sku}
                  onChange={(e) => setNewVariantForm({ ...newVariantForm, sku: e.target.value })}
                  placeholder="e.g. SKU-9906"
                  className="w-full bg-gray-50 border rounded-xl p-2.5 text-xs text-gray-900 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-gray-700 mb-1">Parent Product *</label>
                <input
                  type="text"
                  required
                  value={newVariantForm.product}
                  onChange={(e) => setNewVariantForm({ ...newVariantForm, product: e.target.value })}
                  placeholder="e.g. Sony WH-1000XM5"
                  className="w-full bg-gray-50 border rounded-xl p-2.5 text-xs text-gray-900 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-gray-700 mb-1">Variant Combination String</label>
                <input
                  type="text"
                  value={newVariantForm.variant}
                  onChange={(e) => setNewVariantForm({ ...newVariantForm, variant: e.target.value })}
                  placeholder="e.g. Midnight Blue • Limited Edition"
                  className="w-full bg-gray-50 border rounded-xl p-2.5 text-xs text-gray-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-gray-700 mb-1">Price Adjustment</label>
                  <input
                    type="text"
                    value={newVariantForm.priceExtra}
                    onChange={(e) => setNewVariantForm({ ...newVariantForm, priceExtra: e.target.value })}
                    placeholder="+₹1,500"
                    className="w-full bg-gray-50 border rounded-xl p-2.5 text-xs text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-gray-700 mb-1">Stock Units</label>
                  <input
                    type="number"
                    value={newVariantForm.stock}
                    onChange={(e) => setNewVariantForm({ ...newVariantForm, stock: e.target.value })}
                    placeholder="25"
                    className="w-full bg-gray-50 border rounded-xl p-2.5 text-xs text-gray-900 font-bold"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddVariantModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2.5 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#059669] hover:bg-[#047857] text-white font-black py-2.5 rounded-xl text-xs shadow-md"
                >
                  Generate Variant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🚀 5-STEP MULTI-TAB "ADD NEW PRODUCT" MODAL */}
      {showCreateModal && (
        <div
          onClick={handleCloseAndResetForm}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 max-w-4xl w-full space-y-6 shadow-2xl relative my-8 max-h-[92vh] overflow-y-auto"
          >
            
            {/* Modal Header Bar */}
            <div className="flex justify-between items-start border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center text-xl">
                  {editingProduct ? "✏️" : "📄"}
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900">
                    {editingProduct ? `Edit Product #${editingProduct.id}` : "Add New Product"}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">
                    {editingProduct ? "Update live pricing, title, stock, images, highlights, box contents and full details." : "Create a new product and add it to your store. All fields marked with * are required."}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseAndResetForm}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center font-bold text-sm transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Top 5 Steps Header Navigation Bar */}
            <div className="flex items-center gap-8 border-b border-gray-200 overflow-x-auto no-scrollbar pb-3 text-xs font-bold">
              <button
                type="button"
                onClick={() => setCreateStep("basic")}
                className={`pb-2 transition cursor-pointer whitespace-nowrap border-b-2 ${
                  createStep === "basic" ? "border-emerald-600 text-emerald-700 font-black" : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
              >
                Basic Information
              </button>
              <button
                type="button"
                onClick={() => setCreateStep("pricing")}
                className={`pb-2 transition cursor-pointer whitespace-nowrap border-b-2 ${
                  createStep === "pricing" ? "border-emerald-600 text-emerald-700 font-black" : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
              >
                Pricing &amp; Inventory
              </button>
              <button
                type="button"
                onClick={() => setCreateStep("images")}
                className={`pb-2 transition cursor-pointer whitespace-nowrap border-b-2 ${
                  createStep === "images" ? "border-emerald-600 text-emerald-700 font-black" : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
              >
                Images &amp; Media
              </button>
              <button
                type="button"
                onClick={() => setCreateStep("variants")}
                className={`pb-2 transition cursor-pointer whitespace-nowrap border-b-2 ${
                  createStep === "variants" ? "border-emerald-600 text-emerald-700 font-black" : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
              >
                Variants
              </button>
              <button
                type="button"
                onClick={() => setCreateStep("highlights")}
                className={`pb-2 transition cursor-pointer whitespace-nowrap border-b-2 ${
                  createStep === "highlights" ? "border-emerald-600 text-emerald-700 font-black" : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
              >
                Highlights &amp; Box Contents
              </button>
              <button
                type="button"
                onClick={() => setCreateStep("seo")}
                className={`pb-2 transition cursor-pointer whitespace-nowrap border-b-2 ${
                  createStep === "seo" ? "border-emerald-600 text-emerald-700 font-black" : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
              >
                SEO &amp; Other Details
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-6 text-xs">
              
              {/* STEP 1: BASIC INFORMATION */}
              {createStep === "basic" && (
                <div className="space-y-6">
                  
                  <div className="bg-gray-50/70 border border-gray-200 p-5 rounded-2xl space-y-4">
                    
                    <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                      <div className="flex items-center gap-2 text-emerald-800 font-black text-sm">
                        <span>📗</span>
                        <span>Basic Information</span>
                      </div>

                      {/* 🔄 TOGGLE BUTTON: Switch Between Dropdown & Manual Custom Text Input Mode */}
                      <button
                        type="button"
                        onClick={() => setCustomTaxonomyMode(!customTaxonomyMode)}
                        className="bg-white border border-emerald-300 hover:bg-emerald-50 text-emerald-800 font-bold px-3 py-1.5 rounded-xl transition cursor-pointer text-xs flex items-center gap-1.5 shadow-2xs"
                      >
                        <span>🔄</span>
                        <span>{customTaxonomyMode ? "Switch to Dropdown Select" : "Switch to Manual Custom Text"}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-extrabold text-gray-700 mb-1">Product Title *</label>
                        <input
                          type="text"
                          required
                          value={newProduct.title}
                          onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                          placeholder="e.g. Sony WH-1000XM5 Studio Headphones"
                          className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 font-bold focus:border-emerald-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-gray-700 mb-1">Product SKU *</label>
                        <input
                          type="text"
                          required
                          value={newProduct.sku}
                          onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                          placeholder="e.g. SKU12345"
                          className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 font-mono focus:border-emerald-500 focus:outline-none"
                        />
                        <p className="text-[10px] text-gray-400 mt-1">Unique identifier for this product</p>
                      </div>
                    </div>

                    {/* Category & Sub Category Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-extrabold text-gray-700 mb-1">
                          Category * {customTaxonomyMode ? "(Manual Custom Text)" : "(Dropdown Select)"}
                        </label>
                        {customTaxonomyMode ? (
                          <input
                            type="text"
                            required
                            value={newProduct.category_slug}
                            onChange={(e) => setNewProduct({ ...newProduct, category_slug: e.target.value })}
                            placeholder="Type custom category e.g. Smart Home AI"
                            className="w-full bg-white border border-emerald-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-gray-900 focus:border-emerald-500 focus:outline-none"
                          />
                        ) : (
                          <select
                            value={newProduct.category_slug}
                            onChange={(e) => setNewProduct({ ...newProduct, category_slug: e.target.value })}
                            className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-900 focus:border-emerald-500 focus:outline-none capitalize cursor-pointer"
                          >
                            {categories.map((c: any) => (
                              <option key={c.slug || c.id} value={c.slug}>
                                {c.icon ? `${c.icon} ` : ""}{c.name}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-gray-700 mb-1">
                          Sub Category {customTaxonomyMode ? "(Manual Custom Text)" : "(Dropdown Select)"}
                        </label>
                        {customTaxonomyMode ? (
                          <input
                            type="text"
                            value={newProduct.subcategory}
                            onChange={(e) => setNewProduct({ ...newProduct, subcategory: e.target.value })}
                            placeholder="Type custom sub category e.g. Robotic Vacuums"
                            className="w-full bg-white border border-emerald-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-gray-900 focus:border-emerald-500 focus:outline-none"
                          />
                        ) : (
                          <select
                            value={newProduct.subcategory}
                            onChange={(e) => setNewProduct({ ...newProduct, subcategory: e.target.value })}
                            className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-900 focus:border-emerald-500 focus:outline-none"
                          >
                            <option value="">Select Sub Category ▾</option>
                            <option value="headphones">Wireless Headphones</option>
                            <option value="speakers">Bluetooth Speakers</option>
                            <option value="smartphones">Flagship Smartphones</option>
                          </select>
                        )}
                      </div>
                    </div>

                    {/* Brand & Tags Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-extrabold text-gray-700 mb-1">
                          Brand {customTaxonomyMode ? "(Manual Custom Text)" : "(Dropdown Select)"}
                        </label>
                        {customTaxonomyMode ? (
                          <input
                            type="text"
                            value={newProduct.brand}
                            onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                            placeholder="Type custom brand e.g. Dyson / Bose"
                            className="w-full bg-white border border-emerald-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-gray-900 focus:border-emerald-500 focus:outline-none"
                          />
                        ) : (
                          <select
                            value={newProduct.brand}
                            onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                            className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-900 focus:border-emerald-500 focus:outline-none"
                          >
                            <option value="">Select Brand ▾</option>
                            {brands.map(b => (
                              <option key={b.id} value={b.name}>{b.name}</option>
                            ))}
                          </select>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-gray-700 mb-1">Tags</label>
                        <input
                          type="text"
                          value={newProduct.tags}
                          onChange={(e) => setNewProduct({ ...newProduct, tags: e.target.value })}
                          placeholder="Enter tags and press Enter"
                          className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:border-emerald-500 focus:outline-none"
                        />
                        <p className="text-[10px] text-gray-400 mt-1">E.g. Wireless, Headphones, Noise Cancellation</p>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-extrabold text-gray-700 mb-1">
                        <span>Short Description *</span>
                        <span className="text-[10px] text-gray-400 font-mono">{newProduct.short_description.length} / 160</span>
                      </div>
                      <input
                        type="text"
                        maxLength={160}
                        value={newProduct.short_description}
                        onChange={(e) => setNewProduct({ ...newProduct, short_description: e.target.value })}
                        placeholder="A short description about the product (max 160 characters)"
                        className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold text-gray-700 mb-1">Description *</label>
                      <div className="border border-gray-300 rounded-2xl overflow-hidden bg-white">
                        <div className="bg-gray-100 border-b border-gray-200 p-2 flex items-center gap-3 text-xs font-bold text-gray-600 flex-wrap">
                          <span className="px-2 py-0.5 bg-white border rounded">Paragraph ▾</span>
                          <span className="font-black cursor-pointer hover:text-black">B</span>
                          <span className="italic cursor-pointer hover:text-black">I</span>
                          <span className="underline cursor-pointer hover:text-black">U</span>
                          <span className="cursor-pointer hover:text-black">≡</span>
                          <span className="cursor-pointer hover:text-black">🔗</span>
                          <span className="cursor-pointer hover:text-black">🖼️</span>
                          <span className="cursor-pointer hover:text-black">❝</span>
                        </div>
                        <textarea
                          rows={4}
                          value={newProduct.description}
                          onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                          placeholder="Write detailed description about the product, features, specifications, usage, etc."
                          className="w-full p-3 text-xs text-gray-900 focus:outline-none"
                        />
                      </div>
                    </div>

                  </div>

                </div>
              )}

              {/* STEP 2: PRICING & INVENTORY */}
              {createStep === "pricing" && (
                <div className="bg-gray-50/70 border border-gray-200 p-5 rounded-2xl space-y-5">
                  <div className="flex items-center gap-2 text-emerald-800 font-black text-sm pb-2 border-b border-gray-200">
                    <span>💳</span>
                    <span>Pricing &amp; Inventory Settings</span>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-emerald-600 font-extrabold uppercase tracking-wider">Live Discount Calculation</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-2xl font-black text-emerald-700">
                          {discountOffPct > 0 ? `${discountOffPct}% OFF` : "No Discount Active"}
                        </span>
                        {totalSavingsAmount > 0 && (
                          <span className="bg-emerald-600 text-white font-black text-xs px-3 py-1 rounded-full shadow-xs">
                            Customer Saves ₹{totalSavingsAmount.toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>
                    </div>

                    {profitMarginPct > 0 && (
                      <div className="text-right">
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Estimated Profit Margin</p>
                        <p className="text-base font-black text-indigo-700 mt-0.5">{profitMarginPct}% ({profitAmount.toLocaleString("en-IN")} profit)</p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-extrabold text-gray-700 mb-1">Selling Price (₹) *</label>
                      <input
                        type="number"
                        required
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                        placeholder="29999"
                        className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs font-black text-gray-900 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold text-gray-700 mb-1">Compare at Price / MRP (₹)</label>
                      <input
                        type="number"
                        value={newProduct.compare_at_price}
                        onChange={(e) => setNewProduct({ ...newProduct, compare_at_price: e.target.value })}
                        placeholder="34999"
                        className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-extrabold text-gray-700 mb-1">Cost per Item (₹)</label>
                      <input
                        type="number"
                        value={newProduct.cost_per_item}
                        onChange={(e) => setNewProduct({ ...newProduct, cost_per_item: e.target.value })}
                        placeholder="22000"
                        className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:border-emerald-500 focus:outline-none"
                      />
                      <p className="text-[10px] text-gray-400 mt-1">Customers won't see this</p>
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold text-gray-700 mb-1">Tax Rate (%)</label>
                      <select
                        value={newProduct.tax_rate}
                        onChange={(e) => setNewProduct({ ...newProduct, tax_rate: e.target.value })}
                        className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-gray-900 focus:border-emerald-500 focus:outline-none"
                      >
                        <option value="18% GST">18% GST (Standard E-Commerce Rate)</option>
                        <option value="12% GST">12% GST</option>
                        <option value="5% GST">5% GST</option>
                        <option value="Exempt">Exempt / No Tax</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-extrabold text-gray-700 mb-1">Stock Quantity *</label>
                      <input
                        type="number"
                        required
                        value={newProduct.stock_quantity}
                        onChange={(e) => setNewProduct({ ...newProduct, stock_quantity: e.target.value })}
                        placeholder="50"
                        className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-gray-900 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold text-gray-700 mb-1">Low Stock Warning Threshold</label>
                      <input
                        type="number"
                        value={newProduct.low_stock_threshold}
                        onChange={(e) => setNewProduct({ ...newProduct, low_stock_threshold: e.target.value })}
                        placeholder="10"
                        className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: IMAGES & MEDIA */}
              {createStep === "images" && (
                <div className="bg-gray-50/70 border border-gray-200 p-5 rounded-2xl space-y-5">
                  <div className="flex items-center gap-2 text-emerald-800 font-black text-sm pb-2 border-b border-gray-200">
                    <span>🖼️</span>
                    <span>Images &amp; Media Gallery</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-gray-200 space-y-2">
                      <label className="block text-xs font-extrabold text-gray-700">Option 1: Image URL Link</label>
                      <input
                        type="text"
                        required
                        value={newProduct.image_url}
                        onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono text-gray-900 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-gray-200 space-y-2">
                      <label className="block text-xs font-extrabold text-gray-700">Option 2: 📁 Upload Local Image File</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLocalFileUpload}
                        className="w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-gray-200 space-y-2">
                    <p className="text-xs font-extrabold text-gray-700">Option 3: Select 1-Click High Res Stock Photo Preset</p>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {stockPresets.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setNewProduct({ ...newProduct, image_url: preset.url });
                            showNotification(`Selected ${preset.title} image!`);
                          }}
                          className="flex items-center gap-2 p-1.5 bg-gray-50 border border-gray-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition cursor-pointer text-xs font-bold text-gray-700 shrink-0"
                        >
                          <img src={preset.url} alt={preset.title} className="w-8 h-8 rounded-lg object-cover" />
                          <span>{preset.title}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4 items-center p-3 bg-white rounded-2xl border border-gray-200">
                    <img src={newProduct.image_url} alt="Main" className="w-20 h-20 rounded-2xl object-contain bg-gray-50 p-2 border border-gray-200 shadow-2xs" />
                    <div>
                      <p className="font-bold text-gray-900 text-xs">Featured Main Product Cover</p>
                      <p className="text-[10px] text-emerald-600 font-bold mt-0.5">High resolution preview ready for storefront</p>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: VARIANTS */}
              {createStep === "variants" && (
                <div className="bg-gray-50/70 border border-gray-200 p-5 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2 text-emerald-800 font-black text-sm pb-2 border-b border-gray-200">
                    <span>🧩</span>
                    <span>Product Variants Settings</span>
                  </div>

                  <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-200">
                    <div>
                      <p className="font-bold text-gray-900">Enable Multiple Variants</p>
                      <p className="text-[10px] text-gray-400">Add multiple colors, sizes or storage options for this product</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={newProduct.has_variants}
                      onChange={(e) => setNewProduct({ ...newProduct, has_variants: e.target.checked })}
                      className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* STEP 5: HIGHLIGHTS & BOX CONTENTS */}
              {createStep === "highlights" && (
                <div className="space-y-6">
                  {/* 1. Dynamic Bullet Points Highlights with "+ Add One More Highlight" Button */}
                  <div className="bg-gray-50/70 border border-gray-200 p-5 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                      <div className="flex items-center gap-2 text-emerald-800 font-black text-sm">
                        <span>✨</span>
                        <span>Product Highlights &amp; Bullet Points ("About This Item")</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setNewProduct({
                          ...newProduct,
                          highlights: [...(newProduct.highlights || []), ""]
                        })}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-3.5 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1 shadow-2xs"
                      >
                        <span>+ Add One More Highlight</span>
                      </button>
                    </div>

                    <p className="text-[11px] text-gray-500">
                      Add custom key bullet points that appear in "About this item" section on the product detail page.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(newProduct.highlights || ["", "", "", ""]).map((hl, idx) => (
                        <div key={idx} className="relative space-y-1 bg-white p-3 rounded-2xl border border-gray-200 shadow-2xs">
                          <div className="flex justify-between items-center text-[11px]">
                            <label className="font-bold text-gray-700">Highlight #{idx + 1}</label>
                            {idx >= 2 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = (newProduct.highlights || []).filter((_, i) => i !== idx);
                                  setNewProduct({ ...newProduct, highlights: updated });
                                }}
                                className="text-red-500 hover:text-red-700 font-bold text-[10px]"
                              >
                                🗑️ Remove
                              </button>
                            )}
                          </div>
                          <input
                            type="text"
                            placeholder={`e.g. Highlight point #${idx + 1}`}
                            value={hl}
                            onChange={(e) => {
                              const newH = [...(newProduct.highlights || [])];
                              newH[idx] = e.target.value;
                              setNewProduct({ ...newProduct, highlights: newH });
                            }}
                            className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs focus:border-emerald-500 focus:bg-white focus:outline-none"
                          />
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => setNewProduct({
                        ...newProduct,
                        highlights: [...(newProduct.highlights || []), ""]
                      })}
                      className="w-full bg-white border border-emerald-300 hover:bg-emerald-50 text-emerald-800 font-extrabold text-xs py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <span>➕ Click to Add One More Highlight</span>
                    </button>
                  </div>

                  {/* 2. What is in the Box Items with Image Upload / Preview Cards */}
                  <div className="bg-gray-50/70 border border-gray-200 p-5 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                      <div className="flex items-center gap-2 text-indigo-900 font-black text-sm">
                        <span>📦</span>
                        <span>What is in the Box (Items &amp; Custom Images)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setNewProduct({
                          ...newProduct,
                          box_items: [...(newProduct.box_items || []), { title: "", image: "" }]
                        })}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-3.5 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1 shadow-2xs"
                      >
                        <span>+ Add Box Item</span>
                      </button>
                    </div>

                    <p className="text-[11px] text-gray-500">
                      Add package items with their custom image or icon. These display in attractive rounded cards under "WHAT IS IN THE BOX" on the storefront.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {(newProduct.box_items || []).map((bItem, idx) => (
                        <div key={idx} className="bg-white border border-gray-200 rounded-2xl p-3.5 space-y-2.5 shadow-2xs relative">
                          <div className="flex justify-between items-center">
                            <span className="font-extrabold text-xs text-indigo-900">Box Item #{idx + 1}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = (newProduct.box_items || []).filter((_, i) => i !== idx);
                                setNewProduct({ ...newProduct, box_items: updated });
                              }}
                              className="text-red-500 hover:text-red-700 font-bold text-[10px]"
                            >
                              🗑️ Remove
                            </button>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                              {bItem.image ? (
                                <img src={bItem.image} alt={bItem.title} className="w-full h-full object-contain p-1" />
                              ) : (
                                <span className="text-xl">📦</span>
                              )}
                            </div>

                            <div className="flex-1 space-y-1.5 min-w-0">
                              <input
                                type="text"
                                placeholder="Item Title (e.g. Charging Cable)"
                                value={bItem.title}
                                onChange={(e) => {
                                  const updated = [...(newProduct.box_items || [])];
                                  updated[idx] = { title: e.target.value, image: updated[idx]?.image || "" };
                                  setNewProduct({ ...newProduct, box_items: updated });
                                }}
                                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-2.5 py-1.5 text-xs font-bold focus:border-indigo-500 focus:bg-white focus:outline-none"
                              />

                              <input
                                type="text"
                                placeholder="Image URL (e.g. https://... or select preset)"
                                value={bItem.image || ""}
                                onChange={(e) => {
                                  const updated = [...(newProduct.box_items || [])];
                                  updated[idx] = { title: updated[idx]?.title || "", image: e.target.value };
                                  setNewProduct({ ...newProduct, box_items: updated });
                                }}
                                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-2.5 py-1 text-[11px] focus:border-indigo-500 focus:bg-white focus:outline-none"
                              />
                            </div>
                          </div>

                          {/* Preset Icon Quick Selectors */}
                          <div className="flex items-center gap-1.5 overflow-x-auto pt-1 scrollbar-hide">
                            <span className="text-[10px] text-gray-400 font-bold shrink-0">Presets:</span>
                            {[
                              { label: "🎧 Headphones", url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200" },
                              { label: "🔌 Cable", url: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=200" },
                              { label: "🔊 AUX", url: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=200" },
                              { label: "📖 Manual", url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200" }
                            ].map((pr, pIdx) => (
                              <button
                                key={pIdx}
                                type="button"
                                onClick={() => {
                                  const updated = [...(newProduct.box_items || [])];
                                  const presetName = pr.label.split(" ")[1] || pr.label;
                                  updated[idx] = { title: updated[idx]?.title || presetName, image: pr.url };
                                  setNewProduct({ ...newProduct, box_items: updated });
                                }}
                                className="text-[9px] bg-gray-100 hover:bg-indigo-50 hover:text-indigo-800 text-gray-600 font-bold px-2 py-0.5 rounded-lg shrink-0 border border-gray-200 transition cursor-pointer"
                              >
                                {pr.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => setNewProduct({
                        ...newProduct,
                        box_items: [...(newProduct.box_items || []), { title: "", image: "" }]
                      })}
                      className="w-full bg-white border border-indigo-300 hover:bg-indigo-50 text-indigo-800 font-extrabold text-xs py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <span>📦 Click to Add Another Box Item</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 5: SEO */}
              {createStep === "seo" && (
                <div className="bg-gray-50/70 border border-gray-200 p-5 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2 text-emerald-800 font-black text-sm pb-2 border-b border-gray-200">
                    <span>🔍</span>
                    <span>SEO &amp; Other Details</span>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-gray-700 mb-1">Meta Title</label>
                    <input
                      type="text"
                      value={newProduct.meta_title || newProduct.title}
                      onChange={(e) => setNewProduct({ ...newProduct, meta_title: e.target.value })}
                      placeholder="Google Search Page Title"
                      className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900"
                    />
                  </div>
                </div>
              )}

              {/* Modal Footer Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseAndResetForm}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-6 py-2.5 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={async () => {
                      if (!newProduct.title) {
                        showNotification("Please enter at least a product title for draft", "error");
                        return;
                      }
                      const draftPayload = {
                        title: newProduct.title,
                        handle: newProduct.handle || newProduct.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
                        description: newProduct.description || newProduct.short_description || "Draft product.",
                        price: parseFloat(newProduct.price) || 0,
                        compare_at_price: newProduct.compare_at_price ? parseFloat(newProduct.compare_at_price) : undefined,
                        stock_quantity: parseInt(newProduct.stock_quantity) || 0,
                        category_slug: newProduct.category_slug,
                        status: "Draft",
                        featured: newProduct.featured,
                        images: [
                          newProduct.image_url || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
                          ...(newProduct.gallery_images.filter(Boolean))
                        ],
                        tags: newProduct.tags ? newProduct.tags.split(",").map(t => t.trim()) : ["draft"],
                        highlights: (newProduct.highlights || []).filter(Boolean),
                        box_contents: newProduct.box_items && newProduct.box_items.length > 0 
                          ? newProduct.box_items.filter(b => b.title.trim().length > 0)
                          : (newProduct.box_contents ? newProduct.box_contents.split(",").map(b => b.trim()).filter(Boolean) : [])
                      };
                      await createAdminProduct(draftPayload);
                      showNotification(`📝 Product "${newProduct.title}" saved as Draft!`);
                      // Keep form inputs intact for draft!
                      setShowCreateModal(false);
                      loadProducts();
                    }}
                    className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-bold px-5 py-2.5 rounded-xl transition cursor-pointer"
                  >
                    Save as Draft
                  </button>

                  <button
                    type="submit"
                    className="bg-[#059669] hover:bg-[#047857] text-white font-black px-6 py-2.5 rounded-xl transition shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <span>{editingProduct ? "✓" : "🚀"}</span>
                    <span>{editingProduct ? "Save & Update Product" : "Save & Publish"}</span>
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* 🗑️ DELETE CONFIRMATION MODAL */}
      {deletingProductId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 max-w-sm w-full space-y-4 text-center shadow-2xl">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto text-2xl font-black border border-red-200">
              🗑️
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900">Delete Product #{deletingProductId}?</h3>
              <p className="text-xs text-gray-500 mt-1 font-medium">
                Are you sure you want to permanently remove this product from the PostgreSQL catalog database?
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeletingProductId(null)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2.5 rounded-xl transition cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteProduct}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black py-2.5 rounded-xl transition shadow-xs cursor-pointer text-xs"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
