"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function UserReturnsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/account?tab=returns");
  }, [router]);

  return (
    <div className="bg-[#F8FAFC] min-h-screen py-10 px-4 flex items-center justify-center font-sans text-gray-400 text-xs font-bold">
      Redirecting to 24-Hour Return Window Policy...
    </div>
  );
}
