import { ContainerModule } from 'inversify';
import { DeathService } from './death.service';

export const DeathModule = new ContainerModule(({ bind }) => {
  bind(DeathService).toSelf().inSingletonScope();
});
