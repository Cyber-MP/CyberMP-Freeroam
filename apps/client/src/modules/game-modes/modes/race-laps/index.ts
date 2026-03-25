import type {
  gameFxInstance,
  gameFxResource,
  Vector4,
  WorldTransform,
} from '@cybermp/client-types/game';
import type { GameModeName } from '@freeroam/shared';
import { inject, injectable } from 'inversify';
import { createEulerAngles, createVector4 } from '../../../../lib/vectors';
import { mp } from '../../../../mp';
import { browser } from '../../../../rpc/browser';
import { CefService } from '../../../cef/cef.service';
import { GHealthService } from '../../../game/health/health.service';
import { GStatusEffectsService } from '../../../game/status-effects/status-effects.service';
import { GTeleportService } from '../../../game/teleport/teleport.service';
import { GVehiclesService } from '../../../game/vehicles/vehicles.service';
import { BaseGameMode } from '../../game-mode';
import type {
  RaceLapsMap,
  RaceLapsPrepareDTO,
  RaceLapsStartPoint,
  RaceLapsTrackPath,
} from './dto';

class RaceNavigation {
  private fxInstances = new Map<gameFxInstance, WorldTransform>();

  private updateTick!: number;

  private updateFxInstances() {
    for (const [instance, transform] of this.fxInstances.entries()) {
      instance.SetBlackboardValue('alpha', 1);
      instance.UpdateTransform(transform);
    }
  }

  create(trackPath: RaceLapsTrackPath) {
    for (const path of trackPath) {
      const [x, y, z] = path.position;
      const [roll, pitch, yaw] = path.rotation;

      const transform = new mp.game.WorldTransform();
      mp.game.WorldTransform.SetPosition(transform, createVector4(x, y, z, 1));
      mp.game.WorldTransform.SetOrientationEuler(
        transform,
        createEulerAngles(roll, pitch, yaw),
      );

      const instance =
        mp.game.ScriptGameInstance.GetFxSystem().SpawnEffectOnGround(
          Object.assign(new mp.game.gameFxResource(), {
            effect:
              'user\\jackhumbert\\effects\\world_navigation_white.effect' as any,
          } satisfies gameFxResource),
          transform,
        );
      this.fxInstances.set(instance, transform);
    }

    this.updateTick = mp.setTick(this.updateFxInstances.bind(this));
  }

  destroy() {
    for (const instance of this.fxInstances.keys()) {
      instance.Kill();
      instance.SetBlackboardValue('alpha', 0);
    }

    mp.clearTick(this.updateTick);
  }
}

@injectable()
export class RaceLaps extends BaseGameMode<GameModeName.RACE_LAPS> {
  private trackPath!: RaceLapsTrackPath;
  private map!: RaceLapsMap;
  private vehicleId!: number;
  private startPoint!: RaceLapsStartPoint;

  private initialPosition!: Vector4;

  private navigation = new RaceNavigation();

  constructor(
    @inject(CefService) private cefService: CefService,
    @inject(GVehiclesService) private vehiclesService: GVehiclesService,
    @inject(GTeleportService) private teleportService: GTeleportService,
    @inject(GHealthService) private healthService: GHealthService,
    @inject(GStatusEffectsService) private statusEffects: GStatusEffectsService,
  ) {
    super();
  }

  start(): void {
    this.healthService.set(this.healthService.getDefaultHealth());

    this.cefService.setLoadingRedirect('/hud/race-laps');

    this.initialPosition = mp.game.GetPlayer().GetWorldPosition();

    this.statusEffects.add('GameplayRestriction.VehicleCombatBlockExit');
    this.statusEffects.add('GameplayRestriction.NoDriving');
    this.statusEffects.add('GameplayRestriction.NoMovement');

    this.statusEffects.add('GameplayRestriction.NoCombat');
    this.statusEffects.add('GameplayRestriction.NoWeapons');
  }

  end(): void {
    this.navigation.destroy();

    this.cefService.setLoadingRedirect(null);

    this.teleportService.teleport(this.initialPosition);

    this.statusEffects.remove('GameplayRestriction.VehicleCombatBlockExit');
    this.statusEffects.remove('GameplayRestriction.NoDriving');
    this.statusEffects.remove('GameplayRestriction.NoMovement');

    this.statusEffects.remove('GameplayRestriction.NoCombat');
    this.statusEffects.remove('GameplayRestriction.NoWeapons');

    browser.navigate.trigger('/hud');
  }

  async prepare(data: RaceLapsPrepareDTO) {
    await this.teleportService.teleportAsync(
      ...data.startPoint.position,
      data.startPoint.yaw,
    );

    browser.navigate.trigger('/hud/race-laps');

    this.vehiclesService.requestSitInVehicle(data.vehicleId);

    this.trackPath = data.trackPath;
    this.map = data.map;
    this.vehicleId = data.vehicleId;

    this.navigation.create(this.trackPath);
  }

  release() {
    this.statusEffects.remove('GameplayRestriction.NoDriving');

    if (this.options.combat) {
      this.statusEffects.remove('GameplayRestriction.NoCombat');
      this.statusEffects.remove('GameplayRestriction.NoWeapons');
    }
  }

  startCountdown(startTimestamp: number) {
    const checkInterval = setInterval(() => {
      const currentTime = Date.now();
      const remaining = Math.ceil((startTimestamp - currentTime) / 1000);

      if (remaining <= 0) {
        browser.gameModes.raceLaps.setCountdownText.trigger('GO!');

        this.release();
        clearInterval(checkInterval);
      } else {
        browser.gameModes.raceLaps.setCountdownText.trigger(String(remaining));
      }
    }, 100);
  }

  reset() {
    this.end();
  }
}
