import { ContainerModule } from 'inversify';
import { VehiclesSpawnerService } from './vehicles-spawner.service';

export const MenuModule = new ContainerModule(({ bind }) => {
  bind(VehiclesSpawnerService).toSelf().inSingletonScope();
});
