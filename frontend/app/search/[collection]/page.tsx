import { fetchProducts } from "lib/api";
import { SearchCatalogView } from "components/search/search-catalog-view";

export async function generateMetadata(props: {
  params: Promise<{ collection: string }>;
}) {
  const params = await props.params;
  return {
    title: `${params.collection.toUpperCase()} Collection | SKIPD Commerce`,
    description: `Browse all items in ${params.collection} collection.`,
  };
}

export default async function CategoryPage(props: {
  params: Promise<{ collection: string }>;
}) {
  const params = await props.params;
  const collectionSlug = params.collection;
  let products = await fetchProducts({ category: collectionSlug });
  if (products.length < 2) {
    const allProds = await fetchProducts();
    const matched = allProds.filter(p =>
      p.category?.slug === collectionSlug ||
      p.tags?.some(t => t.toLowerCase() === collectionSlug.toLowerCase())
    );
    products = matched.length > 0 ? matched : allProds;
  }

  return <SearchCatalogView products={products} />;
}
