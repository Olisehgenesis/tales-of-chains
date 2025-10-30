import { prisma } from './prisma.ts';
import { dispatchWebhook } from './webhooks.ts';
import { aiGenerateLore } from '../utils/ai/index.ts';

type Participant = {
  id: string;
  characterId: string;
  name: string;
  superpowers: string[];
  weaknesses: string[];
};

type BattleLog = {
  intro: string;
  turns: Array<{
    turn: number;
    actor: string;
    target: string;
    action: string;
    effect: string;
    outcome: string;
    narrative: string;
  }>;
  outro: string;
  outcome: string;
};

export class BattleAgentOneCall {
  static async run(battleId: string) {
    const participantsDb = await prisma.battleParticipant.findMany({
      where: { battleId },
      include: { character: { include: { superpowers: true, weaknesses: true } } }
    });

    const participants: Participant[] = participantsDb.map((p) => ({
      id: p.id,
      characterId: p.characterId,
      name: p.character.name,
      superpowers: p.character.superpowers.map((s) => s.value),
      weaknesses: p.character.weaknesses.map((w) => w.value)
    }));

    const prompt = `You are a narrator of a mythic AI-driven battle.\n\nWrite a structured JSON story of a poetic, dark-fantasy battle between these characters:\n${participants
      .map((p) => `- ${p.name} (powers: ${p.superpowers.join(', ')}, weaknesses: ${p.weaknesses.join(', ')})`)
      .join('\n')}\n\nInclude exactly:\n{\n  "intro": "...",\n  "turns": [\n    {\n      "turn": number,\n      "actor": string,\n      "target": string,\n      "action": string,\n      "effect": string,\n      "outcome": string,\n      "narrative": "3-4 sentence vivid description with emojis"\n    }\n  ],\n  "outro": "...",\n  "outcome": "Final poetic summary of who stands or all fall"\n}\n\nTone: cinematic, poetic, and mythic. Include atmospheric emojis like ⚔️🌑💀🔥🌌 when relevant. Ensure 6–10 total turns.`;

    const aiResponse = await aiGenerateLore(prompt);

    let story: BattleLog;
    try {
      story = JSON.parse(aiResponse);
    } catch {
      throw new Error('AI returned invalid JSON');
    }

    await prisma.battle.update({ where: { id: battleId }, data: ({ status: 'ACTIVE' } as any) });

    await prisma.battleMessage.create({
      data: ({ battleId, turn: 0, content: story.intro, contentJson: JSON.stringify({ type: 'intro' }) } as any)
    });

    await dispatchWebhook('battle.started', { battleId, intro: story.intro });

    for (const t of story.turns) {
      await prisma.battleMessage.create({
        data: ({ battleId, turn: t.turn, content: t.narrative, contentJson: JSON.stringify(t) } as any)
      });
      await dispatchWebhook('battle.move', { battleId, turn: t.turn, move: t });
    }

    await prisma.battle.update({ where: { id: battleId }, data: ({ status: 'COMPLETED', outcome: story.outcome } as any) });

    await prisma.battleMessage.create({
      data: ({ battleId, turn: 9999, content: `${story.outro}\n\n${story.outcome}`, contentJson: JSON.stringify({ type: 'outro' }) } as any)
    });

    await dispatchWebhook('battle.completed', { battleId, outcome: story.outcome });
  }
}


