import type { CanParameters } from '@casl/ability';
import {
  RpcError,
  type RpcHandler,
  type RpcServerContext,
} from '@cybermp/rpc-server';
import type { Container, ResolutionContext } from 'inversify';
import {
  type Ability,
  type AbilityAction,
  type AbilitySubjects,
  type PlayerAbilityFactory,
  PlayerAbilityFactorySymbol,
} from '../ability.factory';

export type RpcAbilityContext<
  D = any,
  M extends Record<string, any> = Record<string, any>,
> = RpcServerContext<D, M> & {
  ability: Ability;
};

export type AbilityMiddleware = RpcHandler<RpcAbilityContext>;

export const AbilityMiddlewareSymbol = Symbol.for('AbilityMiddleware');

export const abilityMiddlewareFactory = (
  container: Container | ResolutionContext,
): AbilityMiddleware => {
  return (context, next) => {
    const playerAbilityFactory = container.get<PlayerAbilityFactory>(
      PlayerAbilityFactorySymbol,
    );

    context.ability = playerAbilityFactory(context.player);

    return next?.();
  };
};

export type CheckForAbilityMiddleware = (
  ...args: CanParameters<[AbilityAction, AbilitySubjects]>
) => RpcHandler<RpcAbilityContext>;

export const CheckForAbilityMiddlewareSymbol = Symbol.for(
  'CheckForAbilityMiddleware',
);

export const checkForAbilityMiddlewareFactory = (
  container: Container | ResolutionContext,
): CheckForAbilityMiddleware => {
  return (...args) =>
    (context, next) => {
      if (!context.ability) {
        const playerAbilityFactory = container.get<PlayerAbilityFactory>(
          PlayerAbilityFactorySymbol,
        );

        context.ability = playerAbilityFactory(context.player);
      }

      if (context.ability.cannot(...args)) {
        throw RpcError.forbidden();
      }

      return next?.();
    };
};
