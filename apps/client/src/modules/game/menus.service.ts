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

      // HIDE BROWSER

      // open settings & switch between categories
      mp.game.observe('SettingsMainGameController', 'OnMenuChanged', () => {
        console.log('SettingsMainGameController OnMenuChanged');

        this.hideBrowser();
      });

      // exit game settings
      mp.game.observe('SettingsMainGameController', 'RequestClose', () => {
        console.log('SettingsMainGameController RequestClose');

        this.showBrowser();
      });

      // open game settings from pause menu
      mp.game.observe('MenuScenario_PauseMenu', 'OnSwitchToSettings', () => {
        console.log('MenuScenario_PauseMenu OnSwitchToSettings');

        this.hideBrowser();
      });

      // open pause menu
      mp.game.observe('MenuScenario_PauseMenu', 'OnEnterScenario', () => {
        console.log('MenuScenario_PauseMenu OnEnterScenario');

        this.hideBrowser();
      });

      // close pause menu
      mp.game.observe('MenuScenario_PauseMenu', 'OnLeaveScenario', () => {
        console.log('MenuScenario_PauseMenu OnLeaveScenario');

        this.showBrowser();
      });

      mp.game.observe('MenuScenario_HubMenu', 'OnCloseHubMenu', () => {
        console.log('MenuScenario_HubMenu OnCloseHubMenu');

        this.showBrowser();
      });

      mp.game.observe('MenuScenario_HubMenu', 'OnRequestHubMenu', () => {
        console.log('MenuScenario_HubMenu OnRequestHubMenu');

        this.showBrowser();
      });

      mp.game.observe('MenuScenario_HubMenu', 'OnCloseHubMenuRequest', () => {
        console.log('MenuScenario_HubMenu OnCloseHubMenuRequest');

        this.showBrowser();
      });

      mp.game.observe('MenuScenario_HubMenu', 'OnHotkeySwitchToMap', () => {
        console.log('MenuScenario_HubMenu OnHotkeySwitchToMap');

        this.hideBrowser();
      });

      mp.game.observe(
        'MenuScenario_HubMenu',
        'OnHotkeySwitchToCrafting',
        () => {
          console.log('MenuScenario_HubMenu OnHotkeySwitchToCrafting');

          this.hideBrowser();
        },
      );

      mp.game.observe('MenuScenario_HubMenu', 'OnHotkeySwitchToJournal', () => {
        console.log('MenuScenario_HubMenu OnHotkeySwitchToJournal');

        this.hideBrowser();
      });

      mp.game.observe(
        'MenuScenario_HubMenu',
        'OnHotkeySwitchToInventory',
        () => {
          console.log('MenuScenario_HubMenu OnHotkeySwitchToInventory');

          this.hideBrowser();
        },
      );

      mp.game.observe('MenuScenario_HubMenu', 'OnHotkeySwitchToPerks', () => {
        console.log('MenuScenario_HubMenu OnHotkeySwitchToPerks');

        this.hideBrowser();
      });
    });
  }

  private hideBrowser() {
    console.log('HIDE BROWSER');

    browser.hide.trigger();
  }

  private showBrowser() {
    console.log('SHOW BROWSER');

    browser.show.trigger();
  }

  closeAllMenus() {
    const player = mp.game.GetPlayer();

    player.QueueEvent(new mp.game.ForceCloseHubMenuEvent());

    this.MenuScenario_PauseMenu?.OnClosePauseMenu();
    this.SettingsMainGameController?.RequestClose();
  }
}
