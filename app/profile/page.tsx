"use client";
import { useEffect, useState } from 'react';

type Character = { id: string; name: string; superpowers: string[]; weaknesses: string[]; avatarImageUrl?: string | null };

export default function ProfilePage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selected, setSelected] = useState<Character | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  async function load() {
    const res = await fetch('/api/characters', { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) return;
    const data = await res.json();
    setCharacters(data.characters);
  }

  useEffect(() => { if (token) load(); }, [token]);

  function onPick(c: Character) {
    setSelected(c);
    setShowHelp(true);
    setTimeout(() => setShowHelp(false), 2500);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-semibold mb-2">Your Characters</h2>
        <ul className="grid md:grid-cols-2 gap-3">
          {characters.map((c)=> (
            <li key={c.id} className="bg-white rounded shadow p-3 cursor-pointer hover:ring-1" onClick={() => onPick(c)}>
              <div className="flex items-center gap-3">
                {c.avatarImageUrl && <img src={c.avatarImageUrl} alt="avatar" className="w-16 h-16 rounded object-cover" />}
                <div>
                  <div className="font-semibold">{c.name}</div>
                  <div className="text-xs text-zinc-600">Powers: {c.superpowers.join(', ')}</div>
                  <div className="text-xs text-zinc-600">Weak: {c.weaknesses.join(', ')}</div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {selected && (
        <div className="bg-white rounded shadow p-4">
          <div className="flex items-start gap-4">
            {selected.avatarImageUrl && (
              <img src={selected.avatarImageUrl} alt="avatar" className="w-28 h-28 rounded object-cover" />
            )}
            <div>
              <div className="text-lg font-semibold">{selected.name}</div>
              <div className="text-xs text-zinc-600 mt-1">Powers: {selected.superpowers.join(', ')}</div>
              <div className="text-xs text-zinc-600">Weaknesses: {selected.weaknesses.join(', ')}</div>
            </div>
          </div>
          {showHelp && (
            <div className="mt-3 text-xs bg-zinc-50 border rounded p-2">Tip: You’re viewing a saved card. Click another card to switch.</div>
          )}
        </div>
      )}
    </div>
  );
}


