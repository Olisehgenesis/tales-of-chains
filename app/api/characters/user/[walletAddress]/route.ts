import { prisma } from '@/services/prisma';

export async function GET(request: Request, { params }: { params: { walletAddress: string } }) {
  try {
    const walletAddress = decodeURIComponent(params.walletAddress).toLowerCase();
    
    const user = await prisma.user.findUnique({
      where: { walletAddress },
      include: {
        characters: {
          include: {
            superpowers: true,
            weaknesses: true,
            story: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }

    const characters = user.characters.map((c: any) => ({
      id: c.id,
      userId: c.userId,
      name: c.name,
      age: c.age,
      avatarImageUrl: c.avatarImageUrl,
      avatarImageBase64: c.avatarImageBase64 ?? null,
      superpowers: c.superpowers.map((p: any) => p.value),
      weaknesses: c.weaknesses.map((w: any) => w.value),
      createdAt: c.createdAt,
      walletAddress: user.walletAddress,
      username: user.username,
      story: c.story ? {
        title: c.story.title,
        synopsis: c.story.synopsis,
        alignment: c.story.alignment,
        highlights: typeof c.story.highlights === 'string' ? JSON.parse(c.story.highlights) : c.story.highlights
      } : null
    }));

    return Response.json({ characters });
  } catch (e: any) {
    return new Response(null, { status: 500 });
  }
}

