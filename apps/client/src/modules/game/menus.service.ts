import type {
  gameuiInGameMenuGameController,
  MenuScenario_HubMenu,
  MenuScenario_PauseMenu,
  SettingsMainGameController,
} from '@cybermp/client-types/game';
import { eager } from '@freeroam/inversify';
import { injectable, postConstruct } from 'inversify';
import { mp } from '../../mp';
import { browser } from '../../rpc/browser';

@eager()
@injectable()
export class GMenusService {
  MenuScenario_PauseMenu: MenuScenario_PauseMenu | null = null;

  gameuiInGameMenuGameController: gameuiInGameMenuGameController | null = null;

  private SettingsMainGameController: SettingsMainGameController | null = null;

  public globalMenuScenario: MenuScenario_HubMenu | null = null;

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

      mp.game.observe('MenuScenario_HubMenu', 'OnEnterScenario', (self) => {
        this.globalMenuScenario = self;
      });

      mp.game.observe('MenuScenario_HubMenu', 'ToggleMenu', () => {
        this.hideBrowserHud();
      });

      mp.game.observe('MenuScenario_HubMenu', 'GotoIdleState', () => {
        this.showBrowserHud();
      });
    });
  }

  private hideBrowserHud() {
    browser.hide.trigger();
  }

  private showBrowserHud() {
    browser.show.trigger();
  }

  closeAllMenus() {
    const player = mp.game.GetPlayer();

    player.QueueEvent(new mp.game.ForceCloseHubMenuEvent());

    this.MenuScenario_PauseMenu?.OnClosePauseMenu();
    this.SettingsMainGameController?.RequestClose();
  }
}
