"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DebugBattleButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch('/api/battles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: '0xdebug',
          durationMinutes: 1,
          allOut: true,
          realm: 'Debug Arena',
          prizeAmount: null,
          prizeCurrency: null
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to create battle');
      const id = data?.battleId || data?.battle?.id;
      if (id) router.push(`/battles/${id}`);
    } catch (e) {
      console.error(e);
      alert('Failed to start debug battle.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="px-3 py-1.5 rounded-md text-sm font-medium bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
      title="Start a 1-minute all-out battle with all characters"
    >
      {loading ? 'Starting…' : 'Debug: All-Out (1m)'}
    </button>
  );
}


