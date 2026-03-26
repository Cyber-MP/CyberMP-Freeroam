import { ELoadingScreenState } from '@cybermp/client-types/enums';
import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import { mp } from '../../mp';
import { type BrowserInputs, browser } from '../../rpc/browser';
import { GKeyboardService } from '../game/keyboard.service';
import { GLoadingScreenService } from '../game/loading-screen.service';

// TODO: when open any ingame menu hide cef

@eager()
@injectable()
export class CefService {
  loadingRedirect: BrowserInputs['navigate'] = '/hud';

  constructor(
    @inject(GLoadingScreenService)
    private loadingService: GLoadingScreenService,
    @inject(GKeyboardService)
    private keyboard: GKeyboardService,
  ) {}

  setLoadingRedirect(value: BrowserInputs['navigate'] | null) {
    this.loadingRedirect = value ?? '/hud';
  }

  private loadingHandler = async (state: ELoadingScreenState) => {
    if (state !== ELoadingScreenState.Started) {
      return;
    }

    mp.cef.setFocus(false, false);

    browser.navigate.trigger('/loading');

    await this.loadingService.waitForLoadingScreenToHide();

    browser.navigate.trigger(this.loadingRedirect ?? '/hud');
  };

  @postConstruct()
  private init() {
    mp.game.onInit(() => {
      if (import.meta.env.DEV) {
        mp.cef.setUrl('http://localhost:5173');
      } else {
        mp.cef.setUrl('./browser/index.html');
      }

      this.loadingService.subscribeOnStateChange(this.loadingHandler);

      this.keyboard.subscribe((key, action) => {
        if (mp.cef.isInFocus()) {
          return;
        }

        browser.keys.incomingKeyPressed.trigger({ action, key });
      });
    });
  }
}
