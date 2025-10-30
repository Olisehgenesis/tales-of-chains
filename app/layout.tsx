import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { headers } from 'next/headers';
import ContextProvider from '@/context';
import Background from '@/components/Background';
import HeaderWallet from '@/components/HeaderWallet';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "tales of Chains [Beta]",
  description: "Create Heroes & Villains. Unleash the carnage.",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const h = await headers();
  const cookies = h.get('cookie');
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Handjet:wght@100..900&display=swap" rel="stylesheet" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased text-zinc-900 dark:text-zinc-100`}>
        <Background />
        <header className="border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-40 bg-white dark:bg-zinc-950">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <a href="/" className="font-semibold tracking-wide font-handjet text-xl">⚔️ tales of Chains [Beta]</a>
            <nav className="flex items-center gap-4 text-sm">
              <a href="/characters" className="hover:underline">Characters</a>
              <a href="/profile" className="hover:underline">Profile</a>
              <a href="/battles" className="hover:underline">Battles</a>
              <a href="/leaderboard" className="hover:underline">Leaderboard</a>
              <a href="/iforge" className="hover:underline">iForge</a>
              <HeaderWallet />
            </nav>
          </div>
        </header>
        <ContextProvider cookies={cookies}>
          {children}
        </ContextProvider>
      </body>
    </html>
  );
}
