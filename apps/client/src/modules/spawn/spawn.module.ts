import { ContainerModule } from 'inversify';
import { SpawnService } from './spawn.service';

export const SpawnModule = new ContainerModule(({ bind }) => {
  bind(SpawnService).toSelf().inSingletonScope();
});
