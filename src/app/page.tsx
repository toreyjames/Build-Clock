'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Redirect to radar + opportunity tracker workspace
export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/radar");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-400">Loading OT Vantage...</p>
      </div>
    </div>
  );
}
