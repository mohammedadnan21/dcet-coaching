import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SessionProvider } from "@/components/providers/session-provider";
import { Toaster } from "@/components/ui/toaster";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Wintrix Academy | DCET Mentorship by Rank 48 (RVCE)",
  description: "Wintrix Academy - Premier DCET coaching by Mohammed Adnan (Rank 48, RVCE). Expert guidance, strategy, and success for DCET preparation.",
  keywords: "Wintrix Academy, DCET coaching, DCET preparation, Karnataka DCET, engineering entrance, Mohammed Adnan, Rank 48, RVCE",
  authors: [{ name: "Mohammed Adnan" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Wintrix Academy",
  },
  icons: [
    { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
  ],
  openGraph: {
    title: "Wintrix Academy | DCET Mentorship by Rank 48 (RVCE)",
    description: "Wintrix Academy - Guidance. Strategy. Success. DCET mentorship by Rank 48 (RVCE).",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#d97706",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          {children}
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}
