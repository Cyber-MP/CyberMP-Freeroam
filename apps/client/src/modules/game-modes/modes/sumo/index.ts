import { EInputAction, EInputKey } from '@cybermp/client-types/enums';
import type { Vector4 } from '@cybermp/client-types/game';
import { inject, injectable } from 'inversify';
import { mp } from '../../../../mp';
import { browser } from '../../../../rpc/browser';
import { GHealthService } from '../../../game/health/health.service';
import { GKeyboardService } from '../../../game/keyboard.service';
import { GStatusEffectsService } from '../../../game/status-effects/status-effects.service';
import { GTeleportService } from '../../../game/teleport/teleport.service';
import { GVehiclesService } from '../../../game/vehicles/vehicles.service';
import { SpectatingService } from '../../../spectating/spectating.service';
import { BaseGameMode } from '../../game-mode';
import type { SumoPrepareDTO } from './dto';

@injectable()
export class Sumo extends BaseGameMode<'sumo'> {
  private livingIds: number[] = [];
  private isAlive = true;
  private initialPosition!: Vector4;
  private countDownInterval: ReturnType<typeof setInterval> | undefined;

  constructor(
    @inject(GVehiclesService) private vehiclesService: GVehiclesService,
    @inject(GTeleportService) private teleportService: GTeleportService,
    @inject(GHealthService) private healthService: GHealthService,
    @inject(GStatusEffectsService)
    private statusEffectsService: GStatusEffectsService,
    @inject(GKeyboardService) private keyboardService: GKeyboardService,
    @inject(SpectatingService) private spectatingService: SpectatingService,
  ) {
    super();
  }

  start() {
    this.spectatingService.unspectate();

    this.healthService.god(true);

    this.initialPosition = mp.game.GetPlayer().GetWorldPosition();

    this.statusEffectsService.add('GameplayRestriction.VehicleCombatBlockExit');
    this.statusEffectsService.add('GameplayRestriction.NoDriving');
    this.statusEffectsService.add('GameplayRestriction.NoMovement');

    this.statusEffectsService.add('GameplayRestriction.NoCombat');
    this.statusEffectsService.add('GameplayRestriction.NoWeapons');
  }

  end() {
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
    browser.navigate.trigger('/hud');
  }

  async prepare(data: SumoPrepareDTO) {
    await this.teleportService.teleportAsync(...data.startPoint);

    browser.hud.setGlobalPath.trigger('/hud/game-modes/sumo/');
    browser.navigate.trigger('/hud/game-modes/sumo/');

    this.vehiclesService.requestSitInVehicle(data.vehicleId);
  }

  updateLivingIds(data: number[]) {
    console.log('UPDATE LIVING IDS');

    this.livingIds = data;

    if (!this.livingIds.includes(mp.getPlayerServerId(1))) {
      console.log('DEAD');

      this.onDead();
    } else {
      console.log('SPECTATE?');

      const current = this.spectatingService.getSpectatedPlayerId();

      if (current && !this.livingIds.includes(current)) {
        console.log('SPECTATE');
        this.spectateNextValidTarget();
      }
    }
  }

  private onDead() {
    if (this.isAlive) {
      return;
    }

    this.isAlive = false;

    this.mountSpectateBinds;

    this.spectateNextValidTarget();
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
    if (this.livingIds[0]) {
      this.spectatingService.spectate(this.livingIds[0]);
    } else {
      this.spectatingService.unspectate();
    }
  }

  private cycleSpectateTarget(direction: number) {
    if (this.livingIds.length === 0) {
      return;
    }

    const currentIndex = this.livingIds.findIndex(
      (id) => id === this.spectatingService.getSpectatedPlayerId(),
    );

    let nextIndex = (currentIndex + direction) % this.livingIds.length;
    if (nextIndex < 0) {
      nextIndex = this.livingIds.length - 1;
    }

    this.spectatingService.spectate(this.livingIds[nextIndex]);
  }

  release() {
    this.statusEffectsService.remove('GameplayRestriction.NoDriving');
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
