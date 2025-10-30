"use client";
import { useEffect, useState } from 'react';

export default function AdminPage() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const [users, setUsers] = useState<any[]>([]);
  const [subs, setSubs] = useState<any[]>([]);

  async function load() {
    const u = await fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } });
    if (u.ok) setUsers((await u.json()).users);
    const w = await fetch('/api/admin/webhooks', { headers: { Authorization: `Bearer ${token}` } });
    if (w.ok) setSubs((await w.json()).subscriptions);
  }

  useEffect(()=>{ if(token) load(); }, [token]);

  async function toggleAdmin(id: string, isAdmin: boolean) {
    await fetch(`/api/admin/users/${id}/admin`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ isAdmin: !isAdmin }) });
    load();
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div>
        <h2 className="font-semibold mb-2">Users</h2>
        <div className="bg-white rounded shadow divide-y">
          {users.map(u => (
            <div key={u.id} className="p-3 flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">{u.username || u.walletAddress}</div>
                <div className="text-xs text-zinc-600">{u.id}</div>
              </div>
              <button onClick={()=>toggleAdmin(u.id, u.isAdmin)} className="text-xs bg-zinc-900 text-white rounded px-2 py-1">{u.isAdmin ? 'Revoke Admin' : 'Make Admin'}</button>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h2 className="font-semibold mb-2">Webhook Subscriptions</h2>
        <div className="bg-white rounded shadow divide-y">
          {subs.map(s => (
            <div key={s.id} className="p-3">
              <div className="text-sm">{s.url}</div>
              <div className="text-xs text-zinc-600">{s.event}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


