"use client";
import { use, useEffect, useMemo, useState } from 'react';

export default function BattleDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [battle, setBattle] = useState<any>(null);

  async function load() {
    const res = await fetch(`/api/battles/${id}`, { cache: 'no-store' });
    if (res.ok) setBattle(await res.json().then(d=>d.battle));
  }

  useEffect(()=>{ load(); const i=setInterval(load, 3000); return ()=>clearInterval(i); }, [id]);

  // Build a simple single-elimination bracket from participants and messages
  const bracket = useMemo(() => {
    if (!battle) return null;
    type Part = { id: string; name: string };
    const parts: Part[] = (battle.participants || []).map((p: any) => ({ id: p.id as string, name: (p.character?.name as string) || 'Unknown' }));
    if (parts.length < 2) return null;
    // Pair sequentially for round 1
    const round1: Array<{ a: Part; b: Part | null; winner: string | null }>=[];
    for (let i = 0; i < parts.length; i += 2) {
      round1.push({ a: parts[i], b: parts[i+1] || null, winner: null });
    }
    // Decide winners from messages when a participant "falls"
    const msgs = (battle.messages || []) as Array<{ content: string; contentJson?: string | null }>;
    function winnerBetween(aId: string, bId: string): string | null {
      for (const m of msgs) {
        try {
          const cj = m.contentJson ? JSON.parse(m.contentJson) : null;
          if (cj && cj.actorId && cj.targetId) {
            const pair = new Set([cj.actorId, cj.targetId]);
            if (pair.has(aId) && pair.has(bId)) {
              if (typeof cj.outcome === 'string' && cj.outcome.toLowerCase().includes('falls')) {
                return cj.targetId; // target fell → other wins
              }
            }
          }
        } catch {}
      }
      return null;
    }
    round1.forEach((m) => {
      if (!m.b) { m.winner = m.a.id; return; }
      const w = winnerBetween(m.a.id, m.b.id);
      if (w) m.winner = w === m.a.id ? m.b.id : m.a.id;
    });
    // Build subsequent rounds by pairing winners (unknown winners remain null)
    const rounds: any[] = [round1];
    let prev = round1;
    while (prev.length > 1) {
      const next: Array<{ a: Part; b: Part | null; winner: string | null }>=[];
      for (let i = 0; i < prev.length; i += 2) {
        const left = prev[i];
        const right = prev[i+1];
        const A = left ? (left.winner ? (parts.find((p: Part)=>p.id===left.winner) || left.a) : left.a) : { id: 'tbd', name: 'TBD' } as Part;
        const B = right ? (right.winner ? (parts.find((p: Part)=>p.id===right.winner) || right.a) : right?.a) : null;
        next.push({ a: A, b: B, winner: null });
      }
      rounds.push(next);
      prev = next;
    }
    return rounds;
  }, [battle]);

  function openMatchStory(aId: string, bId: string) {
    if (!battle) return;
    const lines: string[] = [];
    for (const m of battle.messages || []) {
      try {
        const cj = m.contentJson ? JSON.parse(m.contentJson) : null;
        if (cj && cj.actorId && cj.targetId) {
          const pair = new Set([cj.actorId, cj.targetId]);
          if (pair.has(aId) && pair.has(bId)) {
            lines.push(cj.long || m.content);
          }
        }
      } catch {
        // fallback to plain content
      }
    }
    alert(lines.length ? lines.join('\n\n') : 'No story available yet for this pairing.');
  }

  if(!battle) return <div>Loading…</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">{battle.universe}</h1>
          <div className="text-sm text-zinc-600">{battle.status} {battle.outcome ? `• ${battle.outcome}`: ''}</div>
        </div>
      </div>
      <div className="space-y-2">
        {bracket && (
          <div className="mb-6 overflow-x-auto">
            <div className="flex items-start gap-6">
              {bracket.map((round: any[], idx: number) => (
                <div key={idx} className="min-w-[220px]">
                  <div className="text-xs font-semibold text-zinc-500 mb-2">Round {idx+1}</div>
                  <div className="flex flex-col gap-4">
                    {round.map((m, i) => (
                      <button
                        key={i}
                        onClick={() => m.a && m.b && openMatchStory(m.a.id, m.b.id)}
                        className="w-full text-left bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-3 hover:shadow-sm"
                        title="Click to view story between this pairing"
                      >
                        <div className="text-sm font-medium">{m.a?.name || 'TBD'}</div>
                        <div className="text-sm">vs</div>
                        <div className="text-sm font-medium">{m.b?.name || 'TBD'}</div>
                        {m.winner && (<div className="mt-1 text-xs text-green-600">Advances: {(battle.participants.find((p:any)=>p.id===m.winner)?.character?.name) || 'TBD'}</div>)}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {battle.messages.sort((a:any,b:any)=>a.turn-b.turn).map((m:any)=> (
          <div key={m.id} className="bg-white p-3 rounded border">
            <div className="text-xs text-zinc-500">Turn {m.turn}</div>
            <div>{m.content}</div>
          </div>
        ))}
      </div>
    </div>
  );
}


