import { Request, Response, NextFunction } from 'express';
import { prisma } from '@/services/prisma';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export async function ensureAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Missing auth' });
  const token = header.replace('Bearer ', '');
  const session = await prisma.session.findUnique({ where: { token } });
  if (!session) return res.status(401).json({ error: 'Invalid session' });
  req.userId = session.userId;
  next();
}


