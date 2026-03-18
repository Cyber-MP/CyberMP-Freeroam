import {
  type ConsolaInstance,
  createConsola,
  type InputLogObject,
  type LogObject,
} from 'consola/browser';
import { injectable } from 'inversify';
import { server } from '../../rpc';

class Reporter {
  prettyLog(logObj: LogObject) {
    const type = logObj.type === 'log' ? '' : logObj.type;

    const tag = logObj.tag || '';

    const badge = [tag, type.toUpperCase()].filter(Boolean).join(':');

    if (typeof logObj.args[0] === 'string') {
      console.log(`[${badge}] ${logObj.args[0]}`, ...logObj.args.slice(1));
    } else {
      console.log(badge, ...logObj.args);
    }
  }

  jsonLog(logObj: LogObject) {
    server.logger.reportClientLog.trigger({ ...logObj, date: +logObj.date });
  }

  log(logObj: LogObject) {
    if (import.meta.env.DEV) {
      this.prettyLog(logObj);
    } else {
      this.jsonLog(logObj);
    }
  }
}

@injectable()
export class LoggerService {
  private instance: ConsolaInstance;

  constructor() {
    this.instance = createConsola({
      reporters: [new Reporter()],
    });
  }

  setContext(context: string) {
    this.instance = createConsola({
      reporters: [new Reporter()],
      defaults: {
        tag: context,
      },
    });
  }

  withContext(context: string) {
    return this.instance.withTag(context);
  }

  log(message: InputLogObject | any, ...args: any[]) {
    this.instance.log(message, ...args);
  }

  warn(message: InputLogObject | any, ...args: any[]) {
    this.instance.warn(message, ...args);
  }

  silent(message: InputLogObject | any, ...args: any[]) {
    this.instance.silent(message, ...args);
  }

  box(message: InputLogObject | any, ...args: any[]) {
    this.instance.box(message, ...args);
  }

  debug(message: InputLogObject | any, ...args: any[]) {
    this.instance.debug(message, ...args);
  }

  error(message: InputLogObject | any, ...args: any[]) {
    this.instance.error(message, ...args);
  }

  fail(message: InputLogObject | any, ...args: any[]) {
    this.instance.fail(message, ...args);
  }

  ready(message: InputLogObject | any, ...args: any[]) {
    this.instance.ready(message, ...args);
  }

  success(message: InputLogObject | any, ...args: any[]) {
    this.instance.success(message, ...args);
  }

  info(message: InputLogObject | any, ...args: any[]) {
    this.instance.info(message, ...args);
  }
}
