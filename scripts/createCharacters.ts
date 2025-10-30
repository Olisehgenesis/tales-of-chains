// Script to create characters: preview + save
// Run: pnpm tsx scripts/createCharacters.ts [BASE_URL]
//
// This script:
// 1. Authenticates with each wallet address
// 2. Calls /api/mint/preview to get story and image
// 3. Calls /api/characters POST to save the character

type Character = {
  wallet: string;
  name: string;
  age: string;
  extraContext: string;
  superpowers: string[];
  weaknesses: string[];
  alignment: 'HERO' | 'VILLAIN' | 'AUTO';
  lore: string;
};

const CHARACTERS: Character[] = [
  {
    wallet: '0x29d899bb6c539c59cea731041af5c15668e88280',
    name: 'Nova Sentinel',
    age: 'Born in the first ignition of a dying star.',
    extraContext: 'Starborn Guardian',
    superpowers: ['Energy Manipulation', 'Flight', 'Plasma Blades', 'Solar Regeneration'],
    weaknesses: ['Extreme Cold', 'Shadow Energy'],
    alignment: 'HERO',
    lore: 'The first light forged in the cosmic forge, Nova Sentinel guards the balance between suns and shadows. Her fire can birth worlds—or end them.',
  },
  {
    wallet: '0x9b6A52A88a1Ee029Bd14170fFb8fB15839Bd18cB',
    name: 'Iron Seraph',
    age: 'Forged 7,000 cycles ago in the skies of Arc Mechanis.',
    extraContext: 'Celestial Cyborg',
    superpowers: ['Techno-Assimilation', 'Flight', 'Electromagnetic Burst', 'Adaptive Armor'],
    weaknesses: ['EMP Blasts', 'Overheating'],
    alignment: 'HERO',
    lore: 'The last angel of metal and mercy, Iron Seraph channels lightning through wings of steel, bound by divine code and human error.',
  },
  {
    wallet: '0xf7dbD2867f55832E4A05E16Cd69cB57A70923cDD',
    name: 'Umbra Wraith',
    age: 'First born of the Shadows.',
    extraContext: 'Nether Entity',
    superpowers: ['Shadow Step', 'Fear Induction', 'Invisibility', 'Soul Drain'],
    weaknesses: ['Bright Light', 'Silver'],
    alignment: 'VILLAIN',
    lore: 'When light was born, Umbra Wraith was its echo. He walks between dimensions, feeding on fear and forgotten memories.',
  },
  {
    wallet: '0x1f0825843f1074B59a54747440a99e5D30a17a61',
    name: 'Eclipse Vanguard',
    age: 'Timeless — walks where sun and moon collide.',
    extraContext: 'Void Knight',
    superpowers: ['Dual Reality Shift', 'Energy Shield', 'Telekinesis', 'Sword of Gravity'],
    weaknesses: ['Time Distortion', 'Iron'],
    alignment: 'AUTO',
    lore: 'Once a royal knight turned celestial exile, Eclipse Vanguard now enforces balance — neither for light nor dark, but the chain between them.',
  },
  {
    wallet: '0xb8f936be2b12406391b4232647593cdb62df2203',
    name: 'Vyre Tempest',
    age: 'Whisper of the Endless Storm',
    extraContext: 'Storm Elemental',
    superpowers: ['Weather Control', 'Lightning Summon', 'Sonic Flight', 'Hydroform'],
    weaknesses: ['Silence (nullifies focus)', 'Heat'],
    alignment: 'HERO',
    lore: 'The storm that gained conscience; Vyre Tempest hears the world through thunder and speaks only in roars.',
  },
  {
    wallet: '0xc65214667c57d6fe95eefe91dcf4cd110bcebb6c',
    name: 'Chrona Veil',
    age: 'Older than time, younger than memory.',
    extraContext: 'Time Weaver',
    superpowers: ['Time Warp', 'Illusion Casting', 'Temporal Healing', 'Dimensional Fold'],
    weaknesses: ['Paradox Feedback', 'Memory Loss'],
    alignment: 'HERO',
    lore: 'Chrona Veil bends time like silk, weaving destinies to protect the fragile present from collapsing futures.',
  },
];

// Authentication removed - wallet address will be sent directly

async function previewCharacter(char: Character, baseUrl: string): Promise<{
  story: { title: string; synopsis: string; alignment: 'HERO' | 'VILLAIN'; highlights: string[] };
  imageUrl: string;
}> {
  const url = `${baseUrl}/api/mint/preview`;
  console.log(`[preview] Generating preview for ${char.name}...`);

  const spec: any = {
    name: char.name,
    superpowers: char.superpowers,
    weaknesses: char.weaknesses,
    age: char.age,
    extraContext: char.extraContext,
  };

  if (char.alignment !== 'AUTO') {
    spec.alignmentHint = char.alignment;
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(spec),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Preview failed: ${res.status} - ${text}`);
  }

  const data = await res.json();
  console.log(`[preview] ✓ Preview generated for ${char.name}`);
  console.log(`  Title: ${data.story?.title || 'N/A'}`);
  console.log(`  Alignment: ${data.story?.alignment || 'N/A'}`);
  console.log(`  Image URL: ${data.imageUrl ? '✓' : '✗'}`);
  
  // Ensure story has required fields, use fallbacks if missing
  const story = data.story ? {
    title: data.story.title || char.name || 'Untitled',
    synopsis: data.story.synopsis || '',
    alignment: data.story.alignment || 'HERO',
    highlights: Array.isArray(data.story.highlights) ? data.story.highlights : []
  } : null;
  
  return {
    story,
    imageUrl: data.imageUrl,
  };
}

async function createCharacter(
  char: Character,
  preview: { story: any; imageUrl: string },
  baseUrl: string
): Promise<void> {
  const url = `${baseUrl}/api/characters`;
  console.log(`[create] Saving character ${char.name}...`);

  const payload: any = {
    name: char.name,
    superpowers: char.superpowers,
    weaknesses: char.weaknesses,
    age: char.age,
    avatarImageUrl: preview.imageUrl,
    story: preview.story,
    walletAddress: char.wallet, // Send wallet address directly
  };

  // Validate story structure
  if (preview.story) {
    if (!preview.story.title || !preview.story.synopsis || !preview.story.alignment) {
      console.warn(`[create] ⚠️  Story missing required fields:`, {
        hasTitle: !!preview.story.title,
        hasSynopsis: !!preview.story.synopsis,
        hasAlignment: !!preview.story.alignment,
      });
    }
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    let errorDetail = text;
    try {
      const json = JSON.parse(text);
      errorDetail = JSON.stringify(json, null, 2);
    } catch {}
    throw new Error(`Create failed: ${res.status} - ${errorDetail}`);
  }

  const data = await res.json();
  console.log(`[create] ✓ Character saved: ${char.name} (ID: ${data.character?.id || 'N/A'})`);
}

async function main() {
  const base = process.argv[2] || process.env.BASE_URL || 'http://localhost:3004';
  const baseUrl = base.replace(/\/$/, '');

  console.log(`🚀 Creating ${CHARACTERS.length} characters at ${baseUrl}\n`);

  const results: Array<{ char: Character; success: boolean; error?: string }> = [];

  for (const char of CHARACTERS) {
    try {
      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`Processing: ${char.name}`);
      console.log(`Wallet: ${char.wallet}`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

      // Step 1: Preview
      const preview = await previewCharacter(char, baseUrl);

      // Step 2: Create (wallet address sent directly, no auth needed)
      await createCharacter(char, preview, baseUrl);

      results.push({ char, success: true });
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (e: any) {
      const error = e?.message || String(e);
      console.error(`❌ Failed to create ${char.name}: ${error}\n`);
      results.push({ char, success: false, error });
    }
  }

  // Summary
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`📊 Summary`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  
  const succeeded = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✓ Succeeded: ${succeeded.length}/${CHARACTERS.length}`);
  succeeded.forEach(r => console.log(`  - ${r.char.name}`));
  
  if (failed.length > 0) {
    console.log(`\n✗ Failed: ${failed.length}/${CHARACTERS.length}`);
    failed.forEach(r => console.log(`  - ${r.char.name}: ${r.error}`));
    process.exitCode = 1;
  }
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});

