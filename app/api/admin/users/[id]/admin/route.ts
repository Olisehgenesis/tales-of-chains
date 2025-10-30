import { prisma } from '@/services/prisma';
import { requireAuth } from '@/server/nextAuth';

async function requireAdmin(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.isAdmin) throw new Error('403');
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const uid = await requireAuth();
    await requireAdmin(uid);
    const body = await request.json().catch(() => ({}));
    const user = await prisma.user.update({ where: { id: params.id }, data: { isAdmin: Boolean(body.isAdmin) } });
    return Response.json({ user });
  } catch (e: any) {
    const status = e.message === '401' ? 401 : e.message === '403' ? 403 : 500;
    return new Response(null, { status });
  }
}


