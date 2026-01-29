"use client";

import { useEffect, useCallback } from "react";
import { signOut, useSession } from "next-auth/react";
import { toast } from "@/hooks/use-toast";

export function useSessionCheck() {
  const { data: session, status } = useSession();

  const checkSession = useCallback(async () => {
    if (status !== "authenticated" || !session) return;

    try {
      const response = await fetch("/api/auth/check-session");
      const data = await response.json();

      if (!data.valid) {
        if (data.reason === "logged_out") {
          toast({
            title: "Logged Out",
            description: data.message || "You have been logged out from another device.",
            variant: "destructive",
          });
        }
        await signOut({ callbackUrl: "/login" });
      }
    } catch (error) {
      console.error("Session check error:", error);
    }
  }, [session, status]);

  useEffect(() => {
    // Check session immediately
    checkSession();

    // Check session every 30 seconds
    const interval = setInterval(checkSession, 30000);

    return () => clearInterval(interval);
  }, [checkSession]);

  return { session, status };
}
