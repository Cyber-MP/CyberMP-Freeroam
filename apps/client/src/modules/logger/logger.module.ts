import { ContainerModule } from 'inversify';
import { LoggerService } from './logger.service';

export const LoggerModule = new ContainerModule(({ bind }) => {
  bind(LoggerService).toSelf().inRequestScope();
});
