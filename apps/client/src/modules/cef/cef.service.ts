import { eager } from '@freeroam/inversify';
import { injectable, postConstruct } from 'inversify';
import { mp } from '../../mp';
import { browser } from '../../rpc/browser';

@eager()
@injectable()
export class CefService {
  // constructor(
  //   @inject(LoadingScreenService)
  //   private loadingScreenServiec: LoadingScreenService,
  // ) {}

  @postConstruct()
  private init() {
    if (import.meta.env.DEV) {
      mp.cef.setUrl('http://localhost:5173');
    } else {
      mp.cef.setUrl('file://browser/index.html');
    }

    // this.loadingScreenServiec.subscribeOnStateChange((state) => {
    //   if (state === ELoadingScreenState.Started) {
    //     browser.loading.toggle.trigger(true);
    //   } else if (state === ELoadingScreenState.Hidden) {
    //     browser.loading.toggle.trigger(false);
    //   }
    // });

    mp.game.onInputKeyEvent((action, key) => {
      if (mp.cef.isInFocus()) {
        return;
      }

      browser.keys.incomingKeyPressed.trigger({ action, key });
    });
  }
}
