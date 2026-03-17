import { ContainerModule } from 'inversify';
import { LoggerController } from './logger.controller';
import { LoggerMiddleware } from './logger.middleware';
import { LoggerService } from './logger.service';

export const LoggerModule = new ContainerModule(({ bind }) => {
  bind(LoggerService).toSelf().inRequestScope();
  bind(LoggerController).toSelf().inSingletonScope();
  bind(LoggerMiddleware).toSelf().inSingletonScope();
});
