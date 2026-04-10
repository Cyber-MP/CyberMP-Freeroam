import { contract, procedure } from '@cybermp/rpc-router/server';
import { proxy } from 'valtio';
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
  finished: z.boolean(),
});

export type RaceLapsRankDTO = z.infer<typeof zRaceLapsRankDTO>;

export const zRaceLapsFinishedRacer = z.object({
  playerNick: z.string(),
  lap: z.number(),
  checkpoint: z.number(),
  time: z.number(),
});

export type RaceLapsFinishedRacer = z.infer<typeof zRaceLapsFinishedRacer>;

export const raceLapsResultsState = proxy<{ results: RaceLapsFinishedRacer[] }>(
  {
    results: [],
  },
);

export const raceLapsDataState = proxy<RaceLapsRacerDTO>({
  currentCheckpointIndex: 0,
  currentLap: 0,
  finished: false,
  totalLaps: 0,
  totalCheckpoints: 0,
});

export const raceLapsContract = {
  setCountdownText: contract.input(z.string()).build(),
  updateData: procedure.input(zRaceLapsRacerDTO).handler((c) => {
    for (const key in c.data) {
      // @ts-expect-error
      raceLapsDataState[key] = c.data[key];
    }
  }),
  updateRanks: contract.input(z.array(zRaceLapsRankDTO)).build(),
  showRespawn: contract.input(z.number()).build(),
  hideRespawn: contract.build(),
  forceFinishTimer: contract.input(z.number()).build(),
  setResults: procedure.input(z.array(zRaceLapsFinishedRacer)).handler((c) => {
    raceLapsResultsState.results = c.data;
  }),
};
