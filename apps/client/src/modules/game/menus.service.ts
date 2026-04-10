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
      // open settings & switch between categories
      mp.game.observe('SettingsMainGameController', 'OnMenuChanged', (self) => {
        this.SettingsMainGameController = self;

        this.hideBrowser();
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

      // open game settings from pause menu
      mp.game.observe(
        'MenuScenario_PauseMenu',
        'OnSwitchToSettings',
        this.hideBrowser,
      );

      // open pause menu
      mp.game.observe(
        'MenuScenario_PauseMenu',
        'OnEnterScenario',
        this.hideBrowser,
      );

      // close pause menu
      mp.game.observe(
        'MenuScenario_PauseMenu',
        'OnLeaveScenario',
        this.showBrowser,
      );

      // leave from category in hub menu
      mp.game.observe(
        'MenuScenario_HubMenu',
        'OnCloseHubMenu',
        this.hideBrowser,
      );

      // hotkeys for hub menu
      mp.game.observe('MenuScenario_HubMenu', 'OnOpenMenu', this.hideBrowser);
    });
  }

  private hideBrowser() {
    browser.hide.trigger();
  }

  private showBrowser() {
    browser.show.trigger();
  }

  closeAllMenus() {
    const player = mp.game.GetPlayer();

    player.QueueEvent(new mp.game.ForceCloseHubMenuEvent());

    this.MenuScenario_PauseMenu?.OnClosePauseMenu();
    this.SettingsMainGameController?.RequestClose();
  }
}
