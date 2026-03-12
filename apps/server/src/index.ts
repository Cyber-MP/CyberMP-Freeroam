import { router } from './router';
import { r } from './rpc';

const bootstrap = () => {
  r.apply(router);

  console.log('Server initialized');
};

void bootstrap();
