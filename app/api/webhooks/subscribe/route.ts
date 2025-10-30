import { prisma } from '@/services/prisma';
import { requireAuth } from '@/server/nextAuth';

export async function POST(request: Request) {
  try {
    await requireAuth();
    const { url, event } = await request.json();
    if (!url || !event) return new Response(JSON.stringify({ error: 'url and event required' }), { status: 400 });
    const sub = await prisma.webhookSubscription.create({ data: { url, event } });
    return Response.json({ subscription: sub });
  } catch (e: any) {
    return new Response(null, { status: e.message === '401' ? 401 : 500 });
  }
}


