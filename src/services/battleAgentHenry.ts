import { prisma } from './prisma.ts';
import { dispatchWebhook } from './webhooks.ts';
import { aiPickUniverse, aiGenerateIntro } from '../utils/ai/index.ts';

type ParticipantState = {
  id: string; // BattleParticipant.id
  characterId: string;
  name: string;
  hp: number;
  status: 'ALIVE' | 'DOWNED' | 'DEAD' | 'RESURRECTED';
  kills: number;
  deaths: number;
  superpowers: string[];
  weaknesses: string[];
};

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function choice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function buildNarrative(args: {
  universe: string;
  mood: string;
  turn: number;
  actor: ParticipantState;
  target: ParticipantState;
  action: string;
  effect: string;
  damage: number;
  outcome: string;
}): string {
  const { universe, mood, turn, actor, target, action, effect, damage, outcome } = args;
  return `Turn ${turn}: [${universe} • ${mood}] ${actor.name} ${action} ${target.name} (${effect}) — ${outcome}.`;
}

export class BattleAgentHenry {
  static async run(battleId: string) {
    const battle = await prisma.battle.update({
      where: { id: battleId },
      data: {
        status: 'ACTIVE',
        universe: (await aiPickUniverse()) || 'The Cookie-Crowned Realms',
      }
    });

    const mood = choice([
      'solemn omens',
      'thunderous bravado',
      'whispered prophecies',
      'emberlit duels',
      'midnight valor',
      'stormglass fury',
      'cosmic hush'
    ]);

    await dispatchWebhook('battle.started', { battleId, universe: battle.universe, mood });

    const participantsDb = await prisma.battleParticipant.findMany({
      where: { battleId },
      include: { character: { include: { superpowers: true, weaknesses: true } } }
    });

    const participants: ParticipantState[] = participantsDb.map((p) => ({
      id: p.id,
      characterId: p.characterId,
      name: p.character.name,
      hp: (p as any).hp ?? 100,
      status: ((p as any).status as ParticipantState['status']) ?? 'ALIVE',
      kills: (p as any).kills ?? 0,
      deaths: (p as any).deaths ?? 0,
      superpowers: p.character.superpowers.map((s) => s.value),
      weaknesses: p.character.weaknesses.map((w) => w.value)
    }));

    const alive = () => participants.filter((s) => s.status === 'ALIVE' || s.status === 'RESURRECTED');

    const baseTurns = participants.length <= 2 ? randomBetween(5, 10) : randomBetween(Math.max(6, participants.length + 2), Math.max(14, participants.length * 3));
    const targetTurns = Math.max(5, Math.ceil((battle.durationMinutes || 10) / 2), baseTurns);

    // Track pairwise encounters; any pair can meet at most twice
    const meetCounts = new Map<string, number>();
    const canMeet = (a: ParticipantState, b: ParticipantState) => {
      const key = [a.id, b.id].sort().join(':');
      return (meetCounts.get(key) || 0) < 2;
    };
    const markMeet = (a: ParticipantState, b: ParticipantState) => {
      const key = [a.id, b.id].sort().join(':');
      meetCounts.set(key, (meetCounts.get(key) || 0) + 1);
    };

    // Opening lore by AI (falls back to minimal if key missing)
    const namesList = participants.map((p) => p.name);
    const introLong = await aiGenerateIntro({ universe: battle.universe, mood, names: namesList });
    await prisma.battleMessage.create({ data: ({ battleId, turn: 0, content: introLong, contentJson: JSON.stringify({ type: 'intro', long: introLong, mood, universe: battle.universe, names: namesList }) } as any) });

    for (let turn = 1; turn <= targetTurns; turn++) {
      // Stop if winner(s) remain
      if (alive().length <= 1) break;

      // Resurrection chance for any DEAD
      for (const s of participants) {
        if (s.status === 'DEAD' && Math.random() < 0.12) {
          s.status = 'RESURRECTED';
          s.hp = randomBetween(25, 60);
          await prisma.battleParticipant.update({ where: { id: s.id }, data: ({ status: 'RESURRECTED', hp: s.hp } as any) });
          const resMove = {
            type: 'resurrection',
            turn,
            actorId: s.id,
            targetId: s.id,
            action: 'returns from the brink',
            effect: 'phoenix-breath',
            damage: 0,
            outcome: `${s.name} rises anew with ${s.hp} HP`
          };
          const resLine = buildNarrative({ universe: battle.universe, mood, turn, actor: s, target: s, action: 'returns from the brink', effect: 'phoenix-breath', damage: 0, outcome: '[reborn]' });
          await prisma.battleMessage.create({ data: ({ battleId, turn, content: resLine, contentJson: JSON.stringify(resMove) } as any) });
          await dispatchWebhook('battle.move', { battleId, turn, move: resMove, line: resLine });
        }
      }

      const currentAlive = alive();
      if (currentAlive.length <= 1) break;

      // Some may snooze off and be lost to the dunes
      if (Math.random() < 0.08) {
        const sleeper = choice(currentAlive);
        sleeper.status = Math.random() < 0.5 ? 'DEAD' : 'ALIVE';
        if (sleeper.status === 'DEAD') {
          await prisma.battleParticipant.update({ where: { id: sleeper.id }, data: ({ status: 'DEAD' } as any) });
          const snoozeMove = { type: 'snooze', turn, actorId: sleeper.id, targetId: sleeper.id, action: 'dozes into myth', effect: 'desert-lullaby', damage: 0, outcome: `${sleeper.name} is never seen again` };
          const snoozeLine = `Turn ${turn}: [${battle.universe} • ${mood}] ${sleeper.name} [dozes into myth] — a gentle vanishing.`;
          await prisma.battleMessage.create({ data: ({ battleId, turn, content: snoozeLine, contentJson: JSON.stringify(snoozeMove) } as any) });
          await dispatchWebhook('battle.move', { battleId, turn, move: snoozeMove, line: snoozeLine });
          continue;
        }
      }

      // Choose a pair that has not met more than twice
      let actor = choice(currentAlive);
      let candidates = currentAlive.filter((s) => s.id !== actor.id && canMeet(actor, s));
      let target = candidates.length > 0 ? choice(candidates) : choice(currentAlive.filter((s) => s.id !== actor.id));
      if (!target) target = actor; // extreme fallback
      markMeet(actor, target);

      const power = choice(actor.superpowers.length ? actor.superpowers : ['improvised fury']);
      const weakness = choice(target.weaknesses.length ? target.weaknesses : ['hubris']);
      const action = choice([
        `[unleashes ${power}]`,
        `[channels ${power}]`,
        `[twists fate with ${power}]`,
        `[strikes through ${weakness}]`,
        `[slips the noose of fate]`,
        `[vanishes behind mirage-law]`,
      ]);
      const effect = choice(['arc-light', 'void-echo', 'sunshard', 'iron-howl', 'larkstep', 'auric surge']);
      // HP plays little role; outcomes focus on narrative
      const damage = randomBetween(0, 10); // minimal numeric impact
      let roll = Math.random();
      let outcome = 'they disengage, debts accruing with the wind';
      if (roll < 0.12) outcome = `${target.name} escapes into the dunes`;
      else if (roll < 0.24) outcome = `${target.name} is wounded in spirit`;
      else if (roll < 0.32) outcome = `${target.name} stumbles—sand keeps the secret`;
      else if (roll < 0.40) outcome = `${target.name} laughs, which is worrying`;
      else if (roll < 0.46) outcome = `${actor.name} nearly trips on the plot`;
      else if (roll < 0.54) outcome = `${target.name} loses something they can’t name`;
      else if (roll < 0.62) outcome = `${actor.name} loses time; it returns different`;
      else if (roll < 0.70) outcome = `${target.name} is [felled] by a stray omen`;
      else if (roll < 0.74) outcome = `the dunes applaud politely`;

      // Occasionally, a true death (non-HP based)
      if (roll < 0.08 && (target.status === 'ALIVE' || target.status === 'RESURRECTED')) {
        target.status = 'DEAD';
        actor.kills += 1;
        target.deaths += 1;
        outcome = `${target.name} falls`;
        await prisma.battleParticipant.update({ where: { id: target.id }, data: ({ status: 'DEAD', deaths: target.deaths } as any) });
        await prisma.battleParticipant.update({ where: { id: actor.id }, data: ({ kills: actor.kills } as any) });
      }

      await prisma.battleParticipant.update({
        where: { id: target.id },
        data: ({ hp: target.hp, status: target.status, deaths: target.deaths } as any)
      });
      await prisma.battleParticipant.update({
        where: { id: actor.id },
        data: ({ kills: actor.kills } as any)
      });

      const move = {
        type: 'attack',
        turn,
        actorId: actor.id,
        targetId: target.id,
        action,
        effect,
        damage,
        outcome,
        short: `${actor.name} ${action} ${target.name} — ${outcome}`,
        long: `${actor.name} crossed paths with ${target.name}, and the air itself leaned closer. ${actor.name} ${action.replaceAll('[','').replaceAll(']','')} as ${effect} rumbled quiet under the ribs; ${outcome}.`,
        actor,
        target
      };

      const line = buildNarrative({ universe: battle.universe, mood, turn, actor, target, action, effect, damage, outcome });

      await prisma.battleMessage.create({ data: ({ battleId, turn, content: line, contentJson: JSON.stringify(move) } as any) });
      await dispatchWebhook('battle.move', { battleId, turn, move, line });

      const delayMs = randomBetween(2000, 5000);
      await new Promise((r) => setTimeout(r, delayMs));
    }

    const survivors = alive();
    const outcome = survivors.length === 0
      ? 'All contenders have fallen. The field is scorched and silent.'
      : survivors.length === 1
      ? `${survivors[0].name} stands alone.`
      : `${survivors.map((s) => s.name).join(', ')} endure.`;

    await prisma.battle.update({ where: { id: battleId }, data: ({ status: 'COMPLETED', outcome } as any) });
    // Outro with a light jab
    const joke = (() => {
      const pool = [
        'Note to the fallen: respawn timers are vibes-based here.',
        'Winner tried to look humble; the dunes rolled their eyes.',
        'Somewhere, a bard is taking all the credit.',
        'Loser requested a rematch; the wind said “loading…”',
      ];
      return choice(pool);
    })();
    const outro = `When the grit settles, ${outcome}\n\nAs for the Children of the Unknown and the Death who feared them—turns out the punchline was older than either. ${joke}`;
    await prisma.battleMessage.create({ data: ({ battleId, turn: 9999, content: outro, contentJson: JSON.stringify({ type: 'outro', long: outro, joke }) } as any) });
    await dispatchWebhook('battle.completed', { battleId, outcome });
  }
}


