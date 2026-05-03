"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { useSessionCheck } from "@/hooks/use-session-check";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, status } = useSessionCheck();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login?role=admin");
    } else if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.replace("/");
    }
  }, [status, session, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen bg-stone-950">
        <Sidebar role="admin" />
        <main className="flex-1 p-4 pt-16 lg:pt-8 lg:p-8 lg:ml-0">
          <div className="space-y-6 animate-pulse">
            <div className="h-8 w-48 bg-stone-800 rounded-lg" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-stone-900 rounded-xl border border-amber-900/10" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!session || session.user?.role !== "ADMIN") return null;

  return (
    <div className="flex min-h-screen bg-stone-950">
      <Sidebar role="admin" />
      <main className="flex-1 p-4 pt-16 lg:pt-8 lg:p-8 lg:ml-0">{children}</main>
    </div>
  );
}
