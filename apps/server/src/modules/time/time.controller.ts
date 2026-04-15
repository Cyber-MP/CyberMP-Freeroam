import { RpcApplyType } from '@cybermp/rpc-server';
import type { MpPlayer } from '@cybermp/server-types';
import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import z from 'zod';
import { r } from '../../rpc';
import { AdminService } from '../admin/admin.service';
import { ChatService } from '../chat/chat.service';
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
  constructor(
    @inject(TimeService) private timeService: TimeService,
    @inject(ChatService) private chatService: ChatService,
    @inject(AdminService) private adminService: AdminService,
  ) {}

  private getCurrentTime() {
    return this.timeService.getTime();
  }

  private adminTime(player: MpPlayer, hours: number, minutes: number) {
    if (!this.adminService.isAdminWithWarn(player)) {
      return;
    }

    this.timeService.setTime(hours, minutes);
  }

  @postConstruct()
  private init() {
    r.implement<typeof timeContract>(timeContract, {
      getCurrentTime: this.getCurrentTime.bind(this),
    });

    this.chatService.addCommand({
      name: 'admin-time',
      description: 'Set server time',
      args: z.tuple([
        z.coerce.number().meta({ title: 'hours' }).min(0).max(24),
        z.coerce.number().meta({ title: 'minutes' }).min(0).max(60).optional(),
      ]),
      handler: this.adminTime.bind(this),
    });
  }
}
