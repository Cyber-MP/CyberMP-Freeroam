import { ContainerModule } from 'inversify';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

export const AdminModule = new ContainerModule(({ bind }) => {
  bind(AdminController).toSelf().inSingletonScope();
  bind(AdminService).toSelf().inSingletonScope();
});
