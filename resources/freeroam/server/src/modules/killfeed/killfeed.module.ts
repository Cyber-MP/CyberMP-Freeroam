import { ContainerModule } from 'inversify';
import { KillFeedService } from './killfeed.service';

export const KillFeedModule = new ContainerModule(({ bind }) => {
  bind(KillFeedService).toSelf().inSingletonScope();
});
