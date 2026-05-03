"use client";

import { WifiOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-20 left-10 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl" />

      <div className="text-center relative max-w-md">
        <Link href="/" className="inline-block mb-8">
          <Image
            src="/icons/icon-192x192.png"
            alt="Wintrix Academy"
            width={80}
            height={80}
            className="mx-auto rounded-2xl"
          />
        </Link>

        <div className="w-20 h-20 bg-amber-900/25 rounded-full flex items-center justify-center mx-auto mb-6">
          <WifiOff className="w-10 h-10 text-amber-500" />
        </div>

        <h1 className="text-2xl font-bold text-white mb-3">You&apos;re Offline</h1>
        <p className="text-stone-400 mb-8 leading-relaxed">
          It looks like you&apos;ve lost your internet connection. Check your Wi-Fi or mobile data and try again.
        </p>

        <button
          onClick={() => typeof window !== "undefined" && window.location.reload()}
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-medium rounded-lg transition-all"
        >
          Try Again
        </button>

        <p className="mt-8 text-stone-600 text-sm">
          Wintrix Academy &mdash; Guidance. Strategy. Success.
        </p>
      </div>
    </div>
  );
}
