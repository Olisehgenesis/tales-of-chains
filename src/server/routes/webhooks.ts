import { Router } from 'express';
import { ensureAuth } from '@/services/session';
import { prisma } from '@/services/prisma';

export const router = Router();

router.post('/subscribe', ensureAuth, async (req, res) => {
  const { url, event } = req.body ?? {};
  if (!url || !event) return res.status(400).json({ error: 'url and event required' });
  const sub = await prisma.webhookSubscription.create({ data: { url, event } });
  res.json({ subscription: sub });
});

router.post('/unsubscribe', ensureAuth, async (req, res) => {
  const { id } = req.body ?? {};
  if (!id) return res.status(400).json({ error: 'id required' });
  await prisma.webhookSubscription.delete({ where: { id } });
  res.json({ ok: true });
});


