import { eager } from '@freeroam/inversify';
import { inject, injectable } from 'inversify';
import { createEulerAngles, createVector4 } from '../../../lib/vectors';
import { mp } from '../../../mp';
import { GLoadingScreenService } from '../loading-screen.service';
import { GMenusService } from '../menus.service';

@eager()
@injectable()
export class GTeleportService {
  constructor(
    @inject(GMenusService) private menusService: GMenusService,
    @inject(GLoadingScreenService)
    private loadingScreenService: GLoadingScreenService,
  ) {}

  teleport(x: number, y: number, z: number, yaw = 1) {
    this.menusService.closeAllMenus();

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

    await this.loadingScreenService.waitForLoadingScreenToHide();
  }
}
