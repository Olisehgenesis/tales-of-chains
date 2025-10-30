"use client";
import { useEffect, useState } from 'react';
import DebugBattleButton from '@/components/DebugBattleButton';

type Battle = {
  id: string;
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED';
  universe: string;
  realm?: string | null;
  durationMinutes: number;
  outcome?: string | null;
  minParticipants: number;
  maxParticipants: number;
  participantCount: number;
  participants: Array<{
    characterId: string;
    character: {
      id: string;
      name: string;
      avatarImageUrl?: string | null;
      avatarImageBase64?: string | null;
    };
  }>;
  scheduledStartTime?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  host?: {
    id: string;
    walletAddress?: string | null;
    username?: string | null;
  } | null;
  createdAt: string;
};

type Character = {
  id: string;
  name: string;
  avatarImageUrl?: string | null;
};

export default function BattlesPage() {
  const [battles, setBattles] = useState<Battle[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [showHostForm, setShowHostForm] = useState(false);
  
  // Host form state
  const [hostForm, setHostForm] = useState({
    realm: '',
    durationMinutes: 10,
    minParticipants: 2,
    maxParticipants: 10,
    scheduledStartTime: '',
    characterId: '',
  });

  useEffect(() => {
    loadData();
    // Try to get wallet from localStorage or context
    if (typeof window !== 'undefined') {
      // Could get from wagmi context
      const stored = localStorage.getItem('walletAddress');
      if (stored) setWalletAddress(stored);
    }
  }, []);

  async function loadData() {
    try {
      const [battlesRes, charactersRes] = await Promise.all([
        fetch('/api/battles'),
        fetch('/api/characters'),
      ]);
      
      const battlesData = await battlesRes.json();
      const charactersData = await charactersRes.json();
      
      setBattles(battlesData.battles || []);
      setCharacters(charactersData.characters || []);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function hostBattle() {
    if (!walletAddress) {
      alert('Please connect your wallet');
      return;
    }

    try {
      const res = await fetch('/api/battles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress,
          realm: hostForm.realm || 'Unknown Realm',
          durationMinutes: hostForm.durationMinutes,
          minParticipants: hostForm.minParticipants,
          maxParticipants: hostForm.maxParticipants,
          scheduledStartTime: hostForm.scheduledStartTime || null,
          characterIds: hostForm.characterId ? [hostForm.characterId] : [],
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.error || 'Failed to host battle');
        return;
      }

      alert('Battle hosted successfully!');
      setShowHostForm(false);
      setHostForm({
        realm: '',
        durationMinutes: 10,
        minParticipants: 2,
        maxParticipants: 10,
        scheduledStartTime: '',
        characterId: '',
      });
      loadData();
    } catch (error) {
      console.error('Failed to host battle:', error);
      alert('Failed to host battle');
    }
  }

  async function joinBattle(battleId: string) {
    if (!walletAddress) {
      alert('Please connect your wallet');
      return;
    }

    if (!hostForm.characterId) {
      alert('Please select a character to join with');
      return;
    }

    try {
      const res = await fetch(`/api/battles/${battleId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress,
          characterId: hostForm.characterId,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.error || 'Failed to join battle');
        return;
      }

      alert('Joined battle successfully!');
      loadData();
    } catch (error) {
      console.error('Failed to join battle:', error);
      alert('Failed to join battle');
    }
  }

  const ongoingBattles = battles.filter(b => b.status === 'ACTIVE');
  const endedBattles = battles.filter(b => b.status === 'COMPLETED');
  const upcomingBattles = battles.filter(b => b.status === 'PENDING');

  const getCharacterImage = (char: { avatarImageUrl?: string | null; avatarImageBase64?: string | null }) => {
    if (char.avatarImageBase64) return char.avatarImageBase64;
    if (char.avatarImageUrl) return char.avatarImageUrl;
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900 mx-auto mb-4"></div>
          <p className="text-zinc-600">Loading battles...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2 font-handjet tracking-wide">⚔️ Battles</h1>
          <p className="text-zinc-600">Join the carnage or host your own battle</p>
        </div>
        <button
          onClick={() => setShowHostForm(!showHostForm)}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all hover:scale-105"
        >
          {showHostForm ? '✕ Cancel' : '✨ Host a Battle'}
        </button>
      </div>

      {/* Debug Panel */}
      <div className="mb-8 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-zinc-500 mb-1">Debug</p>
            <div className="text-sm text-zinc-700 dark:text-zinc-300">
              <div>Wallet: {walletAddress ? walletAddress.slice(0, 4) + '...' + walletAddress.slice(-6) : 'not connected'}</div>
              <div>Status: {loading ? 'Loading…' : 'Ready'}</div>
            </div>
          </div>
          <DebugBattleButton />
        </div>
      </div>

      {/* Host Battle Form */}
      {showHostForm && (
        <div className="mb-8 bg-white rounded-xl shadow-lg p-6 border-2 border-purple-200">
          <h2 className="text-2xl font-bold mb-4">✨ Host a Battle</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Realm/Universe</label>
              <input
                type="text"
                value={hostForm.realm}
                onChange={(e) => setHostForm({ ...hostForm, realm: e.target.value })}
                placeholder="e.g., Neo-Tokyo Skyline"
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Your Character</label>
              <select
                value={hostForm.characterId}
                onChange={(e) => setHostForm({ ...hostForm, characterId: e.target.value })}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Select a character</option>
                {characters.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Duration (minutes)</label>
              <input
                type="number"
                value={hostForm.durationMinutes}
                onChange={(e) => setHostForm({ ...hostForm, durationMinutes: parseInt(e.target.value) || 10 })}
                min="1"
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Min Participants</label>
              <input
                type="number"
                value={hostForm.minParticipants}
                onChange={(e) => setHostForm({ ...hostForm, minParticipants: parseInt(e.target.value) || 2 })}
                min="2"
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Max Participants</label>
              <input
                type="number"
                value={hostForm.maxParticipants}
                onChange={(e) => setHostForm({ ...hostForm, maxParticipants: parseInt(e.target.value) || 10 })}
                min={hostForm.minParticipants}
                max="20"
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Scheduled Start (optional)</label>
              <input
                type="datetime-local"
                value={hostForm.scheduledStartTime}
                onChange={(e) => setHostForm({ ...hostForm, scheduledStartTime: e.target.value })}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>
          <button
            onClick={hostBattle}
            className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            Host Battle
          </button>
        </div>
      )}

      {/* Ongoing Battles */}
      {ongoingBattles.length > 0 && (
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span className="text-red-500">🔥</span> Ongoing Battles ({ongoingBattles.length})
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ongoingBattles.map((battle) => (
              <div key={battle.id} className="bg-white rounded-lg shadow-md p-5 border-2 border-red-200">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-lg">{battle.realm || battle.universe}</h3>
                    <p className="text-sm text-zinc-600">{battle.durationMinutes} min battle</p>
                  </div>
                  <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">ACTIVE</span>
                </div>
                <div className="mb-3">
                  <p className="text-sm text-zinc-600">
                    {battle.participantCount} / {battle.maxParticipants} participants
                  </p>
                  {battle.startedAt && (
                    <p className="text-xs text-zinc-500">Started: {new Date(battle.startedAt).toLocaleString()}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <a
                    href={`/battles/${battle.id}`}
                    className="flex-1 text-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-semibold"
                  >
                    View Battle
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Battles */}
      {upcomingBattles.length > 0 && (
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span className="text-yellow-500">⏳</span> Upcoming Battles ({upcomingBattles.length})
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingBattles.map((battle) => (
              <div key={battle.id} className="bg-white rounded-lg shadow-md p-5 border-2 border-yellow-200 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-lg">{battle.realm || battle.universe}</h3>
                    <p className="text-sm text-zinc-600">{battle.durationMinutes} min battle</p>
                    {battle.host && (
                      <p className="text-xs text-zinc-500">Host: {battle.host.username || battle.host.walletAddress?.slice(0, 6) + '...'}</p>
                    )}
                  </div>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">PENDING</span>
                </div>
                <div className="mb-3">
                  <p className="text-sm text-zinc-600 mb-2">
                    {battle.participantCount} / {battle.maxParticipants} participants
                    <span className="text-xs text-zinc-500 ml-2">
                      (min: {battle.minParticipants})
                    </span>
                  </p>
                  {battle.scheduledStartTime && (
                    <p className="text-xs text-zinc-500">
                      Starts: {new Date(battle.scheduledStartTime).toLocaleString()}
                    </p>
                  )}
                </div>
                {battle.participants.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-zinc-500 mb-1">Participants:</p>
                    <div className="flex flex-wrap gap-1">
                      {battle.participants.slice(0, 3).map((p) => {
                        const img = getCharacterImage(p.character);
                        return (
                          <div key={p.characterId} className="flex items-center gap-1">
                            {img ? (
                              <img src={img} alt={p.character.name} className="w-6 h-6 rounded-full object-cover" />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-zinc-200 flex items-center justify-center text-xs">
                                {p.character.name[0]}
                              </div>
                            )}
                            <span className="text-xs text-zinc-600">{p.character.name}</span>
                          </div>
                        );
                      })}
                      {battle.participants.length > 3 && (
                        <span className="text-xs text-zinc-500">+{battle.participants.length - 3} more</span>
                      )}
                    </div>
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => joinBattle(battle.id)}
                    disabled={battle.participantCount >= battle.maxParticipants || !walletAddress}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-zinc-300 disabled:cursor-not-allowed transition-colors text-sm font-semibold"
                  >
                    Join
                  </button>
                  <button className="px-3 py-2 border border-zinc-300 rounded-lg hover:bg-zinc-50 transition-colors">
                    ⭐
                  </button>
                  <button className="px-3 py-2 border border-zinc-300 rounded-lg hover:bg-zinc-50 transition-colors">
                    ❤️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ended Battles */}
      {endedBattles.length > 0 && (
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span className="text-zinc-500">⚰️</span> Ended Battles ({endedBattles.length})
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {endedBattles.map((battle) => (
              <div key={battle.id} className="bg-white rounded-lg shadow-md p-5 border-2 border-zinc-200">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-lg">{battle.realm || battle.universe}</h3>
                    <p className="text-sm text-zinc-600">{battle.durationMinutes} min battle</p>
                  </div>
                  <span className="px-3 py-1 bg-zinc-100 text-zinc-700 rounded-full text-xs font-semibold">
                    {battle.outcome || 'ENDED'}
                  </span>
                </div>
                <div className="mb-3">
                  <p className="text-sm text-zinc-600">
                    {battle.participantCount} participant{battle.participantCount !== 1 ? 's' : ''}
                  </p>
                  {battle.completedAt && (
                    <p className="text-xs text-zinc-500">Ended: {new Date(battle.completedAt).toLocaleString()}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <a
                    href={`/battles/${battle.id}`}
                    className="flex-1 text-center px-4 py-2 bg-zinc-600 text-white rounded-lg hover:bg-zinc-700 transition-colors text-sm font-semibold"
                  >
                    View Results
                  </a>
                  <button className="px-3 py-2 border border-zinc-300 rounded-lg hover:bg-zinc-50 transition-colors">
                    🏆
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {battles.length === 0 && (
        <div className="text-center py-20">
          <p className="text-zinc-500 text-lg mb-4">No battles yet. Be the first to host one!</p>
          <button
            onClick={() => setShowHostForm(true)}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            Host a Battle
          </button>
        </div>
      )}
    </section>
  );
}
