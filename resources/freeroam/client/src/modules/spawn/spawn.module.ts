import { ContainerModule } from 'inversify';
import { SpawnCommands } from './spawn.commands';
import { SpawnController } from './spawn.controller';
import { SpawnService } from './spawn.service';

export const SpawnModule = new ContainerModule(({ bind }) => {
  bind(SpawnService).toSelf().inSingletonScope();
  bind(SpawnController).toSelf().inSingletonScope();
  bind(SpawnCommands).toSelf().inSingletonScope();
});
