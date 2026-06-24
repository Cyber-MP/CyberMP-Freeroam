import { type InferRouterContext, type } from '@cybermp/rpc-router/server';
import { RpcApplyType, type RpcServerContext } from '@cybermp/rpc-server';
import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import { r } from '../../rpc';
import type { Ability } from './ability.factory';
import { AbilityService } from './ability.service';

export const abilityContract = {
  getRules: r.contract
    .method(RpcApplyType.REGISTER)
    .output(type<Ability['rules']>())
    .build(),
};

@eager()
@injectable()
export class AbilityController {
  constructor(@inject(AbilityService) private abilityService: AbilityService) {}

  private getRules(
    context: InferRouterContext<
      typeof abilityContract.getRules,
      RpcServerContext
    >,
  ) {
    const ability = this.abilityService.create(context.player);

    console.log('RETURNED RULES FOR', context.packet.source.env);
    return ability.rules;
  }

  @postConstruct()
  private init() {
    r.implement(abilityContract, {
      getRules: this.getRules.bind(this),
    });
  }
}
