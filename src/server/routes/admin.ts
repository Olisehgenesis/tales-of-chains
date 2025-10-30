import { Router } from 'express';
import { ensureAuth } from '@/services/session';
import { prisma } from '@/services/prisma';

export const router = Router();

async function ensureAdmin(req: any, res: any, next: any) {
  const user = await prisma.user.findUnique({ where: { id: req.userId! } });
  if (!user?.isAdmin) return res.status(403).json({ error: 'Admin only' });
  next();
}

router.get('/users', ensureAuth, ensureAdmin, async (_req, res) => {
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 200 });
  res.json({ users });
});

router.post('/users/:id/admin', ensureAuth, ensureAdmin, async (req, res) => {
  const id = req.params.id;
  const { isAdmin } = req.body ?? {};
  const user = await prisma.user.update({ where: { id }, data: { isAdmin: Boolean(isAdmin) } });
  res.json({ user });
});

router.get('/webhooks', ensureAuth, ensureAdmin, async (_req, res) => {
  const subs = await prisma.webhookSubscription.findMany({ orderBy: { createdAt: 'desc' } });
  res.json({ subscriptions: subs });
});


