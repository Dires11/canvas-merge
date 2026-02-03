import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { authClient } from "@/lib/auth/client";
import { NeonAuthUIProvider, UserButton } from "@neondatabase/auth/react";
import { SyncTimezone } from "@/components/sync-timezone";

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
          redirectTo="/"
          emailOTP
          social={{ providers: ["google"] }}
          defaultTheme="light"
        >
          <div className="fixed inset-0 -z-10 bg-linear-to-br from-slate-50 via-sky-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950" />
          <div className="fixed inset-0 -z-10 opacity-30 [background:radial-gradient(circle_at_20%_20%,rgb(152, 14, 14),transparent_45%),radial-gradient(circle_at_80%_30%,rgba(0, 4, 255, 0.3),transparent_40%),radial-gradient(circle_at_50%_80%,rgba(236,72,153,0.18),transparent_45%)]" />
          <SyncTimezone />
          <header>
            <Navbar />
          </header>
          {children}
        </NeonAuthUIProvider>
      </body>
    </html>
  );
}
