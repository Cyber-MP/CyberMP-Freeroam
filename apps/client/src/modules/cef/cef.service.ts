import { ELoadingScreenState } from '@cybermp/client-types/enums';
import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import { mp } from '../../mp';
import { type BrowserInputs, browser } from '../../rpc/browser';
import { GLoadingScreenService } from '../game/loading-screen.service';

@eager()
@injectable()
export class CefService {
  loadingRedirect: BrowserInputs['navigate'] = '/hud';

  constructor(
    @inject(GLoadingScreenService)
    private loadingService: GLoadingScreenService,
  ) {}

  setLoadingRedirect(value: BrowserInputs['navigate'] | null) {
    this.loadingRedirect = value ?? '/hud';
  }

  @postConstruct()
  private init() {
    if (import.meta.env.DEV) {
      mp.cef.setUrl('http://localhost:5173');
    } else {
      mp.cef.setUrl('cef://browser/index.html');
    }

    const loadingHandler = async (state: ELoadingScreenState) => {
      if (state !== ELoadingScreenState.Started) {
        return;
      }

      mp.cef.setFocus(false, false);

      browser.navigate.trigger('/loading');

      await this.loadingService.waitForLoadingScreenToHide();

      browser.navigate.trigger(this.loadingRedirect ?? '/hud');
    };

    this.loadingService.subscribeOnStateChange(loadingHandler);

    mp.game.onInputKeyEvent((action, key) => {
      if (mp.cef.isInFocus()) {
        return;
      }

      browser.keys.incomingKeyPressed.trigger({ action, key });
    });
  }
}
