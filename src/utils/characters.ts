type CharacterSpec = {
  name: string;
  superpowers: string[];
  weaknesses: string[];
  avatarImageUrl?: string | null;
  age?: string | null; // descriptive age text
  extraContext?: string | null; // optional 20-char max context for AI (e.g., race, background)
};

export function validateCharacterSpec(spec: any): { ok: true } | { ok: false; error: string } {
  if (!spec || typeof spec !== 'object') return { ok: false, error: 'Invalid spec' };
  if (typeof spec.name !== 'string' || spec.name.trim().length < 2) return { ok: false, error: 'Name too short' };
  if (!Array.isArray(spec.superpowers)) return { ok: false, error: 'superpowers must be an array' };
  if (!Array.isArray(spec.weaknesses)) return { ok: false, error: 'weaknesses must be an array' };
  if (spec.age != null && typeof spec.age !== 'string') return { ok: false, error: 'age must be a string' };
  const powers = spec.superpowers.map((s: string) => String(s).trim()).filter(Boolean);
  const weaknesses = spec.weaknesses.map((s: string) => String(s).trim()).filter(Boolean);
  if (powers.length < 3 || powers.length > 5) return { ok: false, error: 'superpowers must be 3-5' };
  if (weaknesses.length < 1 || weaknesses.length > 2) return { ok: false, error: 'weaknesses must be 1-2' };
  // Ensure uniqueness and no trivial duplicates
  const setP = new Set(powers.map((s: string) => s.toLowerCase()));
  const setW = new Set(weaknesses.map((s: string) => s.toLowerCase()));
  if (setP.size !== powers.length) return { ok: false, error: 'duplicate superpowers not allowed' };
  if (setW.size !== weaknesses.length) return { ok: false, error: 'duplicate weaknesses not allowed' };
  // Powers cannot be listed as weaknesses and vice versa
  for (const w of setW) {
    if (setP.has(w)) return { ok: false, error: 'a weakness cannot be a listed superpower' };
  }
  if (typeof spec.age === 'string') {
    const age = spec.age.trim();
    if (age.length === 0) delete spec.age;
    if (age.length > 120) return { ok: false, error: 'age must be ≤ 120 characters' };
  }
  if (spec.extraContext != null && typeof spec.extraContext !== 'string') return { ok: false, error: 'extraContext must be a string' };
  if (typeof spec.extraContext === 'string') {
    const ctx = spec.extraContext.trim();
    if (ctx.length === 0) delete spec.extraContext;
    if (ctx.length > 20) return { ok: false, error: 'extraContext must be ≤ 20 characters' };
  }
  return { ok: true };
}

export type { CharacterSpec };


