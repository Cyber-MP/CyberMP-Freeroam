import * as CyberEnums from '@cybermp/client-types/enums';
import type { LoadingScreenSystem } from '@cybermp/client-types/game';
import { eager } from '@freeroam/inversify';
import { injectable, postConstruct } from 'inversify';
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
      (self, newState) => {
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
    return new Promise((resolve) =>
      setTimeout(() => {
        resolve(
          typeof state === 'function'
            ? state(this.system.GetLoadingScreenState())
            : this.system.GetLoadingScreenState() === state,
        );
      }, 100),
    );
  }

  subscribeOnStateChange(cb: LoadingScreenStateSubscriber) {
    this.observer.subscribe(cb);
  }

  unsubscribeOnStateChange(cb: LoadingScreenStateSubscriber) {
    this.observer.unsubscribe(cb);
  }

  async waitForLoadingScreenToHide() {
    const isLoading = await this.isState(
      (c) => c !== CyberEnums.ELoadingScreenState.Hidden,
    );
    if (!isLoading) {
      return;
    }

    return new Promise<void>((resolve) => {
      const handler: LoadingScreenStateSubscriber = (newState) => {
        if (newState !== CyberEnums.ELoadingScreenState.Hidden) {
          return;
        }

        resolve();

        this.unsubscribeOnStateChange(handler);
      };

      this.subscribeOnStateChange(handler);
    });
  }
}
