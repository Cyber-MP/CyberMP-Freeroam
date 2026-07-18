import { contract, procedure } from '@cybermp/rpc-router/server';
import {
  type RaceFinishedRacer,
  zRaceFinishedRacer,
  zRaceRacerDTO,
  zRaceRankDTO,
} from '@freeroam/shared/game-modes/race';
import { proxy } from 'valtio';
import z from 'zod';

export const raceResultsState = proxy<{ results: RaceFinishedRacer[] }>({
  results: [],
});

const zRaceRacerBrowserDTO = zRaceRacerDTO.extend({
  totalLaps: z.number(),
  totalCheckpoints: z.number(),
});

export type RaceRacerBrowserDTO = z.infer<typeof zRaceRacerBrowserDTO>;

export const raceDataState = proxy<RaceRacerBrowserDTO>({
  currentCheckpointIndex: 0,
  currentLap: 0,
  finished: false,
  totalLaps: 0,
  totalCheckpoints: 0,
});

export const raceContract = {
  setCountdownText: contract.input(z.string()).build(),
  updateData: procedure.input(zRaceRacerBrowserDTO).handler((c) => {
    for (const key in c.data) {
      // @ts-expect-error
      raceDataState[key] = c.data[key];
    }
  }),
  updateRanks: contract.input(z.array(zRaceRankDTO)).build(),
  showRespawn: contract.input(z.number()).build(),
  hideRespawn: contract.build(),
  forceFinishTimer: contract.input(z.number()).build(),
  setResults: procedure.input(z.array(zRaceFinishedRacer)).handler((c) => {
    raceResultsState.results = c.data;
  }),
};
