import { inject, injectable } from 'inversify';
import { GStatusEffectsService } from '../game/status-effects/status-effects.service';

@injectable()
export class GreenZonesService {
  constructor(
    @inject(GStatusEffectsService)
    private statusEffectsService: GStatusEffectsService,
  ) {}

  enter() {
    this.statusEffectsService.add('GameplayRestriction.NoCombat');
    this.statusEffectsService.add('GameplayRestriction.NoWeapons');
  }

  leave() {
    this.statusEffectsService.remove('GameplayRestriction.NoCombat');
    this.statusEffectsService.remove('GameplayRestriction.NoWeapons');
  }
}
