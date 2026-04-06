import { contract } from '@cybermp/rpc-router/server';
import z from 'zod';

export const zRaceLapsRacerDTO = z.object({
  currentCheckpointIndex: z.number(),
  currentLap: z.number(),
  finished: z.boolean(),
  totalLaps: z.number(),
  totalCheckpoints: z.number(),
});

export type RaceLapsRacerDTO = z.infer<typeof zRaceLapsRacerDTO>;

export const zRaceLapsRankDTO = z.object({
  playerId: z.number(),
  playerNick: z.string(),
  position: z.number(),
  lap: z.number(),
  checkpoint: z.number(),
});

export type RaceLapsRankDTO = z.infer<typeof zRaceLapsRankDTO>;

export const raceLapsContract = {
  setCountdownText: contract.input(z.string()).build(),
  updateData: contract.input(zRaceLapsRacerDTO).build(),
  updateRanks: contract.input(z.array(zRaceLapsRankDTO)).build(),
  showRespawn: contract.input(z.number()).build(),
  hideRespawn: contract.build(),
};
