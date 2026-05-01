import { ContainerModule } from 'inversify';
import { VehicleNitroCommands } from './vehicle-nitro.commands';
import {
  NitroCamera,
  type NitroCameraFactory,
  NitroCameraFactorySymbol,
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

  bind(NitroCamera).toSelf().inRequestScope();
  bind<NitroCameraFactory>(NitroCameraFactorySymbol).toFactory((c) => {
    return () => c.get(NitroCamera);
  });
});
