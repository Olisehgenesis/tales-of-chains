import { prisma } from '../src/services/prisma.ts';
import { BattleEngine } from '../src/services/battleEngine.ts';
import { aiPickUniverse } from '../src/utils/ai/index.ts';
import { dispatchWebhook } from '../src/services/webhooks.ts';
import http from 'http';

const POLL_MS = 3000;

async function processPending() {
  const pendings = await prisma.battle.findMany({ where: { status: 'PENDING' }, take: 5 });
  for (const b of pendings) {
    // Set ACTIVE and hand off to engine (Henry runs the loop internally)
    const universe = await aiPickUniverse();
    await prisma.battle.update({ where: { id: b.id }, data: { status: 'ACTIVE', universe } });
    await dispatchWebhook('battle.started', { battleId: b.id, universe });
    BattleEngine.start(b.id).catch((e) => console.error('engine error', e));
  }
}

// No active processing; the engine handles moves until completion

async function loop() {
  try {
    await processPending();
  } catch (e) {
    console.error('worker error', e);
  } finally {
    setTimeout(loop, POLL_MS);
  }
}

console.log('Battle worker starting...');
loop();

// Lightweight HTTP server for health/status (optional)
const WORKER_PORT = Number(process.env.WORKER_PORT || 5001);
const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, ts: Date.now() }));
  } else {
    res.writeHead(404);
    res.end();
  }
});
server.listen(WORKER_PORT, () => {
  console.log(`Battle worker health server listening on http://localhost:${WORKER_PORT}`);
});


