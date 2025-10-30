"use client";
import { useEffect, useState } from 'react';

type Character = {
  id: string;
  name: string;
  age?: string | null;
  avatarImageUrl?: string | null;
  avatarImageBase64?: string | null;
  superpowers: string[];
  weaknesses: string[];
  story?: {
    title: string;
    synopsis: string;
    alignment: 'HERO' | 'VILLAIN';
    highlights: string[];
  } | null;
  walletAddress?: string | null;
  username?: string | null;
  createdAt: string;
};

export default function CharactersPage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);

  useEffect(() => {
    async function loadCharacters() {
      try {
        const res = await fetch('/api/characters');
        if (!res.ok) {
          console.error('Failed to load characters');
          return;
        }
        const data = await res.json();
        setCharacters(data.characters || []);
      } catch (error) {
        console.error('Error loading characters:', error);
      } finally {
        setLoading(false);
      }
    }
    loadCharacters();
  }, []);

  const getImageSrc = (char: Character) => {
    if (char.avatarImageBase64) return char.avatarImageBase64;
    if (char.avatarImageUrl) return char.avatarImageUrl;
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900 mx-auto mb-4"></div>
          <p className="text-zinc-600">Loading characters...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 font-handjet tracking-wide">⚔️ Characters</h1>
        <p className="text-zinc-600">Explore all heroes and villains in the Storyverse</p>
        <p className="text-sm text-zinc-500 mt-2">Total: {characters.length} character{characters.length !== 1 ? 's' : ''}</p>
      </div>

      {characters.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-zinc-500 text-lg">No characters found. Be the first to create one!</p>
          <a href="/iforge" className="mt-4 inline-block text-blue-600 hover:underline">
            Create a Character →
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {characters.map((char) => {
            const imageSrc = getImageSrc(char);
            const alignment = char.story?.alignment || 'HERO';
            const isHero = alignment === 'HERO';

            return (
              <div
                key={char.id}
                onClick={() => setSelectedCharacter(char)}
                className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer group border-2 border-transparent hover:border-zinc-200 transform hover:-translate-y-1"
              >
                {/* Image Header */}
                <div className="relative h-64 bg-gradient-to-br from-zinc-100 to-zinc-200 overflow-hidden">
                  {imageSrc ? (
                    <img
                      src={imageSrc}
                      alt={char.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-100 to-orange-100">
                      <div className="text-6xl font-bold text-zinc-300">
                        {char.name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                  )}
                  {/* Alignment Badge */}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${
                        isHero
                          ? 'bg-yellow-400/90 text-yellow-900'
                          : 'bg-red-500/90 text-red-100'
                      }`}
                    >
                      {isHero ? '⚡ HERO' : '💀 VILLAIN'}
                    </span>
                  </div>
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                {/* Card Content */}
                <div className="p-5">
                  <h2 className="text-xl font-bold mb-1 group-hover:text-blue-600 transition-colors">
                    {char.name}
                  </h2>
                  {char.age && (
                    <p className="text-sm text-zinc-500 mb-3 italic">{char.age}</p>
                  )}
                  {char.story?.title && (
                    <p className="text-sm font-semibold text-zinc-700 mb-2">
                      "{char.story.title}"
                    </p>
                  )}

                  {/* Superpowers */}
                  <div className="mb-3">
                    <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1">
                      Powers
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {char.superpowers.slice(0, 3).map((power, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded border border-blue-200"
                        >
                          {power}
                        </span>
                      ))}
                      {char.superpowers.length > 3 && (
                        <span className="px-2 py-1 bg-zinc-100 text-zinc-600 text-xs rounded">
                          +{char.superpowers.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Weaknesses */}
                  <div className="mb-3">
                    <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1">
                      Weaknesses
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {char.weaknesses.map((weak, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded border border-red-200"
                        >
                          {weak}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Story Highlights */}
                  {char.story?.highlights && char.story.highlights.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-zinc-100">
                      <div className="text-xs text-zinc-400 italic line-clamp-2">
                        {char.story.highlights[0]}
                      </div>
                    </div>
                  )}

                  {/* Owner */}
                  {(char.username || char.walletAddress) && (
                    <div className="mt-3 pt-3 border-t border-zinc-100">
                      <div className="text-xs text-zinc-400">
                        Created by: {char.username || char.walletAddress?.slice(0, 6) + '...' + char.walletAddress?.slice(-4)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Character Detail Modal */}
      {selectedCharacter && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedCharacter(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-80 bg-gradient-to-br from-zinc-100 to-zinc-200">
              {getImageSrc(selectedCharacter) ? (
                <img
                  src={getImageSrc(selectedCharacter)!}
                  alt={selectedCharacter.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-100 to-orange-100">
                  <div className="text-8xl font-bold text-zinc-300">
                    {selectedCharacter.name.charAt(0).toUpperCase()}
                  </div>
                </div>
              )}
              <button
                onClick={() => setSelectedCharacter(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg"
              >
                ✕
              </button>
            </div>
            <div className="p-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-3xl font-bold mb-2">{selectedCharacter.name}</h2>
                  {selectedCharacter.age && (
                    <p className="text-zinc-500 italic">{selectedCharacter.age}</p>
                  )}
                </div>
                <span
                  className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    selectedCharacter.story?.alignment === 'HERO'
                      ? 'bg-yellow-100 text-yellow-900'
                      : 'bg-red-100 text-red-900'
                  }`}
                >
                  {selectedCharacter.story?.alignment || 'HERO'}
                </span>
              </div>

              {selectedCharacter.story?.title && (
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">"{selectedCharacter.story.title}"</h3>
                  {selectedCharacter.story.synopsis && (
                    <p className="text-zinc-700 leading-relaxed">{selectedCharacter.story.synopsis}</p>
                  )}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div>
                  <h3 className="font-semibold mb-2 text-blue-700">⚡ Superpowers</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCharacter.superpowers.map((power, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded border border-blue-200"
                      >
                        {power}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-red-700">⚠️ Weaknesses</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCharacter.weaknesses.map((weak, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-red-50 text-red-700 text-sm rounded border border-red-200"
                      >
                        {weak}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {selectedCharacter.story?.highlights && selectedCharacter.story.highlights.length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-semibold mb-2">Highlights</h3>
                  <ul className="list-disc list-inside space-y-1 text-zinc-700">
                    {selectedCharacter.story.highlights.map((highlight, idx) => (
                      <li key={idx}>{highlight}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

