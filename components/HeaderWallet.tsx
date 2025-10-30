"use client";

import { useEffect, useRef, useState } from 'react';
import profileImage from '@/assets/profile.png';
import { getNativeBalanceLabel } from '@/utils/viemClient';

function shorten(addr?: string | null) {
  if (!addr) return '';
  if (addr.length <= 10) return addr;
  return addr.slice(0, 4) + '...' + addr.slice(-6);
}

export default function HeaderWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [balanceEth, setBalanceEth] = useState<string>('0.000 ETH');
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('walletAddress') : null;
    if (stored) setAddress(stored);
    if (stored) {
      getNativeBalanceLabel(stored).then(setBalanceEth).catch(() => {});
    }
  }, []);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  function logout() {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('walletAddress');
    } catch {}
    location.href = '/';
  }

  return (
    <div className="flex items-center gap-3" ref={menuRef}>
      <button
        className="px-3 py-1.5 rounded-md text-sm font-semibold border border-zinc-300 dark:border-zinc-700 bg-white/70 dark:bg-zinc-900/70 backdrop-blur hover:bg-white/90 dark:hover:bg-zinc-900"
        title={address || 'Wallet balance'}
      >
        {balanceEth}
      </button>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-9 h-9 rounded-full overflow-hidden border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 flex items-center justify-center"
        title={address ? shorten(address) : 'Profile'}
      >
        {/* Try /profile.png first, fallback to /file.svg */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={(profileImage as any).src || '/profile.png'}
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/file.svg'; }}
          alt="profile"
          className="w-full h-full object-cover"
        />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-40 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-lg z-50">
          <a href="/profile" className="block px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800">Profile</a>
          <button onClick={logout} className="w-full text-left block px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800">Logout</button>
        </div>
      )}
    </div>
  );
}


