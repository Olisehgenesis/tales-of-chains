import { prisma } from '@/services/prisma';
import { requireAuth } from '@/server/nextAuth';

export async function GET() {
  try {
    const userId = await requireAuth();
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
    const [charactersCount, battlesCount] = await Promise.all([
      prisma.character.count({ where: { userId } }),
      prisma.battleParticipant.count({ where: { character: { userId } } })
    ]);
    return Response.json({ user: { id: user.id, walletAddress: user.walletAddress, fid: user.fid, username: user.username, isAdmin: user.isAdmin, createdAt: user.createdAt }, stats: { characters: charactersCount, battlesParticipated: battlesCount } });
  } catch (e: any) {
    return new Response(null, { status: e.message === '401' ? 401 : 500 });
  }
}


