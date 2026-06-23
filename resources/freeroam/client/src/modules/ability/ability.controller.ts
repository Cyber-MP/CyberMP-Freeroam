import { type InferRouterContext, type } from '@cybermp/rpc-router/server';
import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import { r } from '../../rpc';
import { AbilityService, type ServerAbilityRules } from './ability.service';

export const abilityContract = {
  sync: r.contract.input(type<ServerAbilityRules>()).build(),
};

@eager()
@injectable()
export class AbilityController {
  constructor(@inject(AbilityService) private abilityService: AbilityService) {}

  private sync(context: InferRouterContext<typeof abilityContract.sync>) {
    this.abilityService.sync(context.data);
  }

  @postConstruct()
  private init() {
    r.implement(abilityContract, {
      sync: this.sync.bind(this),
    });
  }
}
