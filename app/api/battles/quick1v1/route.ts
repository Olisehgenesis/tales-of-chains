import { prisma } from '@/services/prisma';

export async function POST(request: Request) {
  try {
    const { primaryId, durationMinutes = 5 } = await request.json().catch(()=>({}));
    const count = await prisma.character.count();
    if (count < 2) return new Response(JSON.stringify({ error: 'Not enough characters' }), { status: 400 });

    async function pickRandom(excludeId?: string) {
      let maxTries = 5;
      while (maxTries-- > 0) {
        const skip = Math.max(0, Math.floor(Math.random() * count));
        const c = await prisma.character.findFirst({ skip, select: { id: true } });
        if (c && c.id !== excludeId) return c.id;
      }
      const any = await prisma.character.findFirst({ where: excludeId ? { NOT: { id: excludeId } } : {}, select: { id: true } });
      return any?.id;
    }

    const aId = primaryId || await pickRandom();
    const bId = await pickRandom(aId);
    if (!aId || !bId) return new Response(JSON.stringify({ error: 'Failed to select opponents' }), { status: 500 });

    const battle = await prisma.battle.create({
      data: {
        status: 'PENDING',
        universe: 'Unknown Realm',
        realm: null,
        durationMinutes: Math.max(1, Number(durationMinutes || 5)),
        minParticipants: 2,
        maxParticipants: 2,
      }
    });
    await prisma.battleParticipant.createMany({
      data: [aId, bId].map((cid) => ({ battleId: battle.id, characterId: cid }))
    });
    return Response.json({ battleId: battle.id });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: 'Failed to create 1v1 battle' }), { status: 500 });
  }
}


