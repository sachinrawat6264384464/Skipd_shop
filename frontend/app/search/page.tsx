import { fetchProducts } from "lib/api";
import { SearchCatalogView } from "components/search/search-catalog-view";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "All Categories | E-COM Commerce",
  description: "Browse all items in our full catalog.",
};

export default async function SearchPage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const searchValue =
    (searchParams?.q as string) ||
    (searchParams?.search as string) ||
    (searchParams?.category as string) ||
    "";
  const products = await fetchProducts({ search: searchValue });

  const title = searchValue
    ? `${searchValue.toUpperCase()} Collection`
    : "All Categories & Catalog";

  return <SearchCatalogView products={products} collectionTitle={title} />;
}
