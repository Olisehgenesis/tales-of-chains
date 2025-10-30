import axios from 'axios';
import { prisma } from './prisma.ts';

export async function dispatchWebhook(event: string, payload: unknown) {
  const subs = await prisma.webhookSubscription.findMany({ where: { event } });
  await Promise.all(
    subs.map((s) =>
      axios.post(s.url, { event, payload }).catch((err) => {
        console.error('Webhook dispatch failed', s.url, err.message);
      })
    )
  );
}


