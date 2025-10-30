import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { headers } from 'next/headers';
import ContextProvider from '@/context';
import Background from '@/components/Background';
import HeaderWallet from '@/components/HeaderWallet';
import profileImage from '@/assets/profile.png';
import Image from 'next/image';

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
        <header className="sticky top-0 z-40 relative bg-transparent">
          <div className="max-w-6xl mx-auto px-4 py-3 relative">
            <div className="px-3 py-2 flex items-center justify-between relative z-10">
              <a href="/" className="font-semibold tracking-wide font-handjet text-3xl md:text-4xl text-zinc-100">⚔️ tales of Chains [Beta]</a>
              <nav className="flex items-center gap-6 md:gap-8 text-lg md:text-xl font-handjet text-zinc-100">
                <a href="/characters" className="hover:underline">Characters</a>
                <a href="/profile" className="hover:underline">Profile</a>
                <a href="/battles" className="hover:underline">Battles</a>
                <a href="/leaderboard" className="hover:underline">Leaderboard</a>
                <a href="/iforge" className="hover:underline">iForge</a>
              <HeaderWallet />
              </nav>
            </div>
            {/* Floating profile image outside the white container */}
            <Image
              src={profileImage}
              alt="profile"
              width={96}
              height={96}
              priority
              className="absolute right-0 top-1 md:right-2 md:top-0 w-16 h-16 md:w-24 md:h-24 object-cover drop-shadow-lg z-20"
            />
          </div>
        </header>
        <ContextProvider cookies={cookies}>
          {children}
        </ContextProvider>
      </body>
    </html>
  );
}
