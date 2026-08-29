import { ContainerModule } from 'inversify';
import { GreenZonesController } from './greenzones.controller';
import { GreenZonesService } from './greenzones.service';

export const GreenZonesModule = new ContainerModule(({ bind }) => {
  bind(GreenZonesService).toSelf().inSingletonScope();
  bind(GreenZonesController).toSelf().inSingletonScope();
});
