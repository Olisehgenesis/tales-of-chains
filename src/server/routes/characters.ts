import { Router } from 'express';
import { prisma } from '@/services/prisma';
import { ensureAuth } from '@/services/session';
import { validateCharacterSpec } from '@/utils/characters';

export const router = Router();

router.get('/', ensureAuth, async (req, res) => {
  const userId = req.userId!;
  const chars = await prisma.character.findMany({
    where: { userId },
    include: { superpowers: true, weaknesses: true }
  });
  const mapped = chars.map((c) => ({
    id: c.id,
    userId: c.userId,
    name: c.name,
    avatarImageUrl: c.avatarImageUrl,
    superpowers: c.superpowers.map((p) => p.value),
    weaknesses: c.weaknesses.map((w) => w.value),
    createdAt: c.createdAt
  }));
  res.json({ characters: mapped });
});

router.post('/', ensureAuth, async (req, res) => {
  const userId = req.userId!;
  const existingCount = await prisma.character.count({ where: { userId } });
  if (existingCount >= 3) {
    return res.status(400).json({ error: 'Max 3 characters per user' });
  }
  const spec = req.body;
  const valid = validateCharacterSpec(spec);
  if (!valid.ok) {
    return res.status(400).json({ error: valid.error });
  }

  const created = await prisma.character.create({
    data: {
      userId,
      name: spec.name,
      avatarImageUrl: spec.avatarImageUrl ?? null,
      superpowers: { create: spec.superpowers.map((v: string) => ({ value: v })) },
      weaknesses: { create: spec.weaknesses.map((v: string) => ({ value: v })) }
    },
    include: { superpowers: true, weaknesses: true }
  });
  res.json({
    character: {
      id: created.id,
      userId: created.userId,
      name: created.name,
      avatarImageUrl: created.avatarImageUrl,
      superpowers: created.superpowers.map((p) => p.value),
      weaknesses: created.weaknesses.map((w) => w.value),
      createdAt: created.createdAt
    }
  });
});


