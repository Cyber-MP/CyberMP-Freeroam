import { contract, procedure } from '@cybermp/rpc-router/server';
import {
  type SumoSurvivedRacer,
  zSumoRacerDTO,
  zSumoSurvivedRacer,
} from '@freeroam/shared/game-modes/sumo';
import { proxy } from 'valtio';
import z from 'zod';

export const sumoResultsState = proxy<{ survived: SumoSurvivedRacer | null }>({
  survived: null,
});

export type SumoRacerBrowserDTO = z.infer<typeof zSumoRacerDTO>;

export const sumoDataState = proxy<SumoRacerBrowserDTO>({
  survived: false,
});

export const sumoContract = {
  setCountdownText: contract.input(z.string()).build(),
  updateData: procedure.input(zSumoRacerDTO).handler((c) => {
    for (const key in c.data) {
      // @ts-expect-error
      sumoDataState[key] = c.data[key];
    }
  }),
  showSurrender: contract.input(z.number()).build(),
  hideSurrender: contract.build(),
  setResults: procedure.input(zSumoSurvivedRacer).handler((c) => {
    sumoResultsState.survived = c.data;
  }),
};
