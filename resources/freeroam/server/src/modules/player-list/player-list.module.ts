import { ContainerModule } from 'inversify';
import { PlayerListController } from './player-list.controller';
import { PlayerListService } from './player-list.service';

export const PlayerListModule = new ContainerModule(({ bind }) => {
  bind(PlayerListController).toSelf().inSingletonScope();
  bind(PlayerListService).toSelf().inSingletonScope();
});
