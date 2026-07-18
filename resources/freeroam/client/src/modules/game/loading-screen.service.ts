import * as CyberEnums from '@cybermp/client-types/enums';
import type { LoadingScreenSystem } from '@cybermp/client-types/game';
import { eager } from '@freeroam/inversify';
import { injectable, postConstruct } from 'inversify';
import { debounce } from 'radash';
import { Observer } from '../../lib/observer';
import { mp } from '../../mp';

type LoadingScreenStateSubscriber = (
  newState: CyberEnums.ELoadingScreenState,
) => void;

@eager()
@injectable()
export class GLoadingScreenService {
  private observer = new Observer<LoadingScreenStateSubscriber>();

  private system!: LoadingScreenSystem;

  @postConstruct()
  private init() {
    mp.game.onInit(() => {
      this.system = mp.game.ScriptGameInstance.GetLoadingScreenSystem();
    });

    mp.game.observe(
      'LoadingScreenSystem',
      'OnLoadingScreenStateChange',
      (_self, newState) => {
        this.observer.notify(
          +String(newState) as CyberEnums.ELoadingScreenState,
        );
      },
    );
  }

  isState(
    state:
      | CyberEnums.ELoadingScreenState
      | ((currentState: CyberEnums.ELoadingScreenState) => boolean),
  ) {
    return typeof state === 'function'
      ? state(this.getCurrentState())
      : this.getCurrentState() === state;
  }

  getCurrentState() {
    return this.system.GetLoadingScreenState();
  }

  subscribeOnStateChange(cb: LoadingScreenStateSubscriber) {
    this.observer.subscribe(cb);
  }

  unsubscribeOnStateChange(cb: LoadingScreenStateSubscriber) {
    this.observer.unsubscribe(cb);
  }

  async waitForLoadingScreenToHide(
    settleTime = 200,
    timeout = 1000,
  ): Promise<void> {
    return new Promise((resolve) => {
      let timeoutId: ReturnType<typeof setTimeout> | null = setTimeout(() => {
        if (this.isState(CyberEnums.ELoadingScreenState.Hidden)) {
          resolve();
        }
      }, timeout);

      const debouncedHandler = debounce(
        { delay: settleTime },

        (state: CyberEnums.ELoadingScreenState) => {
          if (state !== CyberEnums.ELoadingScreenState.Hidden) {
            return;
          }

          resolve();

          this.unsubscribeOnStateChange(handler);
        },
      );

      const handler: LoadingScreenStateSubscriber = (s) => {
        if (timeoutId) {
          clearTimeout(timeoutId);

          timeoutId = null;
        }

        debouncedHandler(s);
      };

      this.subscribeOnStateChange(handler);
    });
  }
}
