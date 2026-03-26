import type {
  gameFxInstance,
  gameFxResource,
  Vector4,
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
  RaceLapsStartPointNode,
  RaceLapsTrackPath,
} from './dto';

class TrackPathNavigation {
  private trackData: RaceLapsTrackPath = [];
  private activeFx = new Map<number, gameFxInstance>();
  private updateTick!: number;

  private updateFxInstances() {
    const playerPos = mp.game.GetPlayer().GetWorldPosition();
    const SPAWN_DISTANCE = 100;

    this.trackData.forEach((path, index) => {
      const [x, y, z] = path.position;
      const effectPos = createVector4(x, y, z, 1);
      const distance = mp.game.Vector4.Distance(effectPos, playerPos);
      const isSpawned = this.activeFx.has(index);

      if (distance <= SPAWN_DISTANCE) {
        if (!isSpawned) {
          this.spawnEffect(index, path);
        }
      } else if (isSpawned) {
        this.despawnEffect(index);
      }
    });
  }

  private spawnEffect(index: number, path: RaceLapsTrackPath[number]) {
    const [x, y, z] = path.position;
    const [roll, pitch, yaw] = path.rotation;

    const transform = new mp.game.WorldTransform();
    mp.game.WorldTransform.SetPosition(transform, createVector4(x, y, z, 1));
    mp.game.WorldTransform.SetOrientationEuler(
      transform,
      createEulerAngles(roll, pitch, yaw),
    );

    const instance = mp.game.ScriptGameInstance.GetFxSystem().SpawnEffect(
      Object.assign(new mp.game.gameFxResource(), {
        effect:
          'user\\jackhumbert\\effects\\world_navigation_yellow.effect' as any,
      } satisfies gameFxResource),
      transform,
    );

    this.activeFx.set(index, instance);
  }

  private despawnEffect(index: number) {
    const instance = this.activeFx.get(index);
    if (instance) {
      instance.Kill();
      this.activeFx.delete(index);
    }
  }

  create(trackPath: RaceLapsTrackPath) {
    this.trackData = trackPath;
    this.updateTick = mp.setTick(this.updateFxInstances.bind(this));
  }

  destroy() {
    for (const index of this.activeFx.keys()) {
      this.despawnEffect(index);
    }
    this.trackData = [];
    mp.clearTick(this.updateTick);
  }
}

@injectable()
export class RaceLaps extends BaseGameMode<GameModeName.RACE_LAPS> {
  private trackPath!: RaceLapsTrackPath;
  private map!: RaceLapsMap;
  private vehicleId!: number;
  private startPoint!: RaceLapsStartPointNode;

  private initialPosition!: Vector4;

  private navigation = new TrackPathNavigation();

  constructor(
    @inject(CefService) private cefService: CefService,
    @inject(GVehiclesService) private vehiclesService: GVehiclesService,
    @inject(GTeleportService) private teleportService: GTeleportService,
    @inject(GHealthService) private healthService: GHealthService,
    @inject(GStatusEffectsService) private statusEffects: GStatusEffectsService,
  ) {
    super();
  }

  start() {
    this.healthService.set(this.healthService.getDefaultHealth());

    this.cefService.setLoadingRedirect('/hud/race-laps');

    this.initialPosition = mp.game.GetPlayer().GetWorldPosition();

    this.statusEffects.add('GameplayRestriction.VehicleCombatBlockExit');
    this.statusEffects.add('GameplayRestriction.NoDriving');
    this.statusEffects.add('GameplayRestriction.NoMovement');

    this.statusEffects.add('GameplayRestriction.NoCombat');
    this.statusEffects.add('GameplayRestriction.NoWeapons');
  }

  end() {
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
