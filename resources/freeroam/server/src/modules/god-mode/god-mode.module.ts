import { ContainerModule } from 'inversify';
import { GodModeCommands } from './god-mode.commands';
import { GodModeService } from './god-mode.service';

export const GodModeModule = new ContainerModule(({ bind }) => {
  bind(GodModeService).toSelf().inSingletonScope();
  bind(GodModeCommands).toSelf().inSingletonScope();
});
