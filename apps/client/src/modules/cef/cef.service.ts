import { ELoadingScreenState } from '@cybermp/client-types/enums';
import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import { mp } from '../../mp';
import { browser } from '../../rpc/browser';
import { GLoadingScreenService } from '../game/loading-screen.service';
import { EntryService } from '../session/entry.service';

@eager()
@injectable()
export class CefService {
  constructor(
    @inject(GLoadingScreenService)
    private loadingService: GLoadingScreenService,
    @inject(EntryService)
    private entryService: EntryService,
  ) {}

  @postConstruct()
  private init() {
    // if (import.meta.env.DEV) {
    //   mp.cef.setUrl('http://localhost:5173');
    // } else {
    //   mp.cef.setUrl('file://browser/index.html');
    // }

    const loadingHandler = async (state: ELoadingScreenState) => {
      if (state !== ELoadingScreenState.Started) {
        return;
      }

      mp.cef.setFocus(false, false);

      browser.navigate.trigger('/loading');

      await this.loadingService.waitForLoadingScreenToHide();

      // yep, thats shitty asf but im too lazy to think about something else
      if (this.entryService.isPassed()) {
        browser.navigate.trigger('/hud');
      } else {
        browser.navigate.trigger('/entry');
        mp.cef.setFocus(true, true);
      }
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
