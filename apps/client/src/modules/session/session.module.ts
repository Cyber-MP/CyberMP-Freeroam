import { ContainerModule } from 'inversify';
import { TYPES } from '../../container';
import { EntryService } from './entry.service';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';

export const SessionModule = new ContainerModule(({ bind }) => {
  bind(SessionService).toSelf().inSingletonScope();
  bind(EntryService).toSelf().inSingletonScope();
  bind(SessionController).toSelf().inSingletonScope();

  bind(TYPES.SESSION_ID).toDynamicValue((c) => {
    const service = c.get(SessionService);

    return service.SESSION_ID;
  });
});
