import { ShoppingCartIcon } from "@heroicons/react/24/outline";

export default function OpenCart({
  quantity = 0,
  total = 0,
}: {
  className?: string;
  quantity?: number;
  total?: number;
}) {
  const formattedTotal = `₹${total.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  return (
    <div className="flex items-center gap-2 cursor-pointer group">
      {/* 💰 Live Cart Subtotal Amount to the LEFT of Cart icon */}
      <span className="font-black text-xs sm:text-sm text-gray-900 group-hover:text-emerald-700 transition">
        {formattedTotal}
      </span>

      {/* 🛒 Cart Button Icon with Red Badge */}
      <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 border border-gray-200 group-hover:bg-gray-200 text-gray-900 transition-colors shadow-2xs">
        <ShoppingCartIcon className="h-5 w-5 text-gray-900 transition-transform group-hover:scale-110" />

        <div className="absolute -top-1.5 -right-1.5 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-red-500 text-[9px] sm:text-[10px] font-black text-white shadow-xs">
          {quantity}
        </div>
      </div>
    </div>
  );
}
