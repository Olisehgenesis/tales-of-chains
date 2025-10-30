import { prisma } from '@/services/prisma';

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const battle = await prisma.battle.findUnique({
      where: { id },
      include: {
        messages: { orderBy: { turn: 'asc' } },
        participants: { include: { character: { select: { id: true, name: true } } } }
      }
    });
    if (!battle) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
    return Response.json({ battle });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: 'Failed to fetch battle' }), { status: 500 });
  }
}


