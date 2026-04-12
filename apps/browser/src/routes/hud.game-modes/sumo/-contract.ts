import { contract } from '@cybermp/rpc-router/server';
import type {
  SumoSurvivedRacer,
  zSumoRacerDTO,
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

  showSurrender: contract.input(z.number()).build(),
  hideSurrender: contract.build(),
};
