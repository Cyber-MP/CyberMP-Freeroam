import { InGameConfigVarType } from '@cybermp/client-types/enums';
import type { userSettingsUserSettings } from '@cybermp/client-types/game';
import { eager } from '@freeroam/inversify';
import { injectable, postConstruct } from 'inversify';
import { mp } from '../../mp';

// TODO: disable default hud hints

@eager()
@injectable()
export class GHudService {
  private system!: userSettingsUserSettings;

  private readonly hud_path = '/interface/hud';

  @postConstruct()
  private init() {
    mp.game.onGameLoaded(() => {
      this.system = mp.game.ScriptGameInstance.GetSettingsSystem();
    });
  }

  hide() {
    const group = this.system.GetGroup(this.hud_path);
    const vars = group.GetVars(false);

    for (const settingVar of vars) {
      if (+String(settingVar.GetType()) !== InGameConfigVarType.Bool) {
        continue;
      }

      settingVar.SetEnabled(false);
    }
  }

  show() {
    const group = this.system.GetGroup(this.hud_path);
    const vars = group.GetVars(false);

    for (const settingVar of vars) {
      if (+String(settingVar.GetType()) !== InGameConfigVarType.Bool) {
        continue;
      }

      settingVar.SetEnabled(true);
    }
  }
}
