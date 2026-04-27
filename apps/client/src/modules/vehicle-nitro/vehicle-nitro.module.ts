import { ContainerModule } from 'inversify';
import { VehicleNitroCommands } from './vehicle-nitro.commands';
import { VehicleNitroService } from './vehicle-nitro.service';

export const VehicleNitroModule = new ContainerModule(({ bind }) => {
  bind(VehicleNitroService).toSelf().inSingletonScope();
  bind(VehicleNitroCommands).toSelf().inSingletonScope();
});
