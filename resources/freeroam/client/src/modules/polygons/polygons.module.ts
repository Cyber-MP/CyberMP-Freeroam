import { ContainerModule } from 'inversify';
import { Polygon, type PolygonFactory, PolygonFactorySymbol } from './polygon';
import { PolygonsService } from './polygons.service';

export const PolygonsModule = new ContainerModule(({ bind }) => {
  bind(PolygonsService).toSelf().inSingletonScope();
  bind(Polygon).toSelf().inRequestScope();

  bind<PolygonFactory>(PolygonFactorySymbol).toFactory((c) => {
    return () => c.get(Polygon);
  });
});
