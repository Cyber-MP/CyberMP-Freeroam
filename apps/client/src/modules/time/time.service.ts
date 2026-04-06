import type { gameTimeSystem } from '@cybermp/client-types/game';
import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import { mp } from '../../mp';
import { server } from '../../rpc';
import { LoggerService } from '../logger/logger.service';
import type { Time } from './time.controller';

@eager()
@injectable()
export class TimeService {
  private serverTime: Time | null = null;
  private clientTime: Time | null = null;

  private system!: gameTimeSystem;

  constructor(@inject(LoggerService) private logger: LoggerService) {
    this.logger.setContext('TimeService');
  }

  setClientTime(time: Partial<Time> | null) {
    this.clientTime =
      time === null
        ? null
        : {
            hours: time?.hours ?? this.clientTime?.hours ?? 0,
            minutes: time?.minutes ?? this.clientTime?.minutes ?? 0,
          };

    if (this.clientTime) {
      this.apply(this.clientTime);
    }
  }

  setServerTime(time: Time) {
    if (!time) {
      this.logger.warn('Tried to set server time without passing valid time');
      return;
    }

    this.serverTime = time;

    if (!this.clientTime) {
      this.apply(this.serverTime);
    }
  }

  resetToServer() {
    this.setClientTime(null);

    if (this.serverTime) {
      this.apply(this.serverTime);
    }
  }

  private apply(time: Time) {
    if (!time) {
      this.logger.warn('Tried to apply time without passing time');
      return;
    }

    if (!this.system) {
      this.logger.warn('Tried to apply time when time system isnt loaded');
      return;
    }

    this.system.SetGameTimeByHMS(time.hours, time.minutes, 0);
  }

  private async fetchServerTime() {
    try {
      this.setServerTime(await server.time.getCurrentTime.call());
    } catch (e) {
      this.logger.error('Failed to fetch server time with error', e);
    }
  }

  getClientTime(): Time | null {
    return this.clientTime;
  }

  @postConstruct()
  private async init() {
    mp.game.onGameLoaded(() => {
      this.system = mp.game.ScriptGameInstance.GetTimeSystem();

      this.fetchServerTime();
    });
  }
}
