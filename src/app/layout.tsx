import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { authClient } from "@/lib/auth/client";
import { NeonAuthUIProvider } from "@neondatabase/auth/react";
import { SyncTimezone } from "@/components/sync-timezone";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CanvasMerge",
  description:
    "Easily view and keep track of all your assignments accross different campuses.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NeonAuthUIProvider
          authClient={authClient}
          redirectTo="/dashboard"
          emailOTP
          social={{ providers: ["google"] }}
        >
          <div className="fixed inset-0 -z-10 bg-linear-to-br from-slate-50 via-sky-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950" />
          <SyncTimezone />
          <header>
            <Navbar />
          </header>
          {children}
        </NeonAuthUIProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
