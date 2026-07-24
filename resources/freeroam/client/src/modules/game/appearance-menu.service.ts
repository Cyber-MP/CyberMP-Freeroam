import type { gameuiInGameMenuGameController } from '@cybermp/client-types/game';
import { eager } from '@freeroam/inversify';
import { injectable, postConstruct } from 'inversify';
import { mp } from '../../mp';

@eager()
@injectable()
export class GAppearanceMenuService {
  private inGameMenu!: gameuiInGameMenuGameController;
  private pendingRequests: Array<() => void> = [];

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
          const resolve = this.pendingRequests.shift();
          if (resolve) {
            self.SwitchToScenario('MenuScenario_CharacterCustomizationMirror');
            resolve();
          }
        },
      );
    });
  }

  open(): Promise<void> {
    const signal = AbortSignal.timeout(1_000);

    return new Promise<void>((resolve, reject) => {
      signal.addEventListener('abort', () => {
        this.pendingRequests.splice(this.pendingRequests.indexOf(resolve), 1);
        reject();
      });

      this.pendingRequests.push(resolve);
      this.inGameMenu.SpawnMenuInstanceEvent('OnOpenPauseMenu');
    });
  }
}
