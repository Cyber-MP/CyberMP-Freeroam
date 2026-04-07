import { inject, injectable } from 'inversify';
import { sleep } from 'radash';
import { mp } from '../../mp';
import { GHealthService } from './health/health.service';
import { GStatusEffectsService } from './status-effects/status-effects.service';

@injectable()
export class GPlayerService {
  private freezeTickId: number | null = null;

  private readonly FREEZE_FLAGS = [
    'GameplayRestriction.NoMovement',
    'GameplayRestriction.NoCombat',
    'GameplayRestriction.NoWeapons',
  ];

  constructor(
    @inject(GHealthService) private readonly healthService: GHealthService,
    @inject(GStatusEffectsService)
    private readonly statusEffects: GStatusEffectsService,
  ) {}

  invisible(value: boolean) {
    for (const component of mp.game.GetPlayer().GetComponents()) {
      if (
        !component.IsA('entIVisualComponent') ||
        component.GetName().toLowerCase().includes('light')
      )
        continue;

      component.Toggle(!value);
    }
  }

  private async freezeTick() {
    const player = mp.game.GetPlayerObject();

    const pos = player.GetWorldPosition();

    for (const flag of this.FREEZE_FLAGS) {
      this.statusEffects.add(flag);
    }

    this.healthService.god(true);

    await sleep(100);

    mp.game.ScriptGameInstance.GetTeleportationFacility().Teleport(
      player,
      { ...pos, z: pos.z + Math.abs(player.GetWorldPosition().z - pos.z) },
      mp.game.Quaternion.ToEulerAngles(player.GetWorldOrientation()),
    );
  }

  freeze(value: boolean) {
    if (value) {
      this.freezeTickId = mp.setTick(this.freezeTick.bind(this));
      return;
    }

    if (this.freezeTickId) {
      mp.clearTick(this.freezeTickId);
    }

    this.freezeTickId = null;

    for (const flag of this.FREEZE_FLAGS) {
      this.statusEffects.remove(flag);
    }

    this.healthService.god(false);
  }
}
