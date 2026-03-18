import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import z from 'zod';
import { client } from '../../rpc';
import { ChatService } from '../chat/chat.service';
import { LoggerService } from '../logger/logger.service';

export const zServerTime = z.object({
  hours: z.number().min(0).max(24),
  minutes: z.number().min(0).max(60),
});

export type ServerTime = z.infer<typeof zServerTime>;

@eager()
@injectable()
export class TimeService {
  private time: ServerTime = { hours: 19, minutes: 0 };
  private frozen: boolean = false;
  private intervalId: ReturnType<typeof setInterval> | null = null;

  private readonly TICK_RATE = 5000;

  getTime() {
    return this.time;
  }

  constructor(
    @inject(LoggerService) private logger: LoggerService,
    @inject(ChatService) private chat: ChatService,
  ) {
    this.logger.setContext('TimeService');
  }

  public setTime(h: number, m: number) {
    const newTime = zServerTime.safeParse({ hours: h, minutes: m });

    if (!newTime.success) {
      this.logger.fail(
        'setTime call failed due to error in validation ',
        newTime.error,
      );
      return;
    }

    this.time = newTime.data;

    this.sync();
  }

  setFrozen(freeze: boolean) {
    this.frozen = freeze;
  }

  isFrozen() {
    return this.frozen === true;
  }

  @postConstruct()
  private init() {
    this.intervalId = setInterval(() => {
      if (!this.frozen) {
        this.tick();
      }
    }, this.TICK_RATE);
  }

  private destroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private tick() {
    this.time.minutes++;

    if (this.time.minutes >= 60) {
      this.time.minutes = 0;
      this.time.hours++;

      if (this.time.hours >= 24) {
        this.time.hours = 0;
      }
    }

    this.sync();
  }

  private sync() {
    client.time.setServerTime.trigger(-1, this.time);
  }
}
