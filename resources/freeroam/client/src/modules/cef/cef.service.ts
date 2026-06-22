import {
  EInputAction,
  EInputKey,
  ELoadingScreenState,
} from '@cybermp/client-types/enums';
import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import { mp } from '../../mp';
import { browser } from '../../rpc/browser';
import { GKeyboardService } from '../game/keyboard.service';
import { GLoadingScreenService } from '../game/loading-screen.service';

@eager()
@injectable()
export class CefService {
  constructor(
    @inject(GLoadingScreenService)
    private loadingService: GLoadingScreenService,
    @inject(GKeyboardService)
    private keyboardService: GKeyboardService,
  ) {}

  private loadingHandler = async (state: ELoadingScreenState) => {
    if (state !== ELoadingScreenState.Started) {
      return;
    }

    mp.cef.setFocus(false, false);

    browser.loadingOverlay.show.trigger();

    await this.loadingService.waitForLoadingScreenToHide();

    browser.loadingOverlay.hide.trigger();
  };

  private toggleHudVisibility(action: EInputAction) {
    if (action === EInputAction.IACT_Release) {
      browser.toggleVisibility.trigger();
    }
  }

  @postConstruct()
  private init() {
    mp.game.onInit(() => {
      if (import.meta.env.DEV) {
        mp.cef.setUrl('http://localhost:5173');
      }

      browser.loadingOverlay.hide.trigger();

      this.loadingService.subscribeOnStateChange(this.loadingHandler);

      this.keyboardService.bindKey(
        EInputKey.IK_F6,
        this.toggleHudVisibility.bind(this),
      );

      this.keyboardService.subscribe((key, action) => {
        if (mp.cef.isInFocus()) {
          return;
        }

        browser.keys.incomingKeyPressed.trigger({ action, key });
      });
    });
  }
}
