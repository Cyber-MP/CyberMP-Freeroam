import { EInputAction, EInputKey } from '@cybermp/client-types/enums';
import type { Vector4 } from '@cybermp/client-types/game';
import type {
  SumoLivingDTO,
  SumoRacerDTO,
} from '@freeroam/shared/game-modes/sumo';
import { inject, injectable } from 'inversify';
import ms from 'ms';
import { mp } from '../../../../mp';
import { server } from '../../../../rpc';
import { browser } from '../../../../rpc/browser';
import { DeathService } from '../../../death/death.service';
import { GHealthService } from '../../../game/health/health.service';
import { GKeyboardService } from '../../../game/keyboard.service';
import { GStatusEffectsService } from '../../../game/status-effects/status-effects.service';
import { GTeleportService } from '../../../game/teleport/teleport.service';
import { GVehiclesService } from '../../../game/vehicles/vehicles.service';
import { SpawnService } from '../../../spawn/spawn.service';
import { SpectatingService } from '../../../spectating/spectating.service';
import { BaseGameMode } from '../../game-mode';
import type { SumoPrepareDTO } from './dto';

@injectable()
export class Sumo extends BaseGameMode<'race_laps'> {
  private readonly SURRENDER_DURATION = ms('5s');
  private readonly SURRENDER_KEY = EInputKey.IK_F;
  private surrenderKeyHandler?: (action: EInputAction) => void;
  private surrendered = false;

  private data: SumoRacerDTO = {
    survived: false,
  };
  private living: SumoLivingDTO[] = [];

  private initialPosition!: Vector4;

  private countDownInterval: ReturnType<typeof setInterval> | undefined;
  private vehicleCheckInterval: ReturnType<typeof setInterval> | undefined;

  constructor(
    @inject(GVehiclesService) private vehiclesService: GVehiclesService,
    @inject(GTeleportService) private teleportService: GTeleportService,
    @inject(GHealthService) private healthService: GHealthService,
    @inject(GStatusEffectsService)
    private statusEffectsService: GStatusEffectsService,
    @inject(GKeyboardService) private keyboardService: GKeyboardService,
    @inject(DeathService) private deathService: DeathService,
    @inject(SpawnService) private spawnService: SpawnService,
    @inject(SpectatingService) private spectatingService: SpectatingService,
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
  }

  end() {
    this.unmountVehicleCheckInterval();
    this.unmountDeathHandler();
    this.unmountSurrenderKey();
    setTimeout(() => {
      this.unmountSpectateBinds();
    });

    this.spectatingService.unspectate();

    if (this.countDownInterval) {
      clearInterval(this.countDownInterval);
    }

    setTimeout(() => {
      this.teleportService.teleport(this.initialPosition);
    });

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

  updateRacerData(data: Partial<SumoRacerDTO> = {}) {
    this.data = { ...this.data, ...data };
    browser.gameModes.sumo.updateData.trigger({
      ...this.data,
    });
  }

  async prepare(data: SumoPrepareDTO) {
    await this.teleportService.teleportAsync(...data.startPoint);

    browser.hud.setGlobalPath.trigger('/hud/game-modes/sumo/');
    browser.navigate.trigger('/hud/game-modes/sumo/');

    this.vehiclesService.requestSitInVehicle(data.vehicleId);

    this.updateRacerData(this.data);
  }

  private onSurrender() {
    this.unmountSurrenderKey();
    this.unmountDeathHandler();
    this.unmountVehicleCheckInterval();

    this.mountSpectateBinds();

    this.spectateNextValidTarget();
  }

  private surrender() {
    if (this.surrendered || this.data.survived) {
      return;
    }

    this.surrendered = true;

    browser.gameModes.sumo.hideSurrender.trigger();

    server.gameModes.sumo.surrender.trigger();
  }

  private mountSurrenderKey() {
    browser.hints.add.trigger({
      F: 'Respawn',
    });

    let respawnTimer: ReturnType<typeof setTimeout>;

    this.surrenderKeyHandler = (action) => {
      if (this.surrendered || this.data.survived) {
        return;
      }

      if (action === EInputAction.IACT_Press) {
        respawnTimer = setTimeout(() => {
          this.surrender();
        }, this.SURRENDER_DURATION);

        browser.gameModes.sumo.showSurrender.trigger(this.SURRENDER_DURATION);
      } else if (action === EInputAction.IACT_Release) {
        browser.gameModes.sumo.hideSurrender.trigger();

        clearTimeout(respawnTimer);
      }
    };

    this.keyboardService.bindKey(this.SURRENDER_KEY, this.surrenderKeyHandler);
  }

  private unmountSurrenderKey() {
    browser.hints.remove.trigger('F');

    if (this.surrenderKeyHandler) {
      this.keyboardService.unbindKey(
        this.SURRENDER_KEY,
        this.surrenderKeyHandler,
      );
    }
  }

  private mountVehicleCheckInterval() {
    this.vehicleCheckInterval = setInterval(() => {
      const mountedVehicle = mp.game.GetMountedVehicle(
        mp.game.GetPlayerObject(),
      );
      if (!mountedVehicle) {
        this.surrender();
      }
    }, 1000);
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
    const nextBest = this.living.find((r) => !r.survived);

    if (nextBest) {
      this.spectatingService.spectate(nextBest.playerId);
    } else {
      this.spectatingService.unspectate();
    }
  }

  private cycleSpectateTarget(direction: number) {
    const unfinished = this.living.filter((r) => !r.survived);
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

  private mountDeathHandler() {
    this.deathService.subscribe(this.surrender);
  }

  private unmountDeathHandler() {
    this.deathService.unsubscribe(this.surrender);
  }

  release() {
    this.mountSurrenderKey();
    this.mountVehicleCheckInterval();

    this.statusEffectsService.remove('GameplayRestriction.NoDriving');

    if (this.options.combat) {
      this.statusEffectsService.remove('GameplayRestriction.NoCombat');
      this.statusEffectsService.remove('GameplayRestriction.NoWeapons');
    }
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
        browser.gameModes.sumo.setCountdownText.trigger('GO!');

        this.release();
        clearInterval(this.countDownInterval);
      } else {
        browser.gameModes.sumo.setCountdownText.trigger(String(remaining));
      }
    }, 100);
  }

  reset() {
    this.end();
  }
}
