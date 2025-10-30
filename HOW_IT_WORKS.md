## How It Works

### 1) Create Characters
- Go to `/profile` → create up to 3 characters per wallet.
- Each needs 3–5 superpowers and 1–2 weaknesses.

### 2) Host or Join Battles
- Host: `POST /api/battles` (or use the UI on `/battles`).
  - Optional: `allOut: true` to include all characters.
  - Optional prize: `prizeAmount`, `prizeCurrency`.
- Join: `POST /api/battles/:id/join` with a character.

### 3) Background Battle Engine
- Worker polls pending battles and starts them.
- Two modes (env: `BATTLE_MODE`):
  - `henry` (default): live simulated turns (2–5s), varied encounters, pair limits, occasional resurrection, comedic outro.
  - `onecall`: single AI call returns intro + 6–10 turns + outro, stored immediately.

### 4) AI
- If `SEGMIND_API_KEY` is set:
  - Turn 0 intro via `aiGenerateIntro`.
  - One-call story via `aiGenerateLore` (structured JSON).
- If no key: small local fallback is used just for dev.

### 5) Webhooks
Subscribe via `POST /api/webhooks/subscribe` and receive:
- `battle.started` { battleId, ... }
- `battle.move` { battleId, turn, move, line }
- `battle.completed` { battleId, outcome }

### 6) Data Model (Prisma)
- `Battle`: status, universe, duration, outcome, prize fields.
- `BattleParticipant`: per-character state (status, kills, deaths, hp-lite).
- `BattleMessage`: per-turn content; `contentJson` stores structured move JSON.

### 7) Bracket View (Battle Page)
- `/battles/[id]` polls the battle and renders:
  - A simple inferred tournament-style bracket (click pairs to read story).
  - A chronological log of messages (Turn 0 intro → turns → outro).

### 8) Wallet + Balance
- Header shows two buttons:
  - Native chain balance via `viem`.
  - Profile avatar with dropdown (Profile / Logout).

### 9) Cinematic Backgrounds
- Backgrounds are applied with a fixed React component using images in `public/`.
- Uses viewport size (≥ md) to choose desktop vs mobile images.

### 10) Dev Commands
```
pnpm prisma:migrate
pnpm prisma:generate
pnpm dev            # Next + worker concurrently
pnpm worker:dev     # only the battle worker
```


