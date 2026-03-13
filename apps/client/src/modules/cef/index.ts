import { ELoadingScreenState } from '@cybermp/client-types/enums';
import { RpcApplyType } from '@cybermp/rpc-client';
import z from 'zod';
import { loadingScreenController } from '../../lib/game-controllers/loading-screen';
import { mp } from '../../mp';
import { r } from '../../rpc';
import { browser } from '../../rpc/browser';

export class CefModule {
  contract = {
    setFocus: r.procedure
      .input(z.union([z.boolean(), z.tuple([z.boolean(), z.boolean()])]))
      .handler((c) => {
        if (Array.isArray(c.data)) {
          mp.cef.setFocus(...c.data);
        } else {
          mp.cef.setFocus(c.data, c.data);
        }
      }),
    isInFocus: r.procedure
      .method(RpcApplyType.REGISTER)
      .output(z.boolean())
      .handler(() => mp.cef.isInFocus()),
  };

  constructor() {
    if (import.meta.env.DEV) {
      mp.cef.setUrl('http://localhost:5173');
    } else {
      mp.cef.setUrl('file://browser/index.html');
    }

    loadingScreenController.subscribeOnStateChange((state) => {
      console.log(
        'LOADING STATE CHANGE',
        state,
        state === ELoadingScreenState.Hidden,
      );

      if (state === ELoadingScreenState.Started) {
        browser.loading.toggle.trigger(true);
      } else if (state === ELoadingScreenState.Hidden) {
        browser.loading.toggle.trigger(false);
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

export const cef = new CefModule();
