export class MenusController {
  private MenuScenario_PauseMenu: MenuScenario_PauseMenu | null = null;

  private SettingsMainGameController: SettingsMainGameController | null = null;

  constructor() {
    mpClient.game.onGameLoaded(() => {
      mpClient.game.observe('SettingsMainGameController', 'OnMenuChanged', (self) => {
        this.SettingsMainGameController = self;
      });

      mpClient.game.observe('SettingsMainGameController', 'RequestClose', () => {
        this.SettingsMainGameController = null;
      });

      mpClient.game.observe(
        'MenuScenario_PauseMenu',
        'OnSwitchToSettings',
        (self) => {
          this.MenuScenario_PauseMenu = self;
        },
      );

      mpClient.game.observe('MenuScenario_PauseMenu', 'OnEnterScenario', (self) => {
        this.MenuScenario_PauseMenu = self;
      });
    });
  }

  closeAllMenus() {
    const player = mpClient.game.GetPlayer();

    player.QueueEvent(new mpClient.game.ForceCloseHubMenuEvent());

    this.MenuScenario_PauseMenu?.OnClosePauseMenu();
    this.SettingsMainGameController?.RequestClose();
  }
}

export const menusController = new MenusController();
