"use client";
import { useState } from 'react';

export function WalletLogin() {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function login() {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`/auth/wallet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address })
      });
      if (!res.ok) throw new Error('Failed to login');
      const data = await res.json();
      localStorage.setItem('token', data.token);
      location.href = '/profile';
    } catch (e: any) {
      setError(e.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm">Wallet Address</label>
      <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="0x..."
             className="w-full rounded border px-3 py-2" />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button onClick={login} disabled={loading || !address}
              className="w-full bg-black text-white rounded px-3 py-2 disabled:opacity-50">
        {loading ? 'Connecting…' : 'Connect Wallet'}
      </button>
    </div>
  );
}


