import { ContainerModule } from 'inversify';
import { LoggerService } from './logger.service';

// TODO: add here a controller that would accept all incoming browser and chat logs and send them to grafana loki and etc

export const LoggerModule = new ContainerModule(({ bind }) => {
  bind(LoggerService).toSelf().inRequestScope();
});
