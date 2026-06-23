import { ContainerModule } from 'inversify';
import { AbilityController } from './ability.controller';
import {
  type PlayerAbilityFactory,
  PlayerAbilityFactorySymbol,
  playerAbilityFactory,
} from './ability.factory';
import { AbilityService } from './ability.service';
import {
  type AbilityMiddleware,
  AbilityMiddlewareSymbol,
  abilityMiddlewareFactory,
  type CheckForAbilityMiddleware,
  CheckForAbilityMiddlewareSymbol,
  checkForAbilityMiddlewareFactory,
} from './middlewares/ability.middleware';

export const AbilityModule = new ContainerModule(({ bind }) => {
  bind(AbilityService).toSelf().inSingletonScope();
  bind(AbilityController).toSelf().inSingletonScope();
  bind<PlayerAbilityFactory>(PlayerAbilityFactorySymbol).toFactory(
    playerAbilityFactory,
  );

  bind<AbilityMiddleware>(AbilityMiddlewareSymbol).toDynamicValue(
    abilityMiddlewareFactory,
  );

  bind<CheckForAbilityMiddleware>(
    CheckForAbilityMiddlewareSymbol,
  ).toDynamicValue(checkForAbilityMiddlewareFactory);
});
