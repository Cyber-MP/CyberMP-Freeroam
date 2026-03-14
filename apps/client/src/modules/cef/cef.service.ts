import { ELoadingScreenState } from '@cybermp/client-types/enums';
import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import { mp } from '../../mp';
import { browser } from '../../rpc/browser';
import { GLoadingScreenService } from '../game/loading-screen.service';

@eager()
@injectable()
export class CefService {
  constructor(
    @inject(GLoadingScreenService)
    private loadingService: GLoadingScreenService,
  ) {}

  @postConstruct()
  private init() {
    if (import.meta.env.DEV) {
      mp.cef.setUrl('http://localhost:5173');
    } else {
      mp.cef.setUrl('file://browser/index.html');
    }

    this.loadingService.subscribeOnStateChange((state) => {
      if (state === ELoadingScreenState.Started) {
        // mp.cef.setFocus(false, false);

        browser.navigate.trigger('/loading');
      } else if (state === ELoadingScreenState.Hidden) {
        browser.navigate.trigger('/');
      }
    });

    mp.game.onInputKeyEvent((action, key) => {
      if (mp.cef.isInFocus()) {
        return;
      }

      browser.keys.incomingKeyPressed.trigger({ action, key });
    });
  }
}
