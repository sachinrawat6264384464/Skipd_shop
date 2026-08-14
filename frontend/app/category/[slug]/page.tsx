import { fetchProducts } from "lib/api";
import { SearchCatalogView } from "components/search/search-catalog-view";

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const rawSlug = params.slug;
  const formattedTitle = rawSlug.replace(/-/g, " ").toUpperCase();
  return {
    title: `${formattedTitle} | SKIPD Store`,
    description: `Explore premium ${formattedTitle} with instant shipping and 1-year official warranty.`,
  };
}

export default async function DedicatedCategoryPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const slug = params.slug.toLowerCase();

  // Mapping slugs to human-friendly subcategory titles and search queries
  const categoryConfig: Record<string, { title: string; query: string; icon: string }> = {
    // Mobiles & Accessories
    smartphones: { title: "Smartphones & Basic Mobiles", query: "phone", icon: "📱" },
    "mobile-cases": { title: "Mobile Cases & Covers", query: "case", icon: "📱" },
    chargers: { title: "Fast Chargers & Cables", query: "charger", icon: "🔌" },
    "power-banks": { title: "Power Banks & Wireless Charging Pads", query: "power", icon: "⚡" },

    // Laptops & Accessories
    "gaming-laptops": { title: "Gaming & Performance Laptops", query: "laptop", icon: "💻" },
    ultrabooks: { title: "Thin & Light Ultrabooks", query: "macbook", icon: "💻" },
    backpacks: { title: "Laptop Sleeves & Backpacks", query: "bag", icon: "🎒" },
    "wireless-mice": { title: "Wireless Mice & Keyboards", query: "mouse", icon: "🖱️" },

    // TV & Home Cinema
    "4k-smart-tvs": { title: "4K Ultra HD Smart TVs", query: "tv", icon: "📺" },
    soundbars: { title: "Home Theatre Soundbars & Audio", query: "speaker", icon: "🔊" },
    "streaming-boxes": { title: "Streaming Sticks & Media Players", query: "streaming", icon: "📺" },

    // Audio
    "anc-headphones": { title: "Active ANC Headphones & Headsets", query: "headphones", icon: "🎧" },
    "tws-earbuds": { title: "True Wireless Earbuds (TWS)", query: "earbuds", icon: "🎧" },
    "bluetooth-speakers": { title: "Portable Bluetooth Speakers", query: "speaker", icon: "🔊" },

    // Camera & Drones
    drones: { title: "RC 4K Camera Pro Drones & Quadcopters", query: "drone", icon: "🛸" },
    "dslr-cameras": { title: "DSLR & Mirrorless Cameras", query: "camera", icon: "📷" },
    "action-gimbals": { title: "Action Cameras & Handheld Gimbals", query: "gimbal", icon: "📷" },

    // Computer Accessories
    "ssds-drives": { title: "External SSDs & High-Speed Hard Drives", query: "ssd", icon: "💾" },
    "usb-hubs": { title: "USB Type-C Multiport Hubs & Adapters", query: "hub", icon: "🔌" },
    "webcams-mics": { title: "Full HD Webcams & Studio Microphones", query: "webcam", icon: "🎙️" },

    // Smart Tech
    smartwatches: { title: "Smartwatches & Fitness Activity Bands", query: "watch", icon: "⌚" },
    "smart-lighting": { title: "Smart Home Lighting, Plugs & Security", query: "light", icon: "💡" }
  };

  const config = categoryConfig[slug] || {
    title: `${slug.replace(/-/g, " ").toUpperCase()} Collection`,
    query: slug,
    icon: "🛍️"
  };

  // Fetch products (If slug is 'all', 'all-categories', or 'catalog', return ALL products dynamically!)
  const isAllCategory = ["all", "all-categories", "catalog", "more"].includes(slug);
  let products = isAllCategory
    ? await fetchProducts()
    : await fetchProducts({ search: config.query });

  if (!isAllCategory && products.length < 2) {
    const allProducts = await fetchProducts();
    const filtered = allProducts.filter(
      (p) =>
        p.title.toLowerCase().includes(config.query.toLowerCase()) ||
        p.category?.name?.toLowerCase().includes(config.query.toLowerCase()) ||
        p.tags?.some((t) => t.toLowerCase().includes(config.query.toLowerCase()))
    );
    products = filtered.length > 0 ? filtered : allProducts;
  }

  const fullDisplayTitle = `${config.icon} ${config.title}`;

  return (
    <div className="bg-[#FAFAFA] min-h-screen">
      <SearchCatalogView products={products} collectionTitle={fullDisplayTitle} />
    </div>
  );
}
