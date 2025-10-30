import { librarianComposeStory, artistRenderCard } from '@/utils/ai/agents';
import { validateCharacterSpec } from '@/utils/characters';


export async function POST(request: Request) {
  try {
    const body = await request.json();
    const spec = body;
    const alignmentHint = body?.alignmentHint as ('HERO'|'VILLAIN'|undefined);
    const valid = validateCharacterSpec(spec);
    if (!valid.ok) return new Response(JSON.stringify({ error: valid.error }), { status: 400 });
    const story = await librarianComposeStory(spec);
    if (alignmentHint === 'HERO' || alignmentHint === 'VILLAIN') {
      story.alignment = alignmentHint;
    }
    const art = await artistRenderCard(spec, story);
    return Response.json({ story, imageUrl: art.imageUrl, librarian: story.librarianName, artist: art.artistName, palette: art.palette });
  } catch (e: any) {
    const message = typeof e?.message === 'string' ? e.message : 'Internal error';
    // Log server-side for debugging
    console.error('[api/mint/preview] Error', { message, stack: e?.stack });
    const status = message.includes('Missing Segmind API key') ? 400 : 500;
    return new Response(JSON.stringify({ error: message }), { status });
  }
}


