"use client";

import { useEffect, useCallback, useRef } from "react";
import { signOut, useSession } from "next-auth/react";
import { toast } from "@/hooks/use-toast";

export function useSessionCheck() {
  const { data: session, status } = useSession();
  const hasChecked = useRef(false);

  const checkSession = useCallback(async () => {
    if (status !== "authenticated" || !session) return;

    try {
      const response = await fetch("/api/auth/check-session");
      const data = await response.json();

      if (!data.valid) {
        // Only sign out for definitive reasons, not transient errors
        if (data.reason === "error") {
          // Transient DB error — don't sign out, retry next poll
          return;
        }
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
    if (status !== "authenticated") return;

    // Delay first check by 3s to not block initial page load
    const initialDelay = setTimeout(() => {
      if (!hasChecked.current) {
        hasChecked.current = true;
        checkSession();
      }
    }, 3000);

    // Then check every 2 minutes
    const interval = setInterval(checkSession, 120000);

    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
    };
  }, [checkSession, status]);

  return { session, status };
}
