import { contract, procedure } from '@cybermp/rpc-router/server';
import {
  type RaceLapsFinishedRacer,
  zRaceLapsFinishedRacer,
  zRaceLapsRacerDTO,
  zRaceLapsRankDTO,
} from '@freeroam/shared/game-modes/race-laps';
import { proxy } from 'valtio';
import z from 'zod';

export const raceLapsResultsState = proxy<{ results: RaceLapsFinishedRacer[] }>(
  {
    results: [],
  },
);

const zRaceLapsRacerBrowserDTO = zRaceLapsRacerDTO.extend({
  totalLaps: z.number(),
  totalCheckpoints: z.number(),
});

export type RaceLapsRacerBrowserDTO = z.infer<typeof zRaceLapsRacerBrowserDTO>;

export const raceLapsDataState = proxy<RaceLapsRacerBrowserDTO>({
  currentCheckpointIndex: 0,
  currentLap: 0,
  finished: false,
  totalLaps: 0,
  totalCheckpoints: 0,
});

export const raceLapsContract = {
  setCountdownText: contract.input(z.string()).build(),
  updateData: procedure.input(zRaceLapsRacerBrowserDTO).handler((c) => {
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
