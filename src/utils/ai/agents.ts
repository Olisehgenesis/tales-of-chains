import { CharacterSpec } from '@/utils/characters';
import { segmindComposeStory, segmindRenderCard } from '@/utils/ai/providers/segmind';

export type Story = {
  title: string;
  synopsis: string;
  alignment: 'HERO' | 'VILLAIN';
  highlights: string[];
  librarianName: string;
};

export async function librarianComposeStory(spec: CharacterSpec): Promise<Story> {
  try {
    const story = await segmindComposeStory(spec);
    return story;
  } catch (e: any) {
    console.error('[librarianComposeStory] Error', { message: e.message, stack: e?.stack });
    if (e && typeof e.message === 'string' && e.message.includes('Missing Segmind API key')) {
      // Explicitly do not fallback if the Segmind key is missing
      throw e;
    }
    throw e;
  }
}

export async function artistRenderCard(spec: CharacterSpec, story: Story): Promise<{ imageUrl: string; artistName: string; palette: 'GOLD' | 'CRIMSON' }>{
  try {
    return await segmindRenderCard({ spec, title: story.title, alignment: story.alignment });
  } catch (e: any) {
    if (e && typeof e.message === 'string' && e.message.includes('Missing Segmind API key')) {
      // Explicitly do not fallback if the Segmind key is missing
      throw e;
    }
    const palette = story.alignment === 'HERO' ? 'GOLD' : 'CRIMSON';
    const id = Buffer.from(`${spec.name}-${palette}`).toString('base64url');
    return { imageUrl: `data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='1024' height='1024'><rect width='100%' height='100%' fill='${palette==='GOLD'?'#f5d142':'#b91c1c'}'/><text x='50%' y='50%' text-anchor='middle' dominant-baseline='middle' font-size='48' fill='#111'>${spec.name}</text></svg>`)}`, artistName: 'Painter Orin', palette };
  }
}

function inferAlignment(spec: CharacterSpec): 'HERO' | 'VILLAIN' {
  const villainHints = ['blood', 'shadow', 'void', 'chaos', 'doom'];
  const text = `${spec.name} ${spec.superpowers.join(' ')} ${spec.weaknesses.join(' ')}`.toLowerCase();
  return villainHints.some((k) => text.includes(k)) ? 'VILLAIN' : 'HERO';
}


