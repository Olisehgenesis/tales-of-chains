import { Router } from 'express';
import { prisma } from '@/services/prisma';
import { z } from 'zod';

export const router = Router();

// Placeholder WalletConnect-based auth: receive a wallet address and issue a session token.
// On-chain verification is deferred; this endpoint is a placeholder for WC handshake.
const AuthPayload = z.object({ walletAddress: z.string().min(1) });

router.post('/wallet', async (req, res) => {
  const parse = AuthPayload.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: 'Invalid payload' });
  }
  const { walletAddress } = parse.data;
  const address = walletAddress.toLowerCase();

  const user = await prisma.user.upsert({
    where: { walletAddress: address },
    update: {},
    create: { walletAddress: address }
  });

  // Very simple token for now (NOT secure); replace with proper session/JWT later.
  const token = `sess_${user.id}_${Date.now()}`;
  await prisma.session.create({ data: { userId: user.id, token } });
  res.json({ token, userId: user.id });
});


