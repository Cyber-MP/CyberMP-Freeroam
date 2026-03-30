import { ContainerModule } from 'inversify';
import { ItemSpawnerController } from './item-spawner.controller';
import { ItemSpawnerService } from './item-spawner.service';

export const LoggerModule = new ContainerModule(({ bind }) => {
  bind(ItemSpawnerService).toSelf().inSingletonScope();
  bind(ItemSpawnerController).toSelf().inSingletonScope();
});
