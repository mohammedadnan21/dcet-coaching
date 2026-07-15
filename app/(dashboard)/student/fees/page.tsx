"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function FeesRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/student/profile?tab=fees");
  }, [router]);

  return null;
}
