import { ContainerModule } from 'inversify';
import { VehicleNitroCommands } from './vehicle-nitro.commands';
import {
  NitroCapacity,
  type NitroCapacityFactory,
  NitroCapacityFactorySymbol,
  VehicleNitroService,
} from './vehicle-nitro.service';
import { VehicleNitroPresetRepository } from './vehicle-nitro-preset.repository';

export const VehicleNitroModule = new ContainerModule(({ bind }) => {
  bind(VehicleNitroService).toSelf().inSingletonScope();
  bind(VehicleNitroCommands).toSelf().inSingletonScope();
  bind(VehicleNitroPresetRepository).toSelf().inSingletonScope();
  bind(NitroCapacity).toSelf().inRequestScope();

  bind<NitroCapacityFactory>(NitroCapacityFactorySymbol).toFactory((c) => {
    return () => c.get(NitroCapacity);
  });
});
