import { ContainerModule } from 'inversify';
import { Mapping } from './mapping';
import { MappingService } from './mapping.service';
import { type MappingFactory, MappingFactorySymbol } from './mapping-factory';

export const MappingModule = new ContainerModule(({ bind }) => {
  bind(MappingService).toSelf().inSingletonScope();

  bind(Mapping).toSelf().inRequestScope();

  bind<MappingFactory>(MappingFactorySymbol).toFactory((c) => {
    return () => {
      return c.get(Mapping);
    };
  });
});
