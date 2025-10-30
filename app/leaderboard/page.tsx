"use client";
import { useEffect, useState } from 'react';

export default function LeaderboardPage() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const [rows, setRows] = useState<any[]>([]);

  useEffect(()=>{
    if(!token) return;
    fetch('/api/users/leaderboard', { headers: { Authorization: `Bearer ${token}` } })
      .then(r=>r.json()).then(d=> setRows(d.leaderboard || []));
  }, [token]);

  return (
    <div>
      <h1 className="text-xl font-semibold mb-3">Leaderboard</h1>
      <div className="bg-white rounded shadow overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-zinc-50 text-left">
            <tr>
              <th className="p-2">#</th>
              <th className="p-2">User</th>
              <th className="p-2">Score</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i)=> (
              <tr key={r.id} className="border-t">
                <td className="p-2">{i+1}</td>
                <td className="p-2">{r.username || r.walletAddress}</td>
                <td className="p-2">{r.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


