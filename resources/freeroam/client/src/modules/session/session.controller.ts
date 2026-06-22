import { contract } from '@cybermp/rpc-router/server';
import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import { r } from '../../rpc';
import { EntryService } from './entry.service';

export const sessionContract = {
  enter: contract.build(),
};

@eager()
@injectable()
export class SessionController {
  constructor(@inject(EntryService) private entryService: EntryService) {}

  private enter() {
    this.entryService.enter();
  }

  @postConstruct()
  private init() {
    r.implement<typeof sessionContract>(sessionContract, {
      enter: this.enter.bind(this),
    });
  }
}
