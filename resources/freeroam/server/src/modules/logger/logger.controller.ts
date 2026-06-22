import { eager } from '@freeroam/inversify';
import { injectable, postConstruct } from 'inversify';
import z from 'zod';
import { r } from '../../rpc';

const zLogType = z.enum([
  'silent',
  'fatal',
  'error',
  'warn',
  'log',
  'info',
  'success',
  'fail',
  'ready',
  'start',
  'box',
  'debug',
  'trace',
  'verbose',
]);

const zLogObject = z
  .object({
    type: zLogType,
    date: z.number(),
    tag: z.string(),
    args: z.array(z.any()),
    level: z.number(),
  })
  .loose();

export const loggerContract = {
  reportClientLog: r.contract.input(zLogObject).build(),
};

@eager()
@injectable()
export class LoggerController {
  private reportClientLog() {
    // TODO: add here a controller that would accept all incoming browser and chat logs and send them to grafana loki and etc
  }

  @postConstruct()
  private init() {
    r.implement<typeof loggerContract>(loggerContract, {
      reportClientLog: this.reportClientLog.bind(this),
    });
  }
}
