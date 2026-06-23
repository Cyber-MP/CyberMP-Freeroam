import type { MpPlayer } from '@cybermp/server-types';
import { inject, injectable } from 'inversify';
import {
  type PlayerAbilityFactory,
  PlayerAbilityFactorySymbol,
} from './ability.factory';

@injectable()
export class AbilityService {
  constructor(
    @inject(PlayerAbilityFactorySymbol)
    private playerAbilityFactory: PlayerAbilityFactory,
  ) {}

  create(player: MpPlayer) {
    return this.playerAbilityFactory(player);
  }

  sync(player: MpPlayer) {
    const ability = this.playerAbilityFactory(player);

    console.log('updated');
  }
}
