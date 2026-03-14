import { ContainerModule } from 'inversify';
import { TYPES } from '../../container';
import { SessionService } from './session.service';

export const SessionModule = new ContainerModule(({ bind }) => {
  bind(SessionService).toSelf().inSingletonScope();

  bind(TYPES.SESSION_ID).toDynamicValue((c) => {
    const service = c.get(SessionService);

    return service.SESSION_ID;
  });
});
