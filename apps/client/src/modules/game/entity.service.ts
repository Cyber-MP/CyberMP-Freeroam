import type { entEntity, entEntityID } from '@cybermp/client-types/game';
import { inject, injectable } from 'inversify';
import { sleep } from 'radash';
import { mp } from '../../mp';
import { LoggerService } from '../logger/logger.service';

@injectable()
export class GEntityService {
  constructor(@inject(LoggerService) private logger: LoggerService) {
    this.logger.setContext('GEntityService');
  }

  async waitForEntityToSpawn(
    entityId: number | entEntityID,
    timeoutMs: number = 5000,
  ) {
    const startTime = Date.now();

    while (true) {
      const candidate = this.findById(entityId);

      if (candidate) {
        return candidate;
      }

      if (Date.now() - startTime > timeoutMs) {
        this.logger.fail(`Timed out waiting for ID to spawn: ${entityId}`);
        return;
      }

      await sleep(100);
    }
  }

  findById<T extends entEntity = entEntity>(entityId: number | entEntityID): T {
    let entityIdObj: entEntityID;

    if (typeof entityId === 'number') {
      entityIdObj = Object.assign(new mp.game.entEntityID(), {
        hash: entityId,
      });
    } else {
      entityIdObj = entityId;
    }

    const candidate = mp.game.ScriptGameInstance.FindEntityByID(entityIdObj);

    return candidate as T;
  }
}
