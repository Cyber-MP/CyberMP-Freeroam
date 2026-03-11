import * as CyberEnums from '@cybermp/client-types/enums';
import { Observer } from '../lib/observer';

type LoadingScreenStateSubscriber = (
  newState: CyberEnums.ELoadingScreenState,
) => void;

export class LoadingScreenController {
  private observer = new Observer<LoadingScreenStateSubscriber>();

  private system!: LoadingScreenSystem;

  constructor() {
    mpClient.game.onInit(() => {
      this.system = mpClient.game.ScriptGameInstance.GetLoadingScreenSystem();
    });

    mpClient.game.observe(
      'LoadingScreenSystem',
      'OnLoadingScreenStateChange',
      (self, newState) => {
        this.observer.notify(newState);
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

export const loadingScreenController = new LoadingScreenController();
