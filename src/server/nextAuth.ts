import { headers } from 'next/headers';
import { prisma } from '@/services/prisma';

export async function requireAuth(): Promise<string> {
  const h = await headers();
  const auth = h.get('authorization') || '';
  if (!auth.startsWith('Bearer ')) throw new Error('401');
  const token = auth.slice('Bearer '.length);
  const session = await prisma.session.findUnique({ where: { token } });
  if (!session) throw new Error('401');
  return session.userId;
}


