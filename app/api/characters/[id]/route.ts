import { prisma } from '@/services/prisma';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const char = await prisma.character.findUnique({
      where: { id: params.id },
      include: {
        superpowers: true,
        weaknesses: true,
        story: true,
        user: {
          select: {
            walletAddress: true,
            username: true
          }
        }
      }
    });

    if (!char) {
      return new Response(JSON.stringify({ error: 'Character not found' }), { status: 404 });
    }

    const response = {
      id: char.id,
      userId: char.userId,
      name: char.name,
      age: char.age,
      avatarImageUrl: char.avatarImageUrl,
      avatarImageBase64: (char as any).avatarImageBase64 ?? null,
      superpowers: char.superpowers.map((p) => p.value),
      weaknesses: char.weaknesses.map((w) => w.value),
      createdAt: char.createdAt,
      walletAddress: char.user.walletAddress,
      username: char.user.username,
      story: char.story ? {
        title: char.story.title,
        synopsis: char.story.synopsis,
        alignment: char.story.alignment,
        highlights: typeof char.story.highlights === 'string' ? JSON.parse(char.story.highlights) : char.story.highlights
      } : null
    };

    return Response.json({ character: response });
  } catch (e: any) {
    return new Response(null, { status: 500 });
  }
}

