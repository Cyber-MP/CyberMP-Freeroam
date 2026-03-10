import type * as CyberEnums from '@cybermp/client-types/enums';

export type BindCallback = (action: CyberEnums.EInputAction) => void;

export class KeyboardController {
  private binds = new Map<CyberEnums.EInputKey, Set<BindCallback>>();

  constructor() {
    mp.game.onInputKeyEvent(this.onInputKeyEvent.bind(this));
  }

  private onInputKeyEvent(
    action: CyberEnums.EInputAction,
    key: CyberEnums.EInputKey,
  ) {
    const callbacks = this.binds.get(key) ?? [];

    for (const cb of callbacks) {
      cb(action);
    }
  }

  bindKey(key: CyberEnums.EInputKey, callback: BindCallback) {
    if (this.binds.has(key)) {
      this.binds.get(key)?.add(callback);
    } else {
      this.binds.set(key, new Set([callback]));
    }
  }

  unBindKey(key: CyberEnums.EInputKey, callback: BindCallback) {
    const callbacks = this.binds.get(key);
    if (!callbacks || !callbacks.size) {
      return;
    }

    callbacks.delete(callback);
  }
}

export const keyboardController = new KeyboardController();
