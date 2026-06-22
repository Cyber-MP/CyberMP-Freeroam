import { procedure } from '@cybermp/rpc-router/server';
import { proxy } from 'valtio';

export const loadingOverlayState = proxy<{ visible: boolean }>({
  visible: import.meta.env.PROD,
});

export const loadingOverlayContract = {
  show: procedure.handler(() => {
    loadingOverlayState.visible = true;
  }),
  hide: procedure.handler(() => {
    loadingOverlayState.visible = false;
  }),
};
