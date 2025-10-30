import { Router } from 'express';
import { ensureAuth } from '@/services/session';
import { prisma } from '@/services/prisma';
import { BattleEngine } from '@/services/battleEngine';

export const router = Router();

router.get('/', ensureAuth, async (_req, res) => {
  const battles = await prisma.battle.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
  res.json({ battles });
});

router.post('/', ensureAuth, async (req, res) => {
  const { characterIds, durationMinutes } = req.body ?? {};
  if (!Array.isArray(characterIds) || characterIds.length < 2) {
    return res.status(400).json({ error: 'Provide at least 2 characterIds' });
  }
  const minutes = Math.max(1, Number(durationMinutes || 10));

  const battle = await prisma.battle.create({
    data: {
      status: 'PENDING',
      durationMinutes: minutes,
      universe: 'unknown'
    }
  });

  await prisma.battleParticipant.createMany({
    data: characterIds.map((cid: string) => ({ battleId: battle.id, characterId: cid }))
  });

  BattleEngine.start(battle.id).catch((err) => {
    console.error('BattleEngine start error', err);
  });

  res.json({ battleId: battle.id });
});

router.get('/:id', ensureAuth, async (req, res) => {
  const id = req.params.id;
  const battle = await prisma.battle.findUnique({ where: { id }, include: { messages: true, participants: true } });
  if (!battle) return res.status(404).json({ error: 'Not found' });
  res.json({ battle });
});


