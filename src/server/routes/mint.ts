import { Router } from 'express';
import { ensureAuth } from '@/services/session';
import { aiDescribeCharacter, aiGenerateAvatar } from '@/utils/ai';
import { validateCharacterSpec } from '@/utils/characters';

export const router = Router();

// Step 1: Generate text + image preview for a character spec
router.post('/preview', ensureAuth, async (req, res) => {
  const spec = req.body;
  const valid = validateCharacterSpec(spec);
  if (!valid.ok) return res.status(400).json({ error: valid.error });

  const description = await aiDescribeCharacter(spec);
  const imageUrl = await aiGenerateAvatar(spec, description);
  res.json({ description, imageUrl });
});

// Step 2: Mint placeholder (on-chain to be implemented later with viem)
router.post('/mint', ensureAuth, async (_req, res) => {
  // Placeholder: integrate on-chain mint later
  res.json({ status: 'pending_onchain_integration' });
});


