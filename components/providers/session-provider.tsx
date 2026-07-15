"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { SWRConfig } from "swr";
import { ReactNode } from "react";
import { fetcher } from "@/lib/fetcher";

interface Props {
  children: ReactNode;
}

export function SessionProvider({ children }: Props) {
  return (
    <NextAuthSessionProvider>
      <SWRConfig
        value={{
          fetcher,
          revalidateOnFocus: false,
          dedupingInterval: 30000,
          errorRetryCount: 2,
        }}
      >
        {children}
      </SWRConfig>
    </NextAuthSessionProvider>
  );
}
