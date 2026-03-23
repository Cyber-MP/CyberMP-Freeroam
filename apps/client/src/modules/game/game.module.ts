import { ContainerModule } from 'inversify';
import { GCameraService } from './camera.service';
import { GHealthCommands } from './health/health.commands';
import { GHealthController } from './health/health.controller';
import { GHealthService } from './health/health.service';
import { GHudService } from './hud.service';
import { GKeyboardService } from './keyboard.service';
import { GLoadingScreenService } from './loading-screen.service';
import { GMenusService } from './menus.service';
import { GPlayerService } from './player.service';
import { GStatusEffectsController } from './status-effects/status-effects.controller';
import { GStatusEffectsService } from './status-effects/status-effects.service';
import { GTeleportCommands } from './teleport/teleport.commands';
import { GTeleportController } from './teleport/teleport.controller';
import { GTeleportService } from './teleport/teleport.service';
import { GVehiclesCommands } from './vehicles/vehicles.commands';
import { GVehiclesController } from './vehicles/vehicles.controller';
import { GVehiclesService } from './vehicles/vehicles.service';

export const GameModule = new ContainerModule(({ bind }) => {
  bind(GLoadingScreenService).toSelf().inSingletonScope();
  bind(GMenusService).toSelf().inSingletonScope();
  bind(GKeyboardService).toSelf().inSingletonScope();
  bind(GHudService).toSelf().inSingletonScope();
  bind(GCameraService).toSelf().inSingletonScope();
  bind(GPlayerService).toSelf().inSingletonScope();

  bind(GVehiclesService).toSelf().inSingletonScope();
  bind(GVehiclesController).toSelf().inSingletonScope();
  bind(GVehiclesCommands).toSelf().inSingletonScope();

  bind(GTeleportService).toSelf().inSingletonScope();
  bind(GTeleportController).toSelf().inSingletonScope();
  bind(GTeleportCommands).toSelf().inSingletonScope();

  bind(GHealthService).toSelf().inSingletonScope();
  bind(GHealthController).toSelf().inSingletonScope();
  bind(GHealthCommands).toSelf().inSingletonScope();

  bind(GStatusEffectsService).toSelf().inSingletonScope();
  bind(GStatusEffectsController).toSelf().inSingletonScope();
});
