import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import z from 'zod';
import { ChatService } from '../chat/chat.service';
import { TimeService } from './time.service';

@eager()
@injectable()
export class TimeCommands {
  constructor(
    @inject(ChatService) private chat: ChatService,
    @inject(TimeService) private time: TimeService,
  ) {}

  private setClientTime(hours: number, minutes = 1) {
    this.time.setClientTime({ hours, minutes });
  }

  private resetTime() {
    this.time.resetToServer();
  }

  @postConstruct()
  private init() {
    this.chat.addCommand({
      name: 'time',
      args: z.tuple([
        z.coerce.number().meta({ title: 'hours' }).min(0).max(24),
        z.coerce
          .number()
          .meta({ title: 'minutes', optional: true })
          .min(0)
          .max(60)
          .optional(),
      ]),
      handler: this.setClientTime.bind(this),
      description: 'Sets local client time',
    });

    this.chat.addCommand({
      name: 'reset-time',
      handler: this.resetTime.bind(this),
      description: 'Reset your local time to the server one',
    });
  }
}
