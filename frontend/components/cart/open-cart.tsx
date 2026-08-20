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
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

  return (
    <div className="flex flex-col items-center justify-center cursor-pointer group px-2 py-0.5 rounded-xl hover:bg-gray-100/80 transition">
      {/* 🛒 Cart Icon with Badge */}
      <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/80 group-hover:bg-emerald-100 transition-colors shadow-2xs">
        <ShoppingCartIcon className="h-4.5 w-4.5 text-emerald-800 transition-transform group-hover:scale-110" />

        <div className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-black text-white shadow-xs">
          {quantity}
        </div>
      </div>

      {/* 💰 Live Cart Subtotal Amount UNDERNEATH (bottom) Cart icon */}
      <span className="font-black text-[10px] text-gray-900 group-hover:text-emerald-700 transition tracking-tight mt-0.5">
        {formattedTotal}
      </span>
    </div>
  );
}
