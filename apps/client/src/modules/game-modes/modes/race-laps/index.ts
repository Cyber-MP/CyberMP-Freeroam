import type { Vector4 } from '@cybermp/client-types/game';
import type { GameModeName } from '@freeroam/shared';
import { inject, injectable } from 'inversify';
import { mp } from '../../../../mp';
import { CefService } from '../../../cef/cef.service';
import { GHealthService } from '../../../game/health/health.service';
import { GTeleportService } from '../../../game/teleport/teleport.service';
import { GVehiclesService } from '../../../game/vehicles/vehicles.service';
import { BaseGameMode } from '../../game-mode';
import type { RaceLapsPrepareDTO, RaceLapsTrackPath } from './dto';

@injectable()
export class RaceLaps extends BaseGameMode<GameModeName.RACE_LAPS> {
  private trackPath!: RaceLapsTrackPath;

  private initialPosition!: Vector4;

  constructor(
    @inject(CefService) private cefService: CefService,
    @inject(GVehiclesService) private vehiclesService: GVehiclesService,
    @inject(GTeleportService) private teleportService: GTeleportService,
    @inject(GHealthService) private healthService: GHealthService,
  ) {
    super();
  }

  start(): void {}
  end(): void {}

  async prepare(data: RaceLapsPrepareDTO) {
    try {
      this.initialPosition = mp.game.GetPlayer().GetWorldPosition();

      this.healthService.set(this.healthService.getDefaultHealth());

      await this.teleportService.teleportAsync(
        ...data.startPoint.position,
        data.startPoint.yaw,
      );

      this.vehiclesService.requestSitInVehicle(data.vehicleId);
      console.log('sitted in vehicle');

      this.trackPath = data.trackPath;
    } catch (e) {
      console.log('error hanpped', e);
    }
  }

  reset() {
    this.vehiclesService.requestLeaveVehicle();

    this.teleportService.teleport(this.initialPosition);

    this.healthService.set(this.healthService.getDefaultHealth());
  }
}
