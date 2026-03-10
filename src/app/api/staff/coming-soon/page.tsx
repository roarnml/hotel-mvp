"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ComingSoon() {
  const router = useRouter();

  useEffect(() => {
    // Optional: redirect to home after 3 seconds
    const timer = setTimeout(() => router.push("/"), 3000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <h1 className="text-4xl font-bold">Coming Soon 🚧</h1>
    </div>
  );
}
