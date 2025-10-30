import { prisma } from '@/services/prisma';
import { requireAuth } from '@/server/nextAuth';

async function requireAdmin(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.isAdmin) throw new Error('403');
}

export async function GET() {
  try {
    const uid = await requireAuth();
    await requireAdmin(uid);
    const subs = await prisma.webhookSubscription.findMany({ orderBy: { createdAt: 'desc' } });
    return Response.json({ subscriptions: subs });
  } catch (e: any) {
    const status = e.message === '401' ? 401 : e.message === '403' ? 403 : 500;
    return new Response(null, { status });
  }
}


