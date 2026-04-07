import { ContainerModule } from 'inversify';
import { SpectatingService } from './spectating.service';

export const SpectatingModule = new ContainerModule(({ bind }) => {
  bind(SpectatingService).toSelf();
});
