import { config } from 'dotenv';
config();

import { createServer } from '@/server/app';

const port = Number(process.env.PORT || 4000);

async function main() {
  const app = await createServer();
  app.listen(port, () => {
    console.log(`Tales Of The Chains API listening on http://localhost:${port}`);
  });
}

main().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});


