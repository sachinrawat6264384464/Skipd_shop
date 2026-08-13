import { fetchProducts } from "lib/api";
import { SearchCatalogView } from "components/search/search-catalog-view";

export const metadata = {
  title: "All Categories | SKIPD Commerce",
  description: "Browse all items in our full catalog.",
};

export default async function SearchPage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const searchValue = (searchParams?.q as string) || "";
  const products = await fetchProducts({ search: searchValue });

  return <SearchCatalogView products={products} />;
}
