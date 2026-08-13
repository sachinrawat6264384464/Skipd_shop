import clsx from "clsx";
import { Suspense } from "react";
import { fetchCategories } from "lib/api";
import FilterList from "./filter";

async function CollectionList() {
  const categories = await fetchCategories();
  const collections = [
    {
      title: "All Products",
      path: "/search"
    },
    ...categories.map(cat => ({
      title: cat.name,
      path: `/search/${cat.slug}`
    }))
  ];
  return <FilterList list={collections} title="Categories" />;
}

const skeleton = "mb-3 h-4 w-5/6 animate-pulse rounded-sm bg-gray-200";

export default function Collections() {
  return (
    <Suspense
      fallback={
        <div className="col-span-2 hidden h-[400px] w-full flex-none py-4 lg:block">
          <div className={skeleton} />
          <div className={skeleton} />
          <div className={skeleton} />
          <div className={skeleton} />
        </div>
      }
    >
      <CollectionList />
    </Suspense>
  );
}
