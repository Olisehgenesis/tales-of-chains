// Standalone tester for the local Segmind preview route
// Run: pnpm tsx scripts/test.ts [BASE_URL]

type Payload = {
  name: string;
  superpowers: string[];
  weaknesses: string[];
  age?: string;
  alignmentHint?: 'HERO' | 'VILLAIN';
};

async function main() {
  const base = process.argv[2] || process.env.BASE_URL || 'http://localhost:3004';
  const url = `${base.replace(/\/$/, '')}/api/mint/preview`;

  const body: Payload = {
    name: 'Nova Sentinel',
    superpowers: ['Telekinesis', 'Lightning', 'Shapeshift'],
    weaknesses: ['Bright Light'],
    age: 'Ancient as the depth of ether',
    alignmentHint: 'HERO',
  };

  console.log(`[test] POST ${url}`);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    console.log(`[test] status=${res.status}`);
    try {
      const json = JSON.parse(text);
      console.log('[test] response json:', JSON.stringify(json, null, 2));
    } catch {
      console.log('[test] response text:', text.slice(0, 500));
    }
    if (!res.ok) process.exitCode = 1;
  } catch (e: any) {
    console.error('[test] request failed:', e?.message || e);
    process.exitCode = 1;
  }
}

main();


