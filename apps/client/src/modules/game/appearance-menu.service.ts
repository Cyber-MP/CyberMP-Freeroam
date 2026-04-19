import type { gameuiInGameMenuGameController } from '@cybermp/client-types/game';
import { eager } from '@freeroam/inversify';
import { injectable, postConstruct } from 'inversify';
import { mp } from '../../mp';

@eager()
@injectable()
export class GAppearanceMenuService {
  private inGameMenu!: gameuiInGameMenuGameController;
  private awaitMenu = false;

  @postConstruct()
  private init() {
    mp.game.onInit(() => {
      mp.game.observeRaw(
        'gameuiInGameMenuGameController',
        'RegisterGlobalBlackboards',
        (self) => {
          this.inGameMenu = self;
        },
      );

      mp.game.observeAfter(
        'MenuScenario_PauseMenu',
        'OnEnterScenario',
        (self) => {
          if (this.awaitMenu) {
            self.SwitchToScenario('MenuScenario_CharacterCustomizationMirror');
            this.awaitMenu = false;
          }
        },
      );
    });
  }

  open() {
    this.inGameMenu.SpawnMenuInstanceEvent('OnOpenPauseMenu');
    this.awaitMenu = true;
  }
}
