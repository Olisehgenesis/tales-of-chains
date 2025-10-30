import { prisma } from '@/services/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // PENDING, ACTIVE, COMPLETED

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const battles = await prisma.battle.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        participants: {
          include: {
            character: {
              select: {
                id: true,
                name: true,
                avatarImageUrl: true,
                avatarImageBase64: true,
              }
            }
          }
        },
        host: {
          select: {
            id: true,
            walletAddress: true,
            username: true,
          }
        }
      }
    });

    // Format battles with participant count
    const formatted = battles.map(battle => ({
      id: battle.id,
      status: battle.status,
      universe: battle.universe,
      realm: battle.realm,
      durationMinutes: battle.durationMinutes,
      outcome: battle.outcome,
      minParticipants: battle.minParticipants,
      maxParticipants: battle.maxParticipants,
      participantCount: battle.participants.length,
      participants: battle.participants.map(p => ({
        characterId: p.characterId,
        character: p.character
      })),
      scheduledStartTime: battle.scheduledStartTime,
      startedAt: battle.startedAt,
      completedAt: battle.completedAt,
      host: battle.host,
      createdAt: battle.createdAt,
    }));

    return Response.json({ battles: formatted });
  } catch (e: any) {
    console.error('[api/battles GET] Error', e);
    return new Response(JSON.stringify({ error: 'Failed to fetch battles' }), { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      walletAddress,
      realm,
      durationMinutes,
      minParticipants,
      maxParticipants,
      scheduledStartTime,
      characterIds,
      allOut,
      prizeAmount,
      prizeCurrency,
    } = body;

    if (!walletAddress) {
      return new Response(JSON.stringify({ error: 'Wallet address required' }), { status: 400 });
    }

    // Find or create user
    const user = await prisma.user.upsert({
      where: { walletAddress: walletAddress.toLowerCase() },
      update: {},
      create: { walletAddress: walletAddress.toLowerCase() }
    });

    const min = Math.max(2, Number(minParticipants || 2));
    const max = Math.min(20, Math.max(min, Number(maxParticipants || 10)));
    const minutes = Math.max(1, Number(durationMinutes || 10));

    const battle = await prisma.battle.create({
      data: {
        status: 'PENDING',
        universe: realm || 'Unknown Realm',
        realm: realm || null,
        durationMinutes: minutes,
        minParticipants: min,
        maxParticipants: max,
        scheduledStartTime: scheduledStartTime ? new Date(scheduledStartTime) : null,
        hostId: user.id,
        prizeAmount: prizeAmount != null ? Number(prizeAmount) : null,
        prizeCurrency: prizeCurrency || null,
      }
    });

    // Add participants: allOut or explicit list
    if (allOut === true) {
      const allCharacters = await prisma.character.findMany({ select: { id: true } });
      if (allCharacters.length >= 2) {
        await prisma.battleParticipant.createMany({
          data: allCharacters.map((c) => ({ battleId: battle.id, characterId: c.id }))
        });
      }
    } else if (Array.isArray(characterIds) && characterIds.length > 0) {
      await prisma.battleParticipant.createMany({
        data: characterIds.map((cid: string) => ({ battleId: battle.id, characterId: cid }))
      });
    }

    return Response.json({ battleId: battle.id, battle });
  } catch (e: any) {
    console.error('[api/battles POST] Error', e);
    return new Response(JSON.stringify({ error: e?.message || 'Failed to create battle' }), { status: 500 });
  }
}
