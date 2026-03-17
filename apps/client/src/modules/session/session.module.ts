import { ContainerModule } from 'inversify';
import { TYPES } from '../../container';
import { EntryService } from './entry.service';
import { SessionController } from './session.controller';
import { SessionInterceptor } from './session.interceptor';

export const SessionModule = new ContainerModule(({ bind }) => {
  bind(SessionInterceptor).toSelf().inSingletonScope();
  bind(EntryService).toSelf().inSingletonScope();
  bind(SessionController).toSelf().inSingletonScope();

  bind(TYPES.SESSION_ID).toDynamicValue((c) => {
    const service = c.get(SessionInterceptor);

    return service.SESSION_ID;
  });
});
