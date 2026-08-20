import { ShoppingCartIcon } from "@heroicons/react/24/outline";

export default function OpenCart({
  quantity = 0,
  total = 0,
  isLoggedIn = false,
}: {
  className?: string;
  quantity?: number;
  total?: number;
  isLoggedIn?: boolean;
}) {
  const formattedTotal = `₹${total.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

  return (
    <div className="flex flex-col items-center justify-center cursor-pointer group px-2 py-1 rounded-xl hover:bg-gray-100/90 transition">
      {/* 🛒 Cart Icon Container */}
      <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/80 group-hover:bg-emerald-100 transition-colors shadow-2xs">
        <ShoppingCartIcon className="h-5 w-5 text-emerald-800 transition-transform group-hover:scale-110" />

        {/* 🔴 Cart Badge Count - ONLY SHOWN WHEN CUSTOMER IS LOGGED IN */}
        {isLoggedIn && (
          <div className="absolute -top-1.5 -right-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-600 text-[9px] font-black text-white shadow-xs animate-in zoom-in duration-200">
            {quantity}
          </div>
        )}
      </div>

      {/* 💰 Live Cart Subtotal Amount UNDERNEATH Cart icon - ONLY SHOWN WHEN CUSTOMER IS LOGGED IN */}
      {isLoggedIn && (
        <span className="font-black text-[10px] text-gray-900 group-hover:text-emerald-700 transition tracking-tight mt-0.5">
          {formattedTotal}
        </span>
      )}
    </div>
  );
}
