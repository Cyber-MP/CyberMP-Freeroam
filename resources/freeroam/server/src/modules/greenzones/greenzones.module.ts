import { ContainerModule } from 'inversify';
import {
  GreenZone,
  type GreenZoneFactory,
  GreenZoneFactorySymbol,
  GreenZonesService,
} from './greenzones.service';
import { SpawnGreenZonesService } from './spawn-greezones.module';

export const GreenZonesModule = new ContainerModule(({ bind }) => {
  bind(GreenZonesService).toSelf().inSingletonScope();
  bind(SpawnGreenZonesService).toSelf().inSingletonScope();
  bind(GreenZone).toSelf().inRequestScope();

  bind<GreenZoneFactory>(GreenZoneFactorySymbol).toFactory(
    (c) => () => c.get(GreenZone),
  );
});
