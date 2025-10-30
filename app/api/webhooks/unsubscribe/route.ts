import { prisma } from '@/services/prisma';
import { requireAuth } from '@/server/nextAuth';

export async function POST(request: Request) {
  try {
    await requireAuth();
    const { id } = await request.json();
    if (!id) return new Response(JSON.stringify({ error: 'id required' }), { status: 400 });
    await prisma.webhookSubscription.delete({ where: { id } });
    return Response.json({ ok: true });
  } catch (e: any) {
    return new Response(null, { status: e.message === '401' ? 401 : 500 });
  }
}


