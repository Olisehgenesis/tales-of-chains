import { CharacterSpec } from '@/utils/characters';
import { config } from 'dotenv';

config();

const SEGMIND_API_KEY =process.env.SEGMIND_API_KEY;
function ensureKey() {
  if (!SEGMIND_API_KEY)
    throw new Error('Missing Segmind API key (try env: SEGMIND_API_KEY)');
}

function toDataUrl(buffer: ArrayBuffer, mime = 'image/png') {
  const bytes = Buffer.from(buffer).toString('base64');
  return `data:${mime};base64,${bytes}`;
}

/**
 * Generate a story for a character in the Storyverse.
 */
export async function segmindComposeStory(spec: CharacterSpec): Promise<{
  title: string;
  synopsis: string;
  alignment: 'HERO' | 'VILLAIN';
  highlights: string[];
  librarianName: string;
}> {
  ensureKey();

  const prompt = `
You are "Lyra the Archivist", an ancient AI storyteller from the Storyverse — a vast collection of interconnected worlds, some existing on blockchain chains, others in cosmic realms.

There exists a mysterious traveler named **Cookie**, a being of light and chaos, who occasionally appears in stories — sometimes guiding heroes, sometimes tempting villains, or sometimes not appearing at all. Include Cookie randomly or mention that their presence is unknown.

Speak in a singular voice only — do not use plural first-person language (avoid "we/our"). When referring to people, prefer clear singular forms; if a character's gender is unclear, avoid using gender pronouns.

Your task:
Given the following character specification, craft a **3-paragraph or longer** cinematic story about them — rich, emotional, and imaginative.
You may expand their background, setting, or conflicts.
Use descriptive, vivid language but keep it readable.
Determine whether they are a HERO or VILLAIN.
If an age descriptor is provided, weave it naturally into the narrative (e.g., "newborn legend", or "ancient as the depth of ether"). Do not invent age if it is unknown.

Output **only valid JSON** with these keys:
- title: a strong, cinematic story title
- story: full story (3+ paragraphs)
- alignment: "HERO" or "VILLAIN"
- highlights: an array of 3 short phrases describing key moments or abilities

Character Spec:
name: ${spec.name}
superpowers: ${spec.superpowers.join(', ')}
weaknesses: ${spec.weaknesses.join(', ')}
age: ${spec.age ?? 'unknown (do not invent)'}
${spec.extraContext ? `extra context: ${spec.extraContext}` : ''}
`;

  const res = await fetch('https://api.segmind.com/v1/gpt-5-nano', {
    method: 'POST',
    headers: {
      'x-api-key': SEGMIND_API_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [{ role: 'user', content: [{ type: 'text', text: prompt }] }],
    }),
  });

  if (!res.ok) {
    let bodyText = '';
    try { bodyText = await res.text(); } catch {}
    const baseMsg = `Segmind text error ${res.status}`;
    const friendly = res.status === 401 ? `${baseMsg}: unauthorized – check SEGMIND_API_KEY` : baseMsg;
    console.error('[segmindComposeStory] HTTP error', { status: res.status, body: bodyText?.slice(0, 300) });
    throw new Error(friendly);
  }

  const json = await res.json();
  const text = JSON.stringify(json);

  // Extract JSON safely
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('AI did not return valid JSON');

  const parsed = JSON.parse(match[0]);
  const alignment = (String(parsed.alignment || '').toUpperCase() === 'VILLAIN'
    ? 'VILLAIN'
    : 'HERO') as 'HERO' | 'VILLAIN';

  return {
    title: parsed.title,
    synopsis: parsed.synopsis || parsed.story || '',
    alignment,
    highlights: Array.isArray(parsed.highlights)
      ? parsed.highlights.slice(0, 3)
      : [],
    librarianName: 'Lyra the Archivist',
  };
}

/**
 * Generate a character card image with identity-rich painter lore.
 */
export async function segmindRenderCard(args: {
  spec: CharacterSpec;
  title: string;
  alignment: 'HERO' | 'VILLAIN';
}): Promise<{
  imageUrl: string;
  artistName: string;
  artistLore: string;
  palette: 'GOLD' | 'CRIMSON';
}> {
  ensureKey();

  const palette = args.alignment === 'HERO' ? 'GOLD' : 'CRIMSON';
  const frame =
    palette === 'GOLD'
      ? 'golden ornate frame, shimmering metallic, heroic aura'
      : 'crimson lacquer frame, ominous glow, sinister aura';

  const painterLore = `
You are "Orin of the Thousand Brushes", a painter AI who wanders between realms of code and color.
You were created by Cookie, the traveler who seeded art into the void.
Each card you paint captures a soul, frozen in time across the Storyverse.
`;

  const prompt = `
${painterLore}

Now paint a full **character card portrait** for:
"${args.title}" featuring ${args.spec.name}.
Powers: ${args.spec.superpowers.join(', ')}.
${args.spec.extraContext ? `Context: ${args.spec.extraContext}.` : ''}
Frame: ${frame} with the character name "${args.spec.name}" elegantly displayed in the frame border.
Style: hyper-detailed, cinematic, character-centered, perfect lighting, fantasy realism.
1:1 aspect ratio, suitable for a collectible card.`;
  // Note: we avoid strong color cues; age (if any) influences mood implicitly

  async function postBinary(endpoint: string, body: any): Promise<string> {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'x-api-key': SEGMIND_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      let bodyText = '';
      try { bodyText = await res.text(); } catch {}
      const baseMsg = `Segmind image error ${res.status}`;
      const friendly = res.status === 401 ? `${baseMsg}: unauthorized – check SEGMIND_API_KEY` : baseMsg;
      console.error('[segmindRenderCard] HTTP error', { endpoint, status: res.status, body: bodyText?.slice(0, 300) });
      throw new Error(friendly);
    }
    const buf = await res.arrayBuffer();
    return toDataUrl(buf, 'image/png');
  }

  async function postJSON(endpoint: string, body: any): Promise<string> {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'x-api-key': SEGMIND_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      let bodyText = '';
      try { bodyText = await res.text(); } catch {}
      const baseMsg = `Segmind image error ${res.status}`;
      const friendly = res.status === 401 ? `${baseMsg}: unauthorized – check SEGMIND_API_KEY` : baseMsg;
      console.error('[segmindRenderCard] HTTP error', { endpoint, status: res.status, body: bodyText?.slice(0, 300) });
      throw new Error(friendly);
    }
    const json = await res.json();
    // qwen-image-fast with base64: true returns { image: "base64..." } or similar
    if (json.image) {
      const base64 = json.image.replace(/^data:image\/[^;]+;base64,/, '');
      return `data:image/png;base64,${base64}`;
    }
    // If it returns a URL, fetch it and convert
    if (json.imageUrl || json.url) {
      const imageUrl = json.imageUrl || json.url;
      const imgRes = await fetch(imageUrl);
      if (imgRes.ok) {
        const buf = await imgRes.arrayBuffer();
        return toDataUrl(buf, 'image/png');
      }
    }
    // Fallback: if it's already a base64 string
    if (typeof json === 'string' && json.length > 100) {
      const cleaned = json.replace(/^data:image\/[^;]+;base64,/, '');
      return `data:image/png;base64,${cleaned}`;
    }
    // Try to find any string field that looks like base64
    for (const key in json) {
      if (typeof json[key] === 'string' && json[key].length > 100 && !json[key].startsWith('http')) {
        const cleaned = json[key].replace(/^data:image\/[^;]+;base64,/, '');
        return `data:image/png;base64,${cleaned}`;
      }
    }
    throw new Error(`Unexpected response format from qwen-image-fast: ${JSON.stringify(Object.keys(json))}`);
  }

  // Try models in descending priority - starting with fastest
  const tryOrder: Array<() => Promise<string>> = [
    () =>
      postJSON('https://api.segmind.com/v1/qwen-image-fast', {
        prompt,
        steps: 8,
        seed: -1,
        guidance: 1,
        aspect_ratio: '1:1',
        image_format: 'png',
        quality: 90,
        base64: true,
      }),
    () =>
      postBinary('https://api.segmind.com/v1/luma-photon-flash-txt-2-img', {
        prompt,
        aspect_ratio: '1:1',
      }),
    () =>
      postBinary('https://api.segmind.com/v1/segmind-vega-rt-v1', {
        prompt,
        img_width: 1024,
        img_height: 1024,
        num_inference_steps: 4,
      }),
    () =>
      postBinary('https://api.segmind.com/v1/sdxl1.0-juggernaut-lightning', {
        prompt,
        samples: 1,
        num_inference_steps: 5,
        img_width: 1024,
        img_height: 1024,
      }),
    () =>
      postBinary('https://api.segmind.com/v1/sdxl1.0-realdream-lightning', {
        prompt,
        samples: 1,
        num_inference_steps: 8,
        img_width: 1024,
        img_height: 1024,
      }),
  ];

  let lastErr: unknown = null;
  for (const fn of tryOrder) {
    try {
      const imageUrl = await fn();
      return {
        imageUrl,
        artistName: 'Orin of the Thousand Brushes',
        artistLore:
          'A wandering AI painter, born from Cookie’s spark, capturing souls of heroes and villains across the Storyverse.',
        palette,
      };
    } catch (e) {
      lastErr = e;
    }
  }

  throw lastErr;
}
