import { EInputAction, EInputKey } from '@cybermp/client-types/enums';
import type {
  entEntity,
  gameFxInstance,
  gameFxResource,
  Vector4,
} from '@cybermp/client-types/game';
import type {
  RaceCheckpointNode,
  RaceMap,
  RaceRacerDTO,
  RaceRankDTO,
  RaceStartPointNode,
  RaceTrackPath,
} from '@freeroam/shared/game-modes/race';
import { inject, injectable } from 'inversify';
import ms from 'ms';
import { createEulerAngles, createVector4 } from '../../../../lib/vectors';
import { mp } from '../../../../mp';
import { server } from '../../../../rpc';
import { browser } from '../../../../rpc/browser';
import {
  type DeathEvent,
  DeathService,
  type OnDeathCallback,
} from '../../../death/death.service';
import { GHealthService } from '../../../game/health/health.service';
import { GKeyboardService } from '../../../game/keyboard.service';
import { GLoadingScreenService } from '../../../game/loading-screen.service';
import { GStatusEffectsService } from '../../../game/status-effects/status-effects.service';
import { GTeleportService } from '../../../game/teleport/teleport.service';
import { GVehiclesService } from '../../../game/vehicles/vehicles.service';
import { SpawnService } from '../../../spawn/spawn.service';
import { SpectatingService } from '../../../spectating/spectating.service';
import { VehicleNitroService } from '../../../vehicle-nitro/vehicle-nitro.service';
import { BaseGameMode } from '../../game-mode';
import { RaceCheckpoint } from './checkpoint';
import type { RacePrepareDTO } from './dto';

class TrackPathNavigation {
  private trackData: RaceTrackPath = [];
  private activeFx = new Map<number, gameFxInstance>();

  private spawnEffect(index: number, path: RaceTrackPath[number]) {
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

  create(trackPath: RaceTrackPath) {
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
export class Race extends BaseGameMode<'race'> {
  private trackPath!: RaceTrackPath;
  private map!: RaceMap;
  private checkpoints: RaceCheckpointNode[] = [];
  private startPoint!: RaceStartPointNode;

  private readonly RESPAWN_DURATION = ms('1s');
  private readonly RESPAWN_KEY = EInputKey.IK_F;
  private respawnKeyHandler?: (action: EInputAction) => void;
  private respawning = false;

  private data: RaceRacerDTO = {
    currentCheckpointIndex: 0,
    currentLap: 1,
    finished: false,
  };
  private currentRanks: RaceRankDTO[] = [];

  private initialPosition!: Vector4;

  private countDownInterval: ReturnType<typeof setInterval> | undefined;
  private vehicleCheckInterval: ReturnType<typeof setInterval> | undefined;

  private navigation = new TrackPathNavigation();

  constructor(
    @inject(GVehiclesService) private vehiclesService: GVehiclesService,
    @inject(GTeleportService) private teleportService: GTeleportService,
    @inject(GHealthService) private healthService: GHealthService,
    @inject(GStatusEffectsService)
    private statusEffectsService: GStatusEffectsService,
    @inject(RaceCheckpoint) private checkpoint: RaceCheckpoint,
    @inject(GKeyboardService) private keyboardService: GKeyboardService,
    @inject(DeathService) private deathService: DeathService,
    @inject(SpawnService) private spawnService: SpawnService,
    @inject(GLoadingScreenService)
    private loadingScreenService: GLoadingScreenService,
    @inject(SpectatingService) private spectatingService: SpectatingService,
    @inject(VehicleNitroService)
    private vehicleNitroService: VehicleNitroService,
  ) {
    super();
  }

  start() {
    this.spectatingService.unspectate();

    this.healthService.set(this.healthService.getDefaultHealth());
    this.mountDeathHandler();

    this.initialPosition = mp.game.GetPlayer().GetWorldPosition();

    this.statusEffectsService.add('GameplayRestriction.VehicleCombatBlockExit');
    this.statusEffectsService.add('GameplayRestriction.NoDriving');
    this.statusEffectsService.add('GameplayRestriction.NoMovement');

    this.statusEffectsService.add('GameplayRestriction.NoCombat');
    this.statusEffectsService.add('GameplayRestriction.NoWeapons');

    this.vehicleNitroService.disable();
  }

  end() {
    this.unmountVehicleCheckInterval();
    this.unmountDeathHandler();
    this.unmountRespawnKey();

    setTimeout(() => {
      this.unmountSpectateBinds();
      this.spectatingService.unspectate();
    });

    if (this.countDownInterval) {
      clearInterval(this.countDownInterval);
    }

    this.navigation.destroy();
    this.checkpoint.destroy();

    setTimeout(() => {
      this.spawnService.spawn({
        position: this.initialPosition,
      });
    }, 500);

    this.statusEffectsService.remove(
      'GameplayRestriction.VehicleCombatBlockExit',
    );
    this.statusEffectsService.remove('GameplayRestriction.NoDriving');
    this.statusEffectsService.remove('GameplayRestriction.NoMovement');

    this.statusEffectsService.remove('GameplayRestriction.NoCombat');
    this.statusEffectsService.remove('GameplayRestriction.NoWeapons');
    this.statusEffectsService.remove('GameplayRestriction.VehicleFPP');

    this.vehicleNitroService.enable();

    browser.hud.setGlobalPath.trigger('/hud');
    browser.navigate.trigger('/hud/game-modes/race/results');
  }

  updateRacerData(data: Partial<RaceRacerDTO> = {}) {
    this.data = { ...this.data, ...data };
    browser.gameModes.race.updateData.trigger({
      ...this.data,
      totalCheckpoints: this.checkpoints.length,
      totalLaps: this.options.laps ?? 0,
    });
  }

  updateRanks(ranks: RaceRankDTO[]) {
    this.currentRanks = ranks;
    browser.gameModes.race.updateRanks.trigger(ranks);

    if (this.spectatingService.isSpectating) {
      const target = ranks.find(
        (r) => r.playerId === this.spectatingService.getSpectatedPlayerId(),
      );
      if (!target || target.finished) {
        this.spectateNextValidTarget();
      }
    }
  }

  async prepare(data: RacePrepareDTO) {
    this.spawnService.spawn({
      position: [...data.startPoint.position, data.startPoint.yaw ?? 0],
    });

    await this.loadingScreenService.waitForLoadingScreenToHide();

    browser.hud.setGlobalPath.trigger('/hud/game-modes/race/');
    browser.navigate.trigger('/hud/game-modes/race/');

    this.vehiclesService.requestSitInVehicle(data.vehicleId);

    this.trackPath = data.trackPath;
    this.map = data.map;
    this.checkpoints = data.map.nodes.filter(
      (node): node is RaceCheckpointNode => node.type === 'checkpoint',
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

      const nextData = await server.gameModes.race.processCheckpoint
        .call()
        .catch(() => null);
      if (!nextData) {
        return;
      }

      this.updateRacerData(nextData);

      this.checkpoint.destroy();

      if (nextData.finished) {
        this.onFinish();
      } else {
        this.createCheckpoint();
      }
    };

    this.checkpoint.spawn(currentCheckpointNode, onEnterCheckpoint);
  }

  private onFinish() {
    this.unmountRespawnKey();
    this.unmountDeathHandler();
    this.unmountVehicleCheckInterval();

    this.mountSpectateBinds();

    this.spectateNextValidTarget();
  }

  private respawn() {
    if (this.respawning || this.data.finished) {
      return;
    }

    this.respawning = true;

    browser.gameModes.race.hideRespawn.trigger();

    server.gameModes.race.respawn.call().finally(() => {
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

        browser.gameModes.race.showRespawn.trigger(this.RESPAWN_DURATION);
      } else if (action === EInputAction.IACT_Release) {
        browser.gameModes.race.hideRespawn.trigger();

        clearTimeout(respawnTimer);
      }
    };

    this.keyboardService.bindKey(this.RESPAWN_KEY, this.respawnKeyHandler);
  }

  private unmountRespawnKey() {
    browser.hints.remove.trigger('F');

    if (this.respawnKeyHandler) {
      this.keyboardService.unbindKey(this.RESPAWN_KEY, this.respawnKeyHandler);
    }
  }

  private mountVehicleCheckInterval() {
    this.vehicleCheckInterval = setInterval(() => {
      if (this.respawning) {
        return;
      }

      const mountedVehicle = mp.game.GetMountedVehicle(
        mp.game.GetPlayerObject(),
      );
      if (!mountedVehicle) {
        this.respawn();
      }
    }, 2000);
  }

  private unmountVehicleCheckInterval() {
    if (this.vehicleCheckInterval) {
      clearInterval(this.vehicleCheckInterval);
      this.vehicleCheckInterval = undefined;
    }
  }

  private spectateNextKeyHandler = (action: EInputAction) => {
    if (action === EInputAction.IACT_Press) {
      this.cycleSpectateTarget(-1);
    }
  };

  private spectatePrevKeyHandler = (action: EInputAction) => {
    if (action === EInputAction.IACT_Press) {
      this.cycleSpectateTarget(1);
    }
  };

  private mountSpectateBinds() {
    browser.hints.add.trigger({
      'A/D': 'Switch Player',
    });

    this.keyboardService.bindKey(EInputKey.IK_A, this.spectatePrevKeyHandler);
    this.keyboardService.bindKey(EInputKey.IK_D, this.spectateNextKeyHandler);
  }

  private unmountSpectateBinds() {
    browser.hints.remove.trigger('A/D');

    this.keyboardService.unbindKey(EInputKey.IK_A, this.spectatePrevKeyHandler);
    this.keyboardService.unbindKey(EInputKey.IK_D, this.spectateNextKeyHandler);
  }

  private spectateNextValidTarget() {
    const nextBest = this.currentRanks
      .filter((r) => r.playerId !== mp.getPlayerServerId(1))
      .find((r) => !r.finished);

    if (nextBest) {
      this.spectatingService.spectate(nextBest.playerId);
    } else {
      this.spectatingService.unspectate();
    }
  }

  private cycleSpectateTarget(direction: number) {
    const unfinished = this.currentRanks.filter((r) => !r.finished);
    if (unfinished.length === 0) {
      return;
    }

    const currentIndex = unfinished.findIndex(
      (r) => r.playerId === this.spectatingService.getSpectatedPlayerId(),
    );
    let nextIndex = (currentIndex + direction) % unfinished.length;
    if (nextIndex < 0) {
      nextIndex = unfinished.length - 1;
    }

    this.spectatingService.spectate(unfinished[nextIndex].playerId);
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

    if (this.options.forceFPP) {
      this.statusEffectsService.add('GameplayRestriction.VehicleFPP');
    }

    if (this.options.nitro) {
      this.vehicleNitroService.enable();
    }

    this.createCheckpoint();
  }

  startCountdown(duration: number) {
    const startTime = Date.now();

    const initialRemaining = Math.ceil((duration - Date.now()) / 1000);

    const mountedVehicle = mp.game.GetMountedVehicle(mp.game.GetPlayerObject());
    if (mountedVehicle && initialRemaining > 0) {
      mountedVehicle.ForceBrakesFor(initialRemaining);
    }

    this.countDownInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.ceil((duration - elapsed) / 1000);

      if (remaining <= 0) {
        browser.gameModes.race.setCountdownText.trigger('GO!');

        this.release();
        clearInterval(this.countDownInterval);
      } else {
        browser.gameModes.race.setCountdownText.trigger(String(remaining));
      }
    }, 100);
  }
}
