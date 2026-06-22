import { ContainerModule } from 'inversify';
import { PlayersMarkersService } from './players-markers.service';

export const PlayersMarkersModule = new ContainerModule(({ bind }) => {
  bind(PlayersMarkersService).toSelf().inSingletonScope();
});
