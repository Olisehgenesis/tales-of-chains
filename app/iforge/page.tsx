"use client";
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
//import address from wagmi 
import { useAccount } from 'wagmi';
import { COOKIE_STORIES } from '@/utils/cookieStories';

type PreviewResponse = {
  story: { title: string; synopsis: string; alignment: 'HERO'|'VILLAIN'; highlights?: string[] };
  imageUrl: string;
  librarian?: string;
  artist?: string;
  palette?: 'GOLD'|'CRIMSON';
};

function toTitleCase(s: string) {
  return s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}
function cleanList(input: string): string[] {
  const arr = input.split(',').map(s=>s.trim()).filter(Boolean).map(toTitleCase);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of arr) { const k = v.toLowerCase(); if (!seen.has(k)) { seen.add(k); out.push(v); } }
  return out;
}

function getRandomStory(){ return COOKIE_STORIES[Math.floor(Math.random()*COOKIE_STORIES.length)]; }
const RACES = [
  { id: 'human', emoji: '👤', label: 'Human' },
  { id: 'demon', emoji: '😈', label: 'Demon' },
  { id: 'god', emoji: '⚡', label: 'God' },
  { id: 'beast', emoji: '🐺', label: 'Beast' },
  { id: 'monster', emoji: '👹', label: 'Monster' },
  { id: 'elf', emoji: '🧝', label: 'Elf' },
  { id: 'angel', emoji: '👼', label: 'Angel' },
  { id: 'dragon', emoji: '🐉', label: 'Dragon' },
  { id: 'undead', emoji: '💀', label: 'Undead' },
  { id: 'elemental', emoji: '🌊', label: 'Elemental' }
];

// Catalogs (can scale up to 150/100 entries)
const SUPERPOWERS_CATALOG = [
  'Flight','Telekinesis','Super Strength','Invisibility','Time Warp','Energy Shield','Lightning','Shapeshift',
  'Teleportation','Telepathy','Regeneration','Elemental Control','Gravity Shift','Precognition','Technomancy',
  'Shadowstep','Sonic Burst','Force Field','Photon Blast','Metal Bending','Plant Whisper','Frost Touch',
  'Pyrokinesis','Hydrokinesis','Aerokinesis','Earthshaper','Illusion Casting','Adaptive Armor','Energy Drain',

  // 🧙 Magic & Arcane Powers
  'Spell Weaving','Dark Magic','Light Magic','Necromancy','Rune Casting','Chaos Manipulation','Reality Warp',
  'Soul Bind','Astral Projection','Summoning','Cursed Flame','Spirit Communication','Dreamwalking',
  'Divine Blessing','Blood Magic','Arcane Infusion','Enchantment','Mirror Magic','Dimensional Rift',

  // 🌌 Cosmic & Advanced Powers
  'Cosmic Awareness','Quantum Manipulation','Stellar Flame','Void Step','Black Hole Creation',
  'Plasma Control','Antimatter Pulse','Temporal Distortion','Celestial Guidance','Starforge',

  // 🧠 Psychic & Emotional Powers
  'Empathy','Fear Induction','Mind Reading','Dream Invasion','Memory Erase','Emotion Control',
  'Psychic Construct','Astral Manipulation','Mental Fortress','Thought Projection',

  // ⚙️ Enhanced & Hybrid Abilities
  'Cyberlink','Nanite Swarm','Bioelectric Surge','Molecular Reconstruction','Energy Conversion',
  'Regenerative Matrix','Adaptive Mutation','Sound Manipulation','Vibration Control','Magnetic Flux',

  // 🌿 Nature & Primal Forces
  'Beast Communication','Toxic Breath','Sandstorm Summon','Stone Skin','Lava Surge','Storm Calling',
  'Ocean Command','Solar Beam','Lunar Blessing','Venom Touch'
];

const WEAKNESSES_CATALOG = [
  'Kryptonite','Loud Sounds','Bright Light','Cold','Heat','Water','Iron','Silver','Fire','Darkness','Sunlight',
  'Poison','Electric Shock','Mind Control','Glass','Salt','Holy Relics','Moonlight','Chaos Magic','Order Magic',

  // 🌿 Environmental Weaknesses
  'Toxins','Radiation','Lava','Low Oxygen','Metal Containment','Acid Rain','Extreme Pressure','Vacuum of Space',
  'Pollution','Sand',

  // 💀 Magical & Arcane Weaknesses
  'Cursed Objects','Banishing Runes','Broken Sigils','Null Fields','Anti-Magic Zones','Holy Water','Blood Oaths',
  'Binding Spells','Soul Severance','Dark Crystals','Spirit Banishment',

  // 🧠 Psychological & Emotional Weaknesses
  'Fear Manipulation','Guilt','Rage','Overconfidence','Empathy Overload','Loss of Focus','Nightmares',
  'Memory Traps','Emotional Instability','Mind Fracture','Hallucinations',

  // ⚙️ Technological & Physical Weaknesses
  'EMP Pulse','Signal Interference','Magnetic Overload','System Hack','Overcharge','Energy Feedback',
  'Corrupted Nanites','Armor Break','Metal Fatigue','Circuit Jam',

  // 🌌 Cosmic or Abstract Weaknesses
  'Time Paradox','Dimensional Rift','Reality Instability','Void Exposure','Entropy Decay','Graviton Collapse',
  'Cosmic Drain','Fate Lock','Celestial Disfavor','Quantum Noise'
];



export default function IForgePage() {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [powers, setPowers] = useState('');
  const [weak, setWeak] = useState('');
  const [extraContext, setExtraContext] = useState('');
  const [race, setRace] = useState('human');
  const [stage, setStage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [alignment, setAlignment] = useState<'HERO'|'VILLAIN'|'AUTO'>('AUTO');
  const [formError, setFormError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [currentStory, setCurrentStory] = useState(getRandomStory());
  const [storyPart, setStoryPart] = useState(0);
  const [tab, setTab] = useState<'basic'|'powers'|'weave'|'preview'>('basic');
  const [showPowerModal, setShowPowerModal] = useState(false);
  const [showWeakModal, setShowWeakModal] = useState(false);
  const [catalogQuery, setCatalogQuery] = useState('');
  // Helpers to manage tag-like add/remove from catalogs
  function addPowerTag(tag: string) {
    setPowers((prev) => {
      const merged = Array.from(new Set([...cleanList(prev), tag]));
      return merged.join(', ');
    });
  }
  function removePowerTag(tag: string) {
    setPowers((prev) => cleanList(prev).filter((t) => t.toLowerCase() !== tag.toLowerCase()).join(', '));
  }
  function addWeakTag(tag: string) {
    setWeak((prev) => {
      const merged = Array.from(new Set([...cleanList(prev), tag]));
      return merged.join(', ');
    });
  }
  function removeWeakTag(tag: string) {
    setWeak((prev) => cleanList(prev).filter((t) => t.toLowerCase() !== tag.toLowerCase()).join(', '));
  }
  const { address } = useAccount(); 
  const suggestedPowers = ['Flight','Telekinesis','Super Strength','Invisibility','Time Warp','Energy Shield','Lightning','Shapeshift'];
  const suggestedWeaknesses = ['Kryptonite','Loud Sounds','Bright Light','Cold','Heat','Water','Iron','Silver'];

  async function onPreview() {
    try {
      setFormError(null);
      setServerError(null);
      const specName = toTitleCase(name.trim());
      const specPowers = cleanList(powers);
      const specWeak = cleanList(weak);
      // client-side validation for a cleaner UX
      // if address is not set, setFormError('Please connect your wallet.');
      if (!address) {
        setFormError('Please connect your wallet.');
        return;
      }
      
        //check if payload has address and append it to the payload
        
      if (specName.length < 2) {
        setFormError('Name is too short.');
        return;
      }
      if (specPowers.length < 3 || specPowers.length > 5) {
        setFormError('Superpowers must be 3–5.');
        return;
      }
      if (specWeak.length < 1 || specWeak.length > 2) {
        setFormError('Weaknesses must be 1–2.');
        return;
      }
      setStage('⚙️ Connecting to the Forge…');
      setLoading(true);
      const spec: any = { name: specName, superpowers: specPowers, weaknesses: specWeak, race };
      if (age.trim()) spec.age = age.trim();
      if (extraContext.trim()) spec.extraContext = extraContext.trim();
      if (alignment !== 'AUTO') spec.alignmentHint = alignment;
      setCurrentStory(getRandomStory());
      setStoryPart(0);
      setStage('🛠️ Weaving powers and flaws…');
      setTab('weave');
      const res = await fetch('/api/mint/preview', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(spec) });
      if (!res.ok) {
        let msg = 'Preview failed';
        try { const j = await res.json(); if (j?.error) msg = j.error; } catch {}
        setServerError(msg);
        throw new Error(msg);
      }
      setStage('🎨 Summoning portrait…');
      const data = await res.json();
      setPreview(data);
      setStage('✅ Ready');
      setTab('preview');
    } catch (e: any) {
      const msg = typeof e?.message === 'string' ? e.message : 'Forge error';
      setStage(`❌ ${msg}`);
      setFormError(msg);
    } finally {
      setLoading(false);
    }
  }
  useEffect(()=>{
    if (loading && storyPart < currentStory.parts.length - 1) {
      const t = setTimeout(()=> setStoryPart(p=>p+1), 3000);
      return ()=> clearTimeout(t);
    }
  }, [loading, storyPart, currentStory.parts.length]);

  async function onCreate() {
    try {
      setFormError(null);
      setServerError(null);
      if (!preview) {
        setFormError('Preview first to generate story and image.');
        return;
      }

      const specName = toTitleCase(name.trim());
      const specPowers = cleanList(powers);
      const specWeak = cleanList(weak);
      if (specName.length < 2) { setFormError('Name is too short.'); return; }
      if (specPowers.length < 3 || specPowers.length > 5) { setFormError('Superpowers must be 3–5.'); return; }
      if (specWeak.length < 1 || specWeak.length > 2) { setFormError('Weaknesses must be 1–2.'); return; }

      const payload: any = {
        name: specName,
        superpowers: specPowers,
        weaknesses: specWeak,
        avatarImageUrl: preview.imageUrl,
        address: address
      };
      if (preview?.story?.title && preview?.story?.synopsis && preview?.story?.alignment) {
        payload.story = {
          title: preview.story.title,
          synopsis: preview.story.synopsis,
          alignment: preview.story.alignment,
          highlights: preview.story.highlights || []
        };
      }
      if (age.trim()) payload.age = age.trim();
      if (extraContext.trim()) payload.extraContext = extraContext.trim();

      const res = await fetch('/api/characters', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) {
        let msg = 'Create failed';
        try { const j = await res.json(); if (j?.error) msg = j.error; } catch {}
        setServerError(msg);
        throw new Error(msg);
      }
      const data = await res.json();
      alert('Character saved');
      console.log('created character', data);
    } catch (e: any) {
      const msg = typeof e?.message === 'string' ? e.message : 'Create error';
      setFormError(msg);
    }
  }

  return (
    <section className="max-w-5xl mx-auto px-4 py-10">
      <header className="mb-6">
        <h1 className="text-3xl font-handjet">iForge</h1>
        <p className="text-sm text-zinc-600 mt-1">They say Good always wins, but have you ever seen a bad bullet stopped by good butter?</p>
      </header>
      {/* Tabs */}
      <div className="mb-4 flex items-center gap-2 text-sm">
        <button onClick={()=>setTab('basic')} className={`px-3 py-1 rounded ${tab==='basic'?'bg-zinc-900 text-white':'border'}`}>1. Basics</button>
        <button onClick={()=>setTab('powers')} className={`px-3 py-1 rounded ${tab==='powers'?'bg-zinc-900 text-white':'border'}`}>2. Powers</button>
        <button disabled className={`px-3 py-1 rounded ${tab==='weave'?'bg-zinc-900 text-white':'border'}`}>3. Weave</button>
        <button disabled className={`px-3 py-1 rounded ${tab==='preview'?'bg-zinc-900 text-white':'border'}`}>4. Preview</button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* LEFT COLUMN */}
        <div className="space-y-4 bg-white rounded border p-4">
          {tab==='basic' && (
            <>
          <div>
            <label className="block text-sm text-zinc-600 mb-1">Name</label>
            <input className="w-full border rounded px-3 py-2" placeholder="e.g. Nova Sentinel" value={name} onChange={(e)=>setName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-zinc-600 mb-1">Age (optional)</label>
            <input className="w-full border rounded px-3 py-2" placeholder="e.g. Newborn legend, Ancient as the depth of ether" value={age} onChange={(e)=>setAge(e.target.value)} />
            <div className="mt-1 text-xs text-zinc-500">Describe age in words; it will shape the story.</div>
          </div>
          <div>
            <label className="block text-sm text-zinc-600 mb-1">Extra Context (optional, 60 chars max)</label>
            <input className="w-full border rounded px-3 py-2" placeholder="e.g. demon, first born, elf" value={extraContext} onChange={(e)=>setExtraContext(e.target.value.slice(0, 60))} maxLength={60} />
            <div className="mt-1 text-xs text-zinc-500">{extraContext.length}/60 - Race, background, or extra info for AI</div>
          </div>
          <div>
            <label className="block text-sm text-zinc-600 mb-1">Race</label>
            <div className="grid grid-cols-5 gap-2">
              {RACES.map(r => (
                <button key={r.id} type="button" onClick={()=> setRace(r.id)}
                        className={`border rounded px-2 py-2 text-xs ${race===r.id? 'ring-2 ring-blue-500 bg-blue-50':'hover:bg-zinc-50'}`}>
                  <div className="text-lg mb-1">{r.emoji}</div>
                  {r.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={()=>setTab('powers')}>Next →</Button>
          </div>
            </>
          )}

          {tab==='powers' && (
            <>
          <div>
            <label className="block text-sm text-zinc-600 mb-1">Superpowers (3–5)</label>
            <input className="w-full border rounded px-3 py-2" placeholder="Flight, Telekinesis, …" value={powers} onChange={(e)=>setPowers(e.target.value)} />
            <div className="mt-2 flex flex-wrap gap-2">
              {cleanList(powers).map((t)=> (
                <span key={t} className="px-2 py-1 text-xs rounded bg-green-100 text-green-800 flex items-center gap-1">
                  {t}
                  <button type="button" onClick={()=>removePowerTag(t)} className="text-green-900/70 hover:text-green-900">×</button>
                </span>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="text-xs text-zinc-500">Selected: {cleanList(powers).length}</div>
              <Button variant="outline" className="btn-glow" onClick={()=>{ setCatalogQuery(''); setShowPowerModal(true); }}>Open catalog</Button>
            </div>
          </div>
          <div>
            <label className="block text-sm text-zinc-600 mb-1">Weaknesses (1–2)</label>
            <input className="w-full border rounded px-3 py-2" placeholder="Kryptonite, Bright Light" value={weak} onChange={(e)=>setWeak(e.target.value)} />
            <div className="mt-2 flex flex-wrap gap-2">
              {cleanList(weak).map((t)=> (
                <span key={t} className="px-2 py-1 text-xs rounded bg-red-100 text-red-800 flex items-center gap-1">
                  {t}
                  <button type="button" onClick={()=>removeWeakTag(t)} className="text-red-900/70 hover:text-red-900">×</button>
                </span>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="text-xs text-zinc-500">Selected: {cleanList(weak).length}</div>
              <Button variant="outline" className="btn-glow" onClick={()=>{ setCatalogQuery(''); setShowWeakModal(true); }}>Open catalog</Button>
            </div>
          </div>
          <div>
            <label className="block text-sm text-zinc-600 mb-2">Alignment</label>
            <div className="grid grid-cols-3 gap-2">
              <button type="button" onClick={()=>setAlignment('AUTO')} className={`border rounded px-3 py-2 text-sm ${alignment==='AUTO'?'ring-1':''}`}>Auto</button>
              <button type="button" onClick={()=>setAlignment('HERO')} className={`border rounded px-3 py-2 text-sm ${alignment==='HERO'?'ring-1':''}`}>Hero</button>
              <button type="button" onClick={()=>setAlignment('VILLAIN')} className={`border rounded px-3 py-2 text-sm ${alignment==='VILLAIN'?'ring-1':''}`}>Villain</button>
            </div>
          </div>
          {formError && (
            <div className="text-xs text-zinc-700 border rounded p-2">{formError}</div>
          )}
          <div className="flex items-center gap-2">
            <Button onClick={onPreview} disabled={loading}>Preview</Button>
            <Button onClick={()=>setTab('basic')} variant="outline">Back</Button>
            {stage && <span className="text-xs text-zinc-600">{stage}</span>}
          </div>
            </>
          )}
        </div>
        {/* RIGHT COLUMN */}
        <div className="space-y-4">
          {serverError && (
            <div className="border rounded p-3 bg-white text-sm">
              <div className="font-medium mb-1">Request rejected</div>
              <div className="text-zinc-700">{serverError}</div>
            </div>
          )}
          {tab==='weave' && (
            <div className="relative bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 text-white rounded-lg p-6 min-h-[400px] flex flex-col">
              <div className="mb-4">
                <div className="text-xl font-bold mb-2">{currentStory.title}</div>
                <div className="w-16 h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded"></div>
              </div>
              <div className="flex-1 flex items-center">
                <p className="text-lg leading-relaxed typewriter">{currentStory.parts[storyPart]}</p>
              </div>
              <div className="mt-4 flex gap-1">
                {currentStory.parts.map((_, idx)=> (
                  <div key={idx} className={`h-1 flex-1 rounded ${idx <= storyPart ? 'bg-purple-400' : 'bg-white/20'}`} />
                ))}
              </div>
              <div className="mt-4 text-sm text-purple-200 text-center">Cookie is weaving your tale... {storyPart+1} / {currentStory.parts.length}</div>
              {/* Spinner */}
              <div className="absolute top-4 right-4">
                <div className="h-6 w-6 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
              </div>
              {/* Manual advance */}
              <div className="mt-4 flex justify-center">
                <Button variant="outline" onClick={()=> setStoryPart(p=> Math.min(p+1, currentStory.parts.length-1))} className="btn-glow">Next ✨</Button>
              </div>
            </div>
          )}
          {tab==='preview' && (
          <div className="border rounded p-4 bg-white">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold text-sm">{preview ? preview.story.title : 'Title will appear here'}</div>
                <p className="text-sm text-zinc-700 mt-2">{preview ? preview.story.synopsis : 'Preview a character to see a synopsis.'}</p>
              </div>
              <div>
                {preview ? (
                  <span className="text-xs px-2 py-1 rounded border">{preview.story.alignment}</span>
                ) : (
                  <span className="text-xs px-2 py-1 rounded border">—</span>
                )}
              </div>
            </div>
            {preview && Array.isArray(preview.story.highlights) && (
              <ul className="text-xs mt-3 list-disc list-inside text-zinc-600">
                {preview.story.highlights.map((h)=> (<li key={h}>{h}</li>))}
              </ul>
            )}
            <div className="text-xs text-zinc-500 mt-3">
              {preview ? (
                <>
                  {age?.trim() ? (<span className="mr-2">Age: {age.trim()}</span>) : null}
                  Librarian: {preview.librarian} • Artist: {preview.artist}
                </>
              ) : (
                <>Librarian and artist details will appear after preview.</>
              )}
            </div>
          </div>
          )}
          {tab==='preview' && (
          <div className="border rounded bg-white p-2">
            <div className="aspect-square w-full overflow-hidden rounded border">
              {preview ? (
                <img src={preview.imageUrl} alt="card" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm text-zinc-500">Image preview will appear here</div>
              )}
            </div>
          </div>
          )}
          {tab==='preview' && (
          <div className="flex items-center gap-2">
            <Button onClick={onCreate} disabled={!preview}>Save</Button>
            <Button onClick={()=>setTab('powers')} variant="outline">Back</Button>
          </div>
          )}
        </div>
      </div>
      {/* Powers Catalog Modal */}
      {showPowerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={()=>setShowPowerModal(false)} />
          <div className="relative z-10 w-full max-w-lg bg-white rounded-lg shadow-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="font-medium">Pick superpowers</div>
              <button onClick={()=>setShowPowerModal(false)} className="text-zinc-600 hover:text-zinc-900">✕</button>
            </div>
            <input className="w-full border rounded px-3 py-2 mb-3" placeholder="Search..." value={catalogQuery} onChange={(e)=>setCatalogQuery(e.target.value)} />
            <div className="max-h-64 overflow-auto grid grid-cols-2 gap-2">
              {SUPERPOWERS_CATALOG
                .filter(p=> p.toLowerCase().includes(catalogQuery.toLowerCase()))
                .filter(p=> !cleanList(powers).map(x=>x.toLowerCase()).includes(p.toLowerCase()))
                .map((p)=> (
                  <button key={p} type="button" onClick={()=>addPowerTag(p)} className="text-xs border px-2 py-2 rounded hover:bg-green-50 text-left">{p}</button>
                ))}
            </div>
            <div className="mt-3 text-right">
              <Button onClick={()=>setShowPowerModal(false)}>Done</Button>
            </div>
          </div>
        </div>
      )}
      {/* Weaknesses Catalog Modal */}
      {showWeakModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={()=>setShowWeakModal(false)} />
          <div className="relative z-10 w-full max-w-lg bg-white rounded-lg shadow-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="font-medium">Pick weaknesses</div>
              <button onClick={()=>setShowWeakModal(false)} className="text-zinc-600 hover:text-zinc-900">✕</button>
            </div>
            <input className="w-full border rounded px-3 py-2 mb-3" placeholder="Search..." value={catalogQuery} onChange={(e)=>setCatalogQuery(e.target.value)} />
            <div className="max-h-64 overflow-auto grid grid-cols-2 gap-2">
              {WEAKNESSES_CATALOG
                .filter(w=> w.toLowerCase().includes(catalogQuery.toLowerCase()))
                .filter(w=> !cleanList(weak).map(x=>x.toLowerCase()).includes(w.toLowerCase()))
                .map((w)=> (
                  <button key={w} type="button" onClick={()=>addWeakTag(w)} className="text-xs border px-2 py-2 rounded hover:bg-red-50 text-left">{w}</button>
                ))}
            </div>
            <div className="mt-3 text-right">
              <Button onClick={()=>setShowWeakModal(false)}>Done</Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}


