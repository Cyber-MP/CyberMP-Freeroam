import { RpcApplyType } from '@cybermp/rpc-server';
import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import { r } from '../../rpc';
import { TimeService, zServerTime } from './time.service';

export const timeContract = {
  getCurrentTime: r.contract
    .method(RpcApplyType.REGISTER)
    .output(zServerTime)
    .build(),
};

@eager()
@injectable()
export class TimeController {
  constructor(@inject(TimeService) private timeService: TimeService) {}

  private getCurrentTime() {
    return this.timeService.getTime();
  }

  @postConstruct()
  private init() {
    r.implement<typeof timeContract>(timeContract, {
      getCurrentTime: this.getCurrentTime.bind(this),
    });
  }
}
