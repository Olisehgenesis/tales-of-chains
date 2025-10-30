// Standalone test: call Segmind APIs directly (text, optional image)
// Usage:
//   pnpm tsx scripts/segmindDirect.ts            # text test
//   pnpm tsx scripts/segmindDirect.ts image      # image test
import { config } from 'dotenv';
config();

const API_KEY = process.env.SEGMIND_API_KEY;

if (!API_KEY) {
  console.error('Missing Segmind API key. Set SEGMIND_API_KEY.');
  process.exit(1);
}

async function testText() {
  const prompt = `You are Lyra. Return ONLY JSON with keys: title, synopsis (2-3 sentences), alignment (HERO or VILLAIN), highlights (3 items).
Spec: name=Nova Sentinel; superpowers=Telekinesis, Lightning, Shapeshift; weaknesses=Bright Light; age=Ancient as the depth of ether`;

  const res = await fetch('https://api.segmind.com/v1/gpt-5-nano', {
    method: 'POST',
    headers: {
      'x-api-key': API_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [{ role: 'user', content: [{ type: 'text', text: prompt }] }],
    }),
  });
  const text = await res.text();
  console.log('[text] status =', res.status);
  console.log('[text] body   =', text.slice(0, 1000));
  if (!res.ok) process.exitCode = 1;
}

async function testImage() {
  const prompt = `Nova Sentinel, full character card portrait. Powers: Telekinesis, Lightning, Shapeshift. Sharp details, 1:1.`;
  const res = await fetch('https://api.segmind.com/v1/luma-photon-flash-txt-2-img', {
    method: 'POST',
    headers: {
      'x-api-key': API_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt, aspect_ratio: '1:1' }),
  });
  console.log('[image] status =', res.status);
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    console.log('[image] error  =', errText.slice(0, 1000));
    process.exitCode = 1;
    return;
  }
  const buf = await res.arrayBuffer();
  const b64 = Buffer.from(buf).toString('base64');
  console.log('[image] dataURL =', `data:image/png;base64,${b64.slice(0, 80)}... (truncated)`);
}

const mode = (process.argv[2] || '').toLowerCase();
if (mode === 'image') {
  testImage().catch((e) => { console.error(e); process.exitCode = 1; });
} else {
  testText().catch((e) => { console.error(e); process.exitCode = 1; });
}


