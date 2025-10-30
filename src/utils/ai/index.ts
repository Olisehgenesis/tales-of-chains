import type { CharacterSpec } from '../characters.ts';

// Simple provider registry with fallbacks. In production, wire to actual SDKs.
async function tryProviders<T>(fns: Array<() => Promise<T>>): Promise<T> {
  let lastErr: unknown = null;
  for (const fn of fns) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr ?? new Error('All AI providers failed');
}

export async function aiDescribeCharacter(spec: CharacterSpec): Promise<string> {
  return tryProviders<string>([
    async () => pseudoLLMDescribe(spec, 'model_primary'),
    async () => pseudoLLMDescribe(spec, 'model_fallback_a'),
    async () => pseudoLLMDescribe(spec, 'model_fallback_b')
  ]);
}

export async function aiGenerateAvatar(spec: CharacterSpec, description: string): Promise<string> {
  return tryProviders<string>([
    async () => pseudoImageUrl(spec, description, 'img_primary'),
    async () => pseudoImageUrl(spec, description, 'img_fallback_a'),
    async () => pseudoImageUrl(spec, description, 'img_fallback_b')
  ]);
}

export async function aiPickUniverse(): Promise<string> {
  const universes = ['Neo-Tokyo Skyline', 'Crimson Nebula Station', 'Eldertide Forest', 'Ashen Dunes', 'Quantum Bazaar'];
  return universes[Math.floor(Math.random() * universes.length)];
}

export async function aiBattleNarration(args: {
  battleId: string;
  participants: Array<{ character: { name: string; superpowers: { value: string }[]; weaknesses: { value: string }[] } }>;
  universe: string;
  turn: number;
}): Promise<string> {
  const names = args.participants.map((p) => p.character.name).join(' vs ');
  const line = `Turn ${args.turn}: In ${args.universe}, ${names} clash. Sparks of power flare as tactics adapt.`;
  return line;
}

export async function aiGenerateLore(prompt: string): Promise<string> {
  const key = process.env.SEGMIND_API_KEY;
  if (key) {
    const res = await fetch('https://api.segmind.com/v1/gpt-5-nano', {
      method: 'POST',
      headers: { 'x-api-key': key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: [{ type: 'text', text: `${prompt}\n\nReturn ONLY valid JSON.` }] }] })
    });
    if (!res.ok) {
      const t = await res.text().catch(()=>'');
      throw new Error(`Segmind lore error ${res.status}: ${t.slice(0,200)}`);
    }
    const json = await res.json();
    const raw = JSON.stringify(json);
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('AI did not return valid JSON');
    return match[0];
  }
  // Fallback minimal generator (dev only)
  const turns = Math.floor(Math.random() * 5) + 6;
  const body = {
    intro: 'The air tastes like prophecy as the contenders step into the hush between heartbeats. ⚔️',
    turns: Array.from({ length: turns }).map((_, i) => ({
      turn: i + 1,
      actor: 'Hero',
      target: 'Foe',
      action: 'clashes',
      effect: '⚔️',
      outcome: Math.random() < 0.2 ? 'falls' : 'endures',
      narrative: 'Sand rises like an audience; sigils flare and gutter. Two destinies collide and recoil, leaving the night grinning. 🌑'
    })),
    outro: 'The dunes keep the last laugh.',
    outcome: 'Someone endures.'
  };
  return JSON.stringify(body);
}

export async function aiGenerateIntro(args: { universe: string; mood: string; names: string[] }): Promise<string> {
  const key = process.env.SEGMIND_API_KEY;
  const basePrompt = `You are a mythic narrator. Write a short, mystical two-paragraph INTRO only (no turns), for a battle about to begin.
World: ${args.universe}
Mood: ${args.mood}
Names: ${args.names.slice(0, 8).join(', ')}
Tone: cinematic, poetic, strange, but readable. Avoid cliches. Include subtle mythic imagery. Return ONLY valid JSON: {"intro": "..."}`;
  if (key) {
    const res = await fetch('https://api.segmind.com/v1/gpt-5-nano', {
      method: 'POST',
      headers: { 'x-api-key': key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: [{ type: 'text', text: basePrompt }] }] })
    });
    if (!res.ok) {
      const t = await res.text().catch(()=> '');
      throw new Error(`Segmind intro error ${res.status}: ${t.slice(0,200)}`);
    }
    const json = await res.json();
    const raw = JSON.stringify(json);
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('AI did not return valid JSON');
    const parsed = JSON.parse(match[0]);
    if (typeof parsed.intro !== 'string' || parsed.intro.length < 10) throw new Error('Intro missing');
    return parsed.intro;
  }
  // Fallback minimal intro
  return `In ${args.universe}, under ${args.mood}, ${args.names.slice(0, 3).join(', ')} step into a hush that edits the clocks. The dunes memorize only the jokes.\n\nSomewhere a rumor signs its name and vanishes.`;
}

async function pseudoLLMDescribe(spec: CharacterSpec, provider: string): Promise<string> {
  // Deterministic summary for now
  const powers = spec.superpowers.join(', ');
  const weaknesses = spec.weaknesses.join(', ');
  return `${spec.name} — a hero wielding ${powers}. Vulnerable to ${weaknesses}. [${provider}]`;
}

async function pseudoImageUrl(spec: CharacterSpec, description: string, provider: string): Promise<string> {
  const id = Buffer.from(`${spec.name}-${provider}`).toString('base64url');
  // Placeholder stable URL
  return `https://img.totc.local/${id}.png?desc=${encodeURIComponent(description.substring(0, 60))}`;
}


