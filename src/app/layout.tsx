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
    "Easily view and keep track of all your assignments across different campuses.",
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
          {/* Background with blurred circles */}
          <div className="fixed inset-0 -z-10 bg-linear-to-br from-slate-50 via-sky-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950" />
          <div className="fixed inset-0 -z-10 overflow-hidden">
            <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-purple-400/40 blur-[120px]" />
            <div className="absolute top-[40%] -right-40 h-[500px] w-[500px] rounded-full bg-sky-400/30 blur-[120px]" />
            <div className="absolute bottom-[-200px] left-[30%] h-[500px] w-[500px] rounded-full bg-indigo-400/40 blur-[120px]" />
          </div>
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
