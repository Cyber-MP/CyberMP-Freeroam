import { EInputAction, EInputKey } from '@cybermp/client-types/enums';
import type {
  entEntity,
  gameFxInstance,
  gameFxResource,
  Vector4,
} from '@cybermp/client-types/game';
import { inject, injectable } from 'inversify';
import ms from 'ms';
import { createEulerAngles, createVector4 } from '../../../../lib/vectors';
import { mp } from '../../../../mp';
import { server } from '../../../../rpc';
import { browser } from '../../../../rpc/browser';
import { CefService } from '../../../cef/cef.service';
import {
  type DeathEvent,
  DeathService,
  type OnDeathCallback,
} from '../../../death/death.service';
import { GHealthService } from '../../../game/health/health.service';
import { GKeyboardService } from '../../../game/keyboard.service';
import { GStatusEffectsService } from '../../../game/status-effects/status-effects.service';
import { GTeleportService } from '../../../game/teleport/teleport.service';
import { GVehiclesService } from '../../../game/vehicles/vehicles.service';
import { SpawnService } from '../../../spawn/spawn.service';
import { BaseGameMode } from '../../game-mode';
import { RaceLapsCheckpoint } from './checkpoint';
import type {
  RaceLapsCheckpointNode,
  RaceLapsMap,
  RaceLapsPrepareDTO,
  RaceLapsRacerDTO,
  RaceLapsRankDTO,
  RaceLapsStartPointNode,
  RaceLapsTrackPath,
} from './dto';

class TrackPathNavigation {
  private trackData: RaceLapsTrackPath = [];
  private activeFx = new Map<number, gameFxInstance>();

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

    this.trackData.forEach((path, index) => {
      this.spawnEffect(index, path);
    });
  }

  destroy() {
    for (const index of this.activeFx.keys()) {
      this.despawnEffect(index);
    }
    this.trackData = [];
  }
}

@injectable()
export class RaceLaps extends BaseGameMode<'race_laps'> {
  private trackPath!: RaceLapsTrackPath;
  private map!: RaceLapsMap;
  private checkpoints: RaceLapsCheckpointNode[] = [];
  private startPoint!: RaceLapsStartPointNode;

  private readonly RESPAWN_DURATION = ms('1s');
  private readonly RESPAWN_KEY = EInputKey.IK_F;
  private respawnKeyHandler?: (action: EInputAction) => void;
  private respawning = false;

  private data: RaceLapsRacerDTO = {
    currentCheckpointIndex: 0,
    currentLap: 0,
    finished: false,
  };

  private initialPosition!: Vector4;

  private countDownInterval: ReturnType<typeof setInterval> | undefined;
  private vehicleCheckInterval: ReturnType<typeof setInterval> | undefined;

  private navigation = new TrackPathNavigation();

  constructor(
    @inject(CefService) private cefService: CefService,
    @inject(GVehiclesService) private vehiclesService: GVehiclesService,
    @inject(GTeleportService) private teleportService: GTeleportService,
    @inject(GHealthService) private healthService: GHealthService,
    @inject(GStatusEffectsService)
    private statusEffectsService: GStatusEffectsService,
    @inject(RaceLapsCheckpoint) private checkpoint: RaceLapsCheckpoint,
    @inject(GKeyboardService) private keyboardService: GKeyboardService,
    @inject(DeathService) private deathService: DeathService,
    @inject(SpawnService) private spawnService: SpawnService,
  ) {
    super();
  }

  start() {
    this.healthService.set(this.healthService.getDefaultHealth());
    this.mountDeathHandler();

    this.initialPosition = mp.game.GetPlayer().GetWorldPosition();

    this.statusEffectsService.add('GameplayRestriction.VehicleCombatBlockExit');
    this.statusEffectsService.add('GameplayRestriction.NoDriving');
    this.statusEffectsService.add('GameplayRestriction.NoMovement');

    this.statusEffectsService.add('GameplayRestriction.NoCombat');
    this.statusEffectsService.add('GameplayRestriction.NoWeapons');
      }

  end() {
    this.unmountVehicleCheckInterval();
    this.unmountDeathHandler();
    this.unmountRespawnKey();

    if (this.countDownInterval) {
      clearInterval(this.countDownInterval);
    }

    this.navigation.destroy();
    this.checkpoint.destroy();

    this.teleportService.teleport(this.initialPosition);

    this.statusEffectsService.remove(
      'GameplayRestriction.VehicleCombatBlockExit',
    );
    this.statusEffectsService.remove('GameplayRestriction.NoDriving');
    this.statusEffectsService.remove('GameplayRestriction.NoMovement');

    this.statusEffectsService.remove('GameplayRestriction.NoCombat');
    this.statusEffectsService.remove('GameplayRestriction.NoWeapons');
    
    browser.hud.setGlobalPath.trigger('/hud');
    browser.navigate.trigger('/hud/game-modes/race-laps/results');
  }

  updateRacerData(data: Partial<RaceLapsRacerDTO> = {}) {
    this.data = { ...this.data, ...data };
    browser.gameModes.raceLaps.updateData.trigger({
      ...this.data,
      totalCheckpoints: this.checkpoints.length,
      totalLaps: this.options.laps ?? 0,
    });
  }

  updateRanks(ranks: RaceLapsRankDTO[]) {
    browser.gameModes.raceLaps.updateRanks.trigger(ranks);
  }

  async prepare(data: RaceLapsPrepareDTO) {
    await this.teleportService.teleportAsync(
      ...data.startPoint.position,
      data.startPoint.yaw,
    );

    browser.hud.setGlobalPath.trigger('/hud/game-modes/race-laps/');
    browser.navigate.trigger('/hud/game-modes/race-laps/');

    this.vehiclesService.requestSitInVehicle(data.vehicleId);

    this.trackPath = data.trackPath;
    this.map = data.map;
    this.checkpoints = data.map.nodes.filter(
      (node): node is RaceLapsCheckpointNode => node.type === 'checkpoint',
    );
    this.startPoint = data.startPoint;

    this.navigation.create(this.trackPath);
    this.updateRacerData(this.data);
  }

  private createCheckpoint() {
    const currentCheckpointNode =
      this.checkpoints[this.data.currentCheckpointIndex];

    const onEnterCheckpoint = async (entity: entEntity) => {
      if (entity.GetClassName() !== 'PlayerPuppet') {
        return;
      }

      const nextData = await server.gameModes.raceLaps.processCheckpoint
        .call()
        .catch(() => null);
      if (!nextData) {
        return;
      }

      this.updateRacerData(nextData);

      this.checkpoint.destroy();

      if (!nextData.finished) {
        this.createCheckpoint();
      }
    };

    this.checkpoint.spawn(currentCheckpointNode, onEnterCheckpoint);
  }

  private onFinish() {
    // TODO: add here spectating logic or smth
  }

  private respawn() {
    if (this.respawning || this.data.finished) {
      return;
    }

    this.respawning = true;

    browser.gameModes.raceLaps.hideRespawn.trigger();

    server.gameModes.raceLaps.respawn.call().finally(() => {
      this.respawning = false;
    });
  }

  private mountRespawnKey() {
    browser.hints.add.trigger({
      F: 'Respawn',
    });

    let respawnTimer: ReturnType<typeof setTimeout>;

    this.respawnKeyHandler = (action) => {
      if (this.respawning || this.data.finished) {
        return;
      }

      if (action === EInputAction.IACT_Press) {
        respawnTimer = setTimeout(() => {
          this.respawn();
        }, this.RESPAWN_DURATION);

        browser.gameModes.raceLaps.showRespawn.trigger(this.RESPAWN_DURATION);
      } else if (action === EInputAction.IACT_Release) {
        browser.gameModes.raceLaps.hideRespawn.trigger();

        clearTimeout(respawnTimer);
      }
    };

    this.keyboardService.bindKey(this.RESPAWN_KEY, this.respawnKeyHandler);
  }

  private unmountRespawnKey() {
    browser.hints.remove.trigger('F');

    if (this.respawnKeyHandler) {
      this.keyboardService.unBindKey(this.RESPAWN_KEY, this.respawnKeyHandler);
    }
  }

  private mountVehicleCheckInterval() {
    this.vehicleCheckInterval = setInterval(() => {
      const mountedVehicle = mp.game.GetMountedVehicle(
        mp.game.GetPlayerObject(),
      );
      if (!mountedVehicle) {
        this.respawn();
      }
    }, 1000);
  }

  private unmountVehicleCheckInterval() {
    if (this.vehicleCheckInterval) {
      clearInterval(this.vehicleCheckInterval);
      this.vehicleCheckInterval = undefined;
    }
  }

  private deathHandler: OnDeathCallback = (event: DeathEvent) => {
    event.preventDefault();
    this.spawnService.spawn({
      position: mp.game.GetPlayer().GetWorldPosition(),
    });

    this.respawn();
  };

  private mountDeathHandler() {
    this.deathService.subscribe(this.deathHandler);
  }

  private unmountDeathHandler() {
    this.deathService.unsubscribe(this.deathHandler);
  }

  release() {
    this.mountRespawnKey();
    this.mountVehicleCheckInterval();

    this.statusEffectsService.remove('GameplayRestriction.NoDriving');

    if (this.options.combat) {
      this.statusEffectsService.remove('GameplayRestriction.NoCombat');
      this.statusEffectsService.remove('GameplayRestriction.NoWeapons');
    }

    this.createCheckpoint();
  }

  startCountdown(startTimestamp: number) {
    console.log(
      'CURRENT DATE',
      Date.now(),
      'START TIMESTAMP',
      startTimestamp,
      'REMAINING',
      Math.ceil((startTimestamp - Date.now()) / 1000),
    );

    const initialRemaining = Math.ceil((startTimestamp - Date.now()) / 1000);

    const mountedVehicle = mp.game.GetMountedVehicle(mp.game.GetPlayerObject());
    if (mountedVehicle && initialRemaining > 0) {
      mountedVehicle.ForceBrakesFor(initialRemaining);
    }

    this.countDownInterval = setInterval(() => {
      const currentTime = Date.now();
      const remaining = Math.ceil((startTimestamp - currentTime) / 1000);

      if (remaining <= 0) {
        browser.gameModes.raceLaps.setCountdownText.trigger('GO!');

        this.release();
        clearInterval(this.countDownInterval);
      } else {
        browser.gameModes.raceLaps.setCountdownText.trigger(String(remaining));
      }
    }, 100);
  }

  reset() {
    this.end();
  }
}
