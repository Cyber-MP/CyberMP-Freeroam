import type {
  gameuiInGameMenuGameController,
  MenuScenario_PauseMenu,
  SettingsMainGameController,
} from '@cybermp/client-types/game';
import { eager } from '@freeroam/inversify';
import { injectable, postConstruct } from 'inversify';
import { mp } from '../../mp';

@eager()
@injectable()
export class GMenusService {
  MenuScenario_PauseMenu: MenuScenario_PauseMenu | null = null;

  gameuiInGameMenuGameController: gameuiInGameMenuGameController | null = null;

  private SettingsMainGameController: SettingsMainGameController | null = null;

  @postConstruct()
  private init() {
    mp.game.onGameLoaded(() => {
      mp.game.observe('SettingsMainGameController', 'OnMenuChanged', (self) => {
        this.SettingsMainGameController = self;
      });

      mp.game.observe(
        'gameuiInGameMenuGameController',
        'RegisterGlobalBlackboards',
        (self) => {
          this.gameuiInGameMenuGameController = self;
        },
      );

      mp.game.observe('SettingsMainGameController', 'RequestClose', () => {
        this.SettingsMainGameController = null;
      });

      mp.game.observe(
        'MenuScenario_PauseMenu',
        'OnSwitchToSettings',
        (self) => {
          this.MenuScenario_PauseMenu = self;
        },
      );

      mp.game.observe('MenuScenario_PauseMenu', 'OnEnterScenario', (self) => {
        this.MenuScenario_PauseMenu = self;
      });
    });
  }

  closeAllMenus() {
    const player = mp.game.GetPlayer();

    player.QueueEvent(new mp.game.ForceCloseHubMenuEvent());

    this.MenuScenario_PauseMenu?.OnClosePauseMenu();
    this.SettingsMainGameController?.RequestClose();
  }
}
