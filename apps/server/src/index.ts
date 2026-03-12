import { router } from './router';
import { r } from './rpc';

const bootstrap = () => {
  r.apply(router);
};

void bootstrap();
