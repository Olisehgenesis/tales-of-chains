"use client";
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const [featured, setFeatured] = useState<any>(null);

  useEffect(() => {
    fetch('/api/characters/random').then(r=>r.json()).then(d=>setFeatured(d.character ?? null)).catch(()=>{});
  }, []);

  async function startQuick1v1(primaryId?: string) {
    try {
      const res = await fetch('/api/battles/quick1v1', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ primaryId }) });
      const data = await res.json();
      if (res.ok && data.battleId) location.href = `/battles/${data.battleId}`;
    } catch {}
  }
  return (
    <section className="relative">
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight font-handjet text-zinc-100">
          Create Heroes ⚡ and Villains 💀. Give them superpowers. Let the carnage begin 🔥
        </h1>
        <p className="text-zinc-200 text-lg">
          The games are fair — ruled by an AI Supreme called 🍪 Cookie. We know the name isn’t scary, but trust us: Cookie is your worst nightmare. Never challenge them to a duel ⚠️
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild className="btn-effect btn-style-5">
            <a href="/profile">Create Characters</a>
          </Button>
          <Button asChild className="btn-effect btn-style-5">
            <a href="/battles">Battle Your Tale</a>
          </Button>
        </div>
        {featured && (
          <div className="mt-8 p-4 bg-zinc-100/80 dark:bg-zinc-900/60 rounded-lg max-w-xl">
            <div className="flex items-start gap-4">
              {featured.avatarImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={featured.avatarImageUrl} alt={featured.name} className="w-20 h-20 rounded object-cover" />
              ) : (
                <div className="w-20 h-20 rounded bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">{featured.name?.[0]}</div>
              )}
              <div className="min-w-0">
                <div className="font-semibold text-xl">{featured.name}</div>
                {(featured.storyTitle || featured.synopsis) && (
                  <div className="mt-1">
                    <div className="flex items-center gap-2">
                      <div className="text-xs uppercase tracking-wide text-zinc-500">Origin</div>
                      {featured.alignment && (
                        <span className="px-2 py-0.5 text-[10px] rounded bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">{featured.alignment}</span>
                      )}
                    </div>
                    {featured.storyTitle && (
                      <div className="text-sm font-medium">{featured.storyTitle}</div>
                    )}
                    {featured.synopsis && (
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3">{featured.synopsis}</p>
                    )}
                  </div>
                )}
                {(featured.superpowers?.length || 0) > 0 && (
                  <div className="mt-2">
                    <div className="text-xs uppercase tracking-wide text-green-600">Strengths</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {featured.superpowers.slice(0,4).map((s:string, i:number)=> (
                        <span key={i} className="px-2 py-0.5 text-xs rounded bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                {(featured.weaknesses?.length || 0) > 0 && (
                  <div className="mt-2">
                    <div className="text-xs uppercase tracking-wide text-red-600">Weaknesses</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {featured.weaknesses.slice(0,3).map((w:string, i:number)=> (
                        <span key={i} className="px-2 py-0.5 text-xs rounded bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300">{w}</span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="mt-3 flex gap-2">
                  <Button className="btn-effect btn-style-5" onClick={() => startQuick1v1(featured.id)}>Battle 1v1 ⚔️</Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

