"use client";

import { useEffect, useState } from 'react';
import { getNativeBalanceLabel } from '@/utils/viemClient';

function shorten(addr?: string | null) {
  if (!addr) return '';
  if (addr.length <= 10) return addr;
  return addr.slice(0, 4) + '...' + addr.slice(-6);
}

export default function HeaderWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [balanceEth, setBalanceEth] = useState<string>('0.000 ETH');

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('walletAddress') : null;
    if (stored) setAddress(stored);
    if (stored) {
      getNativeBalanceLabel(stored).then(setBalanceEth).catch(() => {});
    }
  }, []);

  return (
    <div className="flex items-center gap-2">
      <button
        className="px-3 py-1.5 rounded-md text-sm font-semibold border border-zinc-300 dark:border-zinc-700 bg-zinc-200/80 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-800"
        title={address || 'Wallet balance'}
      >
        {balanceEth}
      </button>
    </div>
  );
}


