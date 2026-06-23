import { ContainerModule } from 'inversify';
import { AbilityController } from './ability.controller';
import { AbilityService } from './ability.service';

export const AbilityModule = new ContainerModule(({ bind }) => {
  bind(AbilityService).toSelf().inSingletonScope();
  bind(AbilityController).toSelf().inSingletonScope();
});
