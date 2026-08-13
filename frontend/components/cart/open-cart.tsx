import { ShoppingCartIcon } from "@heroicons/react/24/outline";

export default function OpenCart({
  quantity,
}: {
  className?: string;
  quantity?: number;
}) {
  return (
    <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 border border-gray-200 hover:bg-gray-200 text-gray-900 transition-colors shadow-2xs cursor-pointer">
      <ShoppingCartIcon className="h-5 w-5 text-gray-900 transition-transform hover:scale-110" />

      {quantity && quantity > 0 ? (
        <div className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-extrabold text-white shadow-xs">
          {quantity}
        </div>
      ) : null}
    </div>
  );
}
