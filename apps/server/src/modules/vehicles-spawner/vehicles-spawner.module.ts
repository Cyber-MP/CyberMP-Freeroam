import { ContainerModule } from 'inversify';
import { VehiclesRepository } from './vehicles.repository';
import { VehiclesSpawnerCommands } from './vehicles-spawner.commands';
import { VehiclesSpawnerController } from './vehicles-spawner.controller';
import { VehiclesSpawnerService } from './vehicles-spawner.service';

export const VehiclesSpawnerModule = new ContainerModule(({ bind }) => {
  bind(VehiclesSpawnerService).toSelf().inSingletonScope();
  bind(VehiclesSpawnerController).toSelf().inSingletonScope();
  bind(VehiclesSpawnerCommands).toSelf().inSingletonScope();
  bind(VehiclesRepository).toSelf().inSingletonScope();
});
