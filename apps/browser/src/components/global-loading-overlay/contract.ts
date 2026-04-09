import { contract } from '@cybermp/rpc-router/server';

export const globalLoadingOverlay = {
  show: contract.build(),
  hide: contract.build(),
};
