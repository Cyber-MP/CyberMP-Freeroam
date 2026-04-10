import { procedure } from '@cybermp/rpc-router/server';
import { proxy } from 'valtio';

export const loadingOverlayState = proxy<{ visible: boolean }>({
  visible: false,
});

export const loadingOverlayContract = {
  show: procedure.handler(() => {
    loadingOverlayState.visible = true;
  }),
  hide: procedure.handler(() => {
    loadingOverlayState.visible = false;
  }),
};
