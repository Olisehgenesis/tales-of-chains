import { prisma } from '@/services/prisma';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const walletAddress = String(body.walletAddress || '').toLowerCase();
  if (!walletAddress) return new Response(JSON.stringify({ error: 'Invalid payload' }), { status: 400 });

  const user = await prisma.user.upsert({
    where: { walletAddress },
    update: {},
    create: { walletAddress }
  });
  const token = `sess_${user.id}_${Date.now()}`;
  await prisma.session.create({ data: { userId: user.id, token } });
  return Response.json({ token, userId: user.id });
}


