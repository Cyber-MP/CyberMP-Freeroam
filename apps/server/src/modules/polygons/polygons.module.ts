import { ContainerModule } from 'inversify';
import { PolygonsService } from './polygons.service';

export const PolygonsModule = new ContainerModule(({ bind }) => {
  bind(PolygonsService).toSelf().inSingletonScope();
});
