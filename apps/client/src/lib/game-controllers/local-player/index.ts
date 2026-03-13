import { mp } from '../../../mp';
import { createEulerAngles, createVector4 } from '../../vectors';
import { loadingScreenController } from '../loading-screen';
import { menusController } from '../menus';
import { HealthController } from './health';
import { StatusEffectsController } from './status-effects';

export class LocalPlayerController {
  health = new HealthController();
  statusEffects = new StatusEffectsController();

  teleport(x: number, y: number, z: number, yaw = 1) {
    menusController.closeAllMenus();

    const teleportFacility =
      mp.game.ScriptGameInstance.GetTeleportationFacility();

    const playerObj = mp.game.GetPlayerObject();

    teleportFacility.Teleport(
      playerObj,
      createVector4(x, y, z, 1),
      createEulerAngles(0, 0, yaw),
    );
  }

  async teleportAsync(x: number, y: number, z: number, yaw = 1) {
    this.teleport(x, y, z, yaw);

    await loadingScreenController.waitForLoadingScreenToHide();
  }
}

export const localPlayerController = new LocalPlayerController();
