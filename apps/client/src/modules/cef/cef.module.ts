import { ContainerModule } from 'inversify';
import { CefController } from './cef.controller';
import { CefService } from './cef.service';

export const CefModule = new ContainerModule(({ bind }) => {
  bind(CefService).toSelf().inSingletonScope();
  bind(CefController).toSelf().inSingletonScope();
});
