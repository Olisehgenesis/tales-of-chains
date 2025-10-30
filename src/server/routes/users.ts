import { Router } from 'express';
import { ensureAuth } from '@/services/session';
import { prisma } from '@/services/prisma';

export const router = Router();

router.get('/me', ensureAuth, async (req, res) => {
  const userId = req.userId!;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(404).json({ error: 'Not found' });
  const counts = await prisma.$transaction([
    prisma.character.count({ where: { userId } }),
    prisma.battleParticipant.count({ where: { character: { userId } } })
  ]);
  res.json({
    user: {
      id: user.id,
      walletAddress: user.walletAddress,
      fid: user.fid,
      username: user.username,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt
    },
    stats: { characters: counts[0], battlesParticipated: counts[1] }
  });
});

router.get('/leaderboard', ensureAuth, async (_req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, username: true, walletAddress: true, createdAt: true, characters: { select: { id: true } } }
  });
  const leaderboard = users
    .map((u) => ({ id: u.id, username: u.username, walletAddress: u.walletAddress, createdAt: u.createdAt, score: u.characters.length }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 50);
  res.json({ leaderboard });
});


