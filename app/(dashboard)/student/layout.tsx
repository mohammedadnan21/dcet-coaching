"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { ChatbotWidget } from "@/components/chatbot-widget";
import { useSessionCheck } from "@/hooks/use-session-check";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, status } = useSessionCheck();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login?role=student");
    } else if (status === "authenticated") {
      const role = session?.user?.role;
      if (role !== "STUDENT" && role !== "ADMIN") {
        router.replace("/");
      } else if (session?.user?.status !== "APPROVED") {
        router.replace("/verify-queue");
      }
    }
  }, [status, session, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen bg-stone-950">
        <Sidebar role="student" />
        <main className="flex-1 p-4 pt-16 lg:pt-8 lg:p-8 lg:ml-0">
          <div className="space-y-6 animate-pulse">
            <div className="h-24 bg-gradient-to-r from-amber-900/30 to-amber-800/20 rounded-2xl" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-24 bg-stone-900 rounded-xl border border-amber-900/10" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="flex min-h-screen bg-stone-950">
      <Sidebar role="student" />
      <main className="flex-1 p-4 pt-16 lg:pt-8 lg:p-8 lg:ml-0">{children}</main>
      <ChatbotWidget />
    </div>
  );
}
