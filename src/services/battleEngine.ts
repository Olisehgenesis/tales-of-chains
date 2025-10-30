import { prisma } from './prisma.ts';
import { BattleAgentHenry } from './battleAgentHenry.ts';
import { BattleAgentOneCall } from './battleAgentOneCall.ts';

function randomBetweenMs(minMs: number, maxMs: number) {
  return Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
}

export class BattleEngine {
  static async start(battleId: string) {
    const mode = process.env.BATTLE_MODE || 'henry';
    if (mode === 'onecall') {
      await BattleAgentOneCall.run(battleId);
    } else {
      await BattleAgentHenry.run(battleId);
    }
  }
}


