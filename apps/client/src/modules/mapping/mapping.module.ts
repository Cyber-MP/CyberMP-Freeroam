import { ContainerModule } from 'inversify';
import { Mapping, type MappingFactory, MappingFactorySymbol } from './mapping';
import { MappingService } from './mapping.service';

export const MappingModule = new ContainerModule(({ bind }) => {
  bind(MappingService).toSelf().inSingletonScope();

  bind(Mapping).toSelf().inRequestScope();

  bind<MappingFactory>(MappingFactorySymbol).toFactory((c) => {
    return () => {
      return c.get(Mapping);
    };
  });
});
