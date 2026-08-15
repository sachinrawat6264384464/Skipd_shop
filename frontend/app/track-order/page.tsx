"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TrackOrderPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/account?tab=track-order");
  }, [router]);

  return (
    <div className="bg-[#FAFAFA] min-h-screen py-10 px-4 flex items-center justify-center font-sans text-gray-400 text-xs font-bold">
      Redirecting to Live Shipment &amp; Order Tracker...
    </div>
  );
}
