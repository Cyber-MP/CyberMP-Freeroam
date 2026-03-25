import { ContainerModule } from 'inversify';
import { EntityLabelsService } from './entity-labels.service';

export const EntityLabelsModule = new ContainerModule(({ bind }) => {
  bind(EntityLabelsService).toSelf().inSingletonScope();
});
