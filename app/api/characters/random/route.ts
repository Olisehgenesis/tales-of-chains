import { prisma } from '@/services/prisma';

export async function GET() {
  try {
    const count = await prisma.character.count();
    if (count === 0) return Response.json({ character: null });
    const skip = Math.max(0, Math.floor(Math.random() * count));
    const c = await prisma.character.findFirst({
      skip,
      include: {
        superpowers: true,
        weaknesses: true,
        story: true
      }
    });
    if (!c) return Response.json({ character: null });
    const character = {
      id: c.id,
      name: c.name,
      avatarImageUrl: c.avatarImageBase64 || c.avatarImageUrl || null,
      storyTitle: c.story?.title || null,
      synopsis: c.story?.synopsis || null,
      alignment: c.story?.alignment || null,
      superpowers: (c.superpowers || []).map((p: any) => p.value),
      weaknesses: (c.weaknesses || []).map((w: any) => w.value)
    };
    return Response.json({ character });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: 'Failed to get random character' }), { status: 500 });
  }
}


