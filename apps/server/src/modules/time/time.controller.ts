import { RpcApplyType } from '@cybermp/rpc-server';
import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import z from 'zod';
import { r } from '../../rpc';
import { TimeService } from './time.service';

export const zServerTime = z.object({
  hours: z.number().min(0).max(24),
  minutes: z.number().min(0).max(60),
});

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
