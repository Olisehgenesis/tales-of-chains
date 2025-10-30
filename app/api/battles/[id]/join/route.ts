import { prisma } from '@/services/prisma';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { walletAddress, characterId } = body;

    if (!walletAddress || !characterId) {
      return new Response(JSON.stringify({ error: 'Wallet address and character ID required' }), { status: 400 });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { walletAddress: walletAddress.toLowerCase() }
    });

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }

    // Verify character belongs to user
    const character = await prisma.character.findUnique({
      where: { id: characterId }
    });

    if (!character) {
      return new Response(JSON.stringify({ error: 'Character not found' }), { status: 404 });
    }

    if (character.userId !== user.id) {
      return new Response(JSON.stringify({ error: 'Character does not belong to user' }), { status: 403 });
    }

    // Get battle
    const battle = await prisma.battle.findUnique({
      where: { id: params.id },
      include: { participants: true }
    });

    if (!battle) {
      return new Response(JSON.stringify({ error: 'Battle not found' }), { status: 404 });
    }

    if (battle.status !== 'PENDING') {
      return new Response(JSON.stringify({ error: 'Battle is not open for joining' }), { status: 400 });
    }

    // Check if character is already a participant
    const existing = battle.participants.find(p => p.characterId === characterId);
    if (existing) {
      return new Response(JSON.stringify({ error: 'Character already in battle' }), { status: 400 });
    }

    // Check if battle is full
    if (battle.participants.length >= battle.maxParticipants) {
      return new Response(JSON.stringify({ error: 'Battle is full' }), { status: 400 });
    }

    // Add participant
    await prisma.battleParticipant.create({
      data: {
        battleId: battle.id,
        characterId: characterId
      }
    });

    // Check if we should start the battle (min participants reached)
    const updatedBattle = await prisma.battle.findUnique({
      where: { id: params.id },
      include: { participants: true }
    });

    if (updatedBattle && updatedBattle.participants.length >= updatedBattle.minParticipants) {
      // Battle can start (but let the worker handle actual starting)
      // Could trigger start here if scheduledStartTime is null or passed
    }

    return Response.json({ success: true, message: 'Joined battle successfully' });
  } catch (e: any) {
    console.error('[api/battles/join POST] Error', e);
    return new Response(JSON.stringify({ error: e?.message || 'Failed to join battle' }), { status: 500 });
  }
}

