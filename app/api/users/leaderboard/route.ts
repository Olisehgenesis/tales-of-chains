import { prisma } from '@/services/prisma';
import { requireAuth } from '@/server/nextAuth';

export async function GET() {
  try {
    await requireAuth();
    const users = await prisma.user.findMany({ select: { id: true, username: true, walletAddress: true, createdAt: true, characters: { select: { id: true } } } });
    const leaderboard = users.map(u => ({ id: u.id, username: u.username, walletAddress: u.walletAddress, createdAt: u.createdAt, score: u.characters.length }))
      .sort((a,b)=> b.score-a.score).slice(0,50);
    return Response.json({ leaderboard });
  } catch (e: any) {
    return new Response(null, { status: e.message === '401' ? 401 : 500 });
  }
}


