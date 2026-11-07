import type { ServerVector4 } from '@cybermp/client-types';
import type { Vector4 } from '@cybermp/client-types/game';
import { eager } from '@freeroam/inversify';
import { inject, injectable } from 'inversify';
import { createEulerAngles, createVector4 } from '../../../lib/vectors';
import { mp } from '../../../mp';
import { GLoadingScreenService } from '../loading-screen.service';
import { GMenusService } from '../menus.service';
import { GVehiclesService } from '../vehicles/vehicles.service';

type TeleportArgs =
  | [x: number, y: number, z: number, yaw?: number]
  | [vec: Vector4];

@eager()
@injectable()
export class GTeleportService {
  constructor(
    @inject(GMenusService) private menusService: GMenusService,
    @inject(GLoadingScreenService)
    private loadingScreenService: GLoadingScreenService,
    @inject(GVehiclesService)
    private vehiclesService: GVehiclesService,
  ) {}

  private parseTeleportArgs(args: TeleportArgs): Vector4 {
    if (typeof args[0] === 'object') {
      return args[0] as Vector4;
    }

    return createVector4(...(args as ServerVector4));
  }

  teleport(vec: Vector4): void;
  teleport(x: number, y: number, z: number, yaw?: number): void;
  teleport(...args: TeleportArgs) {
    const position = this.parseTeleportArgs(args);

    this.menusService.closeAllMenus();
    this.vehiclesService.requestLeaveVehicle();

    this.move(position, position.w);
  }

  move(position: Vector4, yaw: number) {
    mp.game.ScriptGameInstance.GetTeleportationFacility().Teleport(
      mp.game.GetPlayerObject(),
      position,
      createEulerAngles(0, 0, yaw),
    );
  }

  teleportAsync(vec: Vector4): Promise<void>;
  teleportAsync(x: number, y: number, z: number, yaw?: number): Promise<void>;
  async teleportAsync(...args: TeleportArgs) {
    const pos = this.parseTeleportArgs(args);

    this.teleport(pos);

    await this.loadingScreenService.waitForLoadingScreenToHide();
  }
}
