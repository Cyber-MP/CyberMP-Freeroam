import { ContainerModule } from 'inversify';
import { NoclipCommands } from './noclip.commands';
import { NoclipService } from './noclip.service';

export const NoclipModule = new ContainerModule(({ bind }) => {
  bind(NoclipService).toSelf().inSingletonScope();
  bind(NoclipCommands).toSelf().inSingletonScope();
});
