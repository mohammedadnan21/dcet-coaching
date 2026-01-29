import type { Metadata } from "next";
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
  title: "DCET Coaching | Rank 48 - Mohammed Adnan",
  description: "Premier DCET coaching by Mohammed Adnan (Rank 48). Get expert guidance for DCET preparation with comprehensive courses, mock tests, and personalized mentoring.",
  keywords: "DCET coaching, DCET preparation, Karnataka DCET, engineering entrance, Mohammed Adnan, Rank 48, RVCE",
  authors: [{ name: "Mohammed Adnan" }],
  openGraph: {
    title: "DCET Coaching | Rank 48 - Mohammed Adnan",
    description: "Premier DCET coaching by Mohammed Adnan (Rank 48). Expert guidance for DCET preparation.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
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
