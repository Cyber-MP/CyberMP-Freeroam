import * as CyberEnums from '@cybermp/client-types/enums';
import { eager } from '@freeroam/inversify';
import { injectable, postConstruct } from 'inversify';
import { Observer } from '../../lib/observer';
import { mp } from '../../mp';

type BindCallback = (action: CyberEnums.EInputAction) => void;

type KeyCallback = (
  key: CyberEnums.EInputKey,
  action: CyberEnums.EInputAction,
) => void;

@eager()
@injectable()
export class GKeyboardService {
  private binds = new Map<CyberEnums.EInputKey, Set<BindCallback>>();

  private observer = new Observer<KeyCallback>();

  private pressedKeys = new Set<CyberEnums.EInputKey>();

  @postConstruct()
  private init() {
    mp.game.onInputKeyEvent(this.onInputKeyEvent.bind(this));
  }

  private onInputKeyEvent(
    action: CyberEnums.EInputAction,
    key: CyberEnums.EInputKey,
  ) {
    this.observer.notify(key, action);

    if (action === CyberEnums.EInputAction.IACT_Press) {
      this.pressedKeys.add(key);
    } else if (action === CyberEnums.EInputAction.IACT_Release) {
      this.pressedKeys.delete(key);
    }

    const callbacks = this.binds.get(key) ?? [];

    for (const cb of callbacks) {
      cb(action);
    }
  }

  subscribe(callback: KeyCallback) {
    this.observer.subscribe(callback);
  }

  unsubscribe(callback: KeyCallback) {
    this.observer.unsubscribe(callback);
  }

  isKeyPressed(key: CyberEnums.EInputKey) {
    return this.pressedKeys.has(key);
  }

  bindKey(key: CyberEnums.EInputKey, callback: BindCallback) {
    if (this.binds.has(key)) {
      this.binds.get(key)?.add(callback);
    } else {
      this.binds.set(key, new Set([callback]));
    }
  }

  unbindKey(key: CyberEnums.EInputKey, callback: BindCallback) {
    const callbacks = this.binds.get(key);
    if (!callbacks || !callbacks.size) {
      return;
    }

    callbacks.delete(callback);
  }
}
