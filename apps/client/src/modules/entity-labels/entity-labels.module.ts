import { ContainerModule } from 'inversify';
import {
  EntityLabel,
  type EntityLabelFactory,
  EntityLabelFactorySymbol,
} from './entity-label';
import { EntityLabelsService } from './entity-labels.service';

export const EntityLabelsModule = new ContainerModule(({ bind }) => {
  bind(EntityLabel).toSelf().inRequestScope();

  bind<EntityLabelFactory>(EntityLabelFactorySymbol).toFactory((c) => {
    return () => {
      return c.get(EntityLabel);
    };
  });

  bind(EntityLabelsService).toSelf().inSingletonScope();
});
