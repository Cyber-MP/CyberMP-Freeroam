import type { RpcClientContext } from '@cybermp/rpc-client';
import { contract } from '@cybermp/rpc-router/server';
import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import z from 'zod';
import { r } from '../../rpc';
import { TimeService } from './time.service';

export const zTime = z.object({
  hours: z.number().min(0).max(24),
  minutes: z.number().min(0).max(60),
});

export type Time = z.infer<typeof zTime>;

export const timeContract = {
  setServerTime: contract.input(zTime).build(),
  setClientTime: contract.input(zTime).build(),
  resetToServer: contract.build(),
};

@eager()
@injectable()
export class TimeController {
  constructor(@inject(TimeService) private timeService: TimeService) {}

  private setServerTime(c: RpcClientContext<Time>) {
    this.timeService.setServerTime(c.data);
  }

  private setClientTime(c: RpcClientContext<Time>) {
    this.timeService.setClientTime(c.data);
  }

  private resetToServer() {
    this.timeService.resetToServer();
  }

  @postConstruct()
  private init() {
    r.implement<typeof timeContract>(timeContract, {
      setServerTime: this.setServerTime.bind(this),
      setClientTime: this.setClientTime.bind(this),
      resetToServer: this.resetToServer.bind(this),
    });
  }
}
