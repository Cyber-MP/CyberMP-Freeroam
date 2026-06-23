import { Ability, type CanParameters } from '@casl/ability';
import { eager } from '@freeroam/inversify';
import { injectable, postConstruct } from 'inversify';
import { type ServerOutputs, server } from '../../rpc';

export type ServerAbilityRules = ServerOutputs['ability']['getRules'];

type ServerAbilityAction = Extract<
  ServerAbilityRules[number]['action'],
  string
>;
type ServerAbilitySubject = ServerAbilityRules[number]['subject'];

export type ServerAbilityTuple = [ServerAbilityAction, ServerAbilitySubject];

@eager()
@injectable()
export class AbilityService {
  public readonly ability = new Ability<ServerAbilityTuple>();

  sync(rules: ServerAbilityRules) {
    this.ability.update(rules);

    // todo: sync to browser
  }

  can(...args: CanParameters<ServerAbilityTuple>) {
    return this.ability.can(...args);
  }

  cannot(...args: CanParameters<ServerAbilityTuple>) {
    return this.ability.cannot(...args);
  }

  @postConstruct()
  private init() {
    void server.ability.getRules.call().then((rules) => {
      this.ability.update(rules);
    });

    // this.ability.update(remoteRules);
  }
}
