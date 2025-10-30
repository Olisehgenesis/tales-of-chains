## Tales of Chains

Next.js app with wallet auth, AI-driven battles, live webhooks, and responsive cinematic UI backgrounds.

### Quick start

1. Set env vars:
   - `DATABASE_URL` (default sqlite file: `file:./dev.db`)
   - `PORT` (default 4000)
2. Install deps: `pnpm install`
3. Generate Prisma client: `npm run prisma:generate`
4. Dev: `npm run dev`

Note: prisma generate must run before build.

### Wallet connect (Header)

- Two-button header wallet:
  - Balance: shows native balance via `viem` on the connected chain
  - Profile: circular avatar from `src/assets/profile.png`, dropdown → Profile / Logout
- Stores `walletAddress` and `token` in `localStorage` after auth.

### Battles

- Background worker processes pending battles and emits `battle.move` webhooks during the fight.
- Two engines:
  - Henry (default): streaming, pseudo-real-time turns, pair limits, resurrection, jokes
  - One-call: single AI call returns intro + 6–10 turns + outro
- Switch via env: `BATTLE_MODE=onecall` to use one-call agent; otherwise Henry.

### Webhooks

- Subscribe via `/api/webhooks/subscribe` and receive:
  - `battle.started` { battleId, ... }
  - `battle.move` { battleId, turn, move }
  - `battle.completed` { battleId, outcome }

### REST routes (selected)

- `POST /auth/wallet` → placeholder wallet connect session
- `GET /characters` (auth)
- `POST /characters` (auth) → validates 3–5 superpowers, 1–2 weaknesses, max 3 characters per user
- `POST /mint/preview` (auth) → AI text + image preview with fallbacks
- `POST /mint/mint` (auth) → placeholder on-chain mint
- `POST /battles` (auth) → start a battle, timed messages (>5) with AI narration
- `GET /battles/:id` (auth)
- `POST /webhooks/subscribe` (auth)
- `POST /webhooks/unsubscribe` (auth)

### AI

- Real model calls via Segmind when `SEGMIND_API_KEY` is set:
  - `aiGenerateIntro` generates mystical Turn 0 intro
  - `aiGenerateLore` returns structured JSON for one-call battles
- Fallback generators are used only if no API key is present.

### On-chain (viem)

- `src/utils/viemClient.ts` reads native balance from the connected chain (via `window.ethereum` or `NEXT_PUBLIC_RPC_URL`).

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3004](http://localhost:3004) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Env & scripts

Required/minimal env:

```
DATABASE_URL="file:./prisma/prisma/dev.db"
NEXT_PUBLIC_RPC_URL="https://cloudflare-eth.com" # optional if using window.ethereum
SEGMIND_API_KEY="sk_..." # optional; enables AI intro/lore
```

Common scripts:

```
pnpm prisma:migrate
pnpm prisma:generate
pnpm dev            # Next + worker concurrently
pnpm worker:dev     # only the battle worker
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
