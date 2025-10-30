"use client";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
//import address from wagmi 
import { useAccount } from 'wagmi';

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

export default function IForgePage() {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [powers, setPowers] = useState('');
  const [weak, setWeak] = useState('');
  const [extraContext, setExtraContext] = useState('');
  const [stage, setStage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [alignment, setAlignment] = useState<'HERO'|'VILLAIN'|'AUTO'>('AUTO');
  const [formError, setFormError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
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
      const spec: any = { name: specName, superpowers: specPowers, weaknesses: specWeak };
      if (age.trim()) spec.age = age.trim();
      if (extraContext.trim()) spec.extraContext = extraContext.trim();
      if (alignment !== 'AUTO') spec.alignmentHint = alignment;
      setStage('🛠️ Weaving powers and flaws…');
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
    } catch (e: any) {
      const msg = typeof e?.message === 'string' ? e.message : 'Forge error';
      setStage(`❌ ${msg}`);
      setFormError(msg);
    } finally {
      setLoading(false);
    }
  }

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
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4 bg-white rounded border p-4">
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
            <label className="block text-sm text-zinc-600 mb-1">Extra Context (optional, 20 chars max)</label>
            <input className="w-full border rounded px-3 py-2" placeholder="e.g. demon, first born, elf" value={extraContext} onChange={(e)=>setExtraContext(e.target.value.slice(0, 20))} maxLength={20} />
            <div className="mt-1 text-xs text-zinc-500">{extraContext.length}/20 - Race, background, or extra info for AI</div>
          </div>
          <div>
            <label className="block text-sm text-zinc-600 mb-1">Superpowers (3–5)</label>
            <input className="w-full border rounded px-3 py-2" placeholder="Flight, Telekinesis, …" value={powers} onChange={(e)=>setPowers(e.target.value)} />
            <div className="mt-1 text-xs text-zinc-500">Selected: {cleanList(powers).length}</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {suggestedPowers.map(p => (
                <button key={p} type="button" onClick={()=> setPowers(prev => (prev? prev+", ":"")+p)} className="text-xs border px-2 py-1 rounded hover:bg-zinc-50">{p}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm text-zinc-600 mb-1">Weaknesses (1–2)</label>
            <input className="w-full border rounded px-3 py-2" placeholder="Kryptonite, Bright Light" value={weak} onChange={(e)=>setWeak(e.target.value)} />
            <div className="mt-1 text-xs text-zinc-500">Selected: {cleanList(weak).length}</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {suggestedWeaknesses.map(w => (
                <button key={w} type="button" onClick={()=> setWeak(prev => (prev? prev+", ":"")+w)} className="text-xs border px-2 py-1 rounded hover:bg-zinc-50">{w}</button>
              ))}
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
            <Button onClick={onPreview} disabled={loading}>{loading ? 'Working…' : 'Preview'}</Button>
            <Button onClick={onCreate} variant="outline" disabled={!preview || loading}>Create</Button>
            {stage && <span className="text-xs text-zinc-600">{stage}</span>}
          </div>
          {loading && (
            <div className="text-sm text-zinc-700 border rounded p-3">
              <ul className="list-disc list-inside space-y-1">
                <li className={stage?.includes('Connecting')?'font-medium':''}>⚙️ Connecting to the Forge</li>
                <li className={stage?.includes('Weaving')?'font-medium':''}>🛠️ Weaving powers and flaws</li>
                <li className={stage?.includes('Summoning')?'font-medium':''}>🎨 Summoning portrait</li>
                <li className={stage?.includes('Ready')?'font-medium':''}>✅ Ready</li>
              </ul>
            </div>
          )}
        </div>
        <div className="space-y-4">
          {serverError && (
            <div className="border rounded p-3 bg-white text-sm">
              <div className="font-medium mb-1">Request rejected</div>
              <div className="text-zinc-700">{serverError}</div>
            </div>
          )}
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
          <div className="border rounded bg-white p-2">
            <div className="aspect-square w-full overflow-hidden rounded border">
              {preview ? (
                <img src={preview.imageUrl} alt="card" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm text-zinc-500">Image preview will appear here</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


