import express from 'express';
import cors from 'cors';
import { json } from 'express';
import { router as healthRouter } from '@/server/routes/health';
import { router as authRouter } from '@/server/routes/auth';
import { router as charactersRouter } from '@/server/routes/characters';
import { router as mintRouter } from '@/server/routes/mint';
import { router as battlesRouter } from '@/server/routes/battles';
import { router as webhooksRouter } from '@/server/routes/webhooks';
import { router as usersRouter } from '@/server/routes/users';
import { router as adminRouter } from '@/server/routes/admin';

export async function createServer() {
  const app = express();
  app.use(cors());
  app.use(json({ limit: '1mb' }));

  app.use('/health', healthRouter);
  app.use('/auth', authRouter);
  app.use('/characters', charactersRouter);
  app.use('/mint', mintRouter);
  app.use('/battles', battlesRouter);
  app.use('/webhooks', webhooksRouter);
  app.use('/users', usersRouter);
  app.use('/admin', adminRouter);

  app.get('/', (_req, res) => {
    res.json({ name: 'Tales Of The Chains', ok: true });
  });

  return app;
}


