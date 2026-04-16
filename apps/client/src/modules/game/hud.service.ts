import { InGameConfigVarType } from '@cybermp/client-types/enums';
import type {
  ConfigVarBool,
  userSettingsUserSettings,
} from '@cybermp/client-types/game';
import { eager } from '@freeroam/inversify';
import { injectable, postConstruct } from 'inversify';
import { mp } from '../../mp';

const DEFAULT_HUD_OPTIONS = {
  npc_healthbar: false, // Boss Health Bars
  ammo_counter: true, // Ammo Counter
  hud_markers: false, // Hints
  action_buttons: false, // Action Buttons
  activity_log: false, // Activity Log
  crosshairs: true, // Crosshar
  object_markers: false, // Target Marker
  quest_tracker: true, // Job Tracker
  npc_names: true, // NPC Names
  wanted_level: true, // NCPD Wanted Level
  npc_nameplates: true, // NPC Nameplates
  crouch_indicator: false, // Crouch Indicator
  minimap: true,
  healthbar: true,
  stamina_oxygen: true,
  input_hints: false,
  vehicle_hud: true,
};

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

  setDefaultHud() {
    const group = this.system.GetGroup(this.hud_path);

    for (const settingVar of group.GetVars(false)) {
      if (+String(settingVar.GetType()) !== InGameConfigVarType.Bool) {
        continue;
      }

      const varBool = settingVar as ConfigVarBool;

      varBool.SetValue(
        DEFAULT_HUD_OPTIONS[
          varBool.GetName() as keyof typeof DEFAULT_HUD_OPTIONS
        ] ?? false,
      );
    }
  }

  hide() {
    const group = this.system.GetGroup(this.hud_path);
    const vars = group.GetVars(false);

    for (const settingVar of vars) {
      if (+String(settingVar.GetType()) !== InGameConfigVarType.Bool) {
        continue;
      }

      const varBool = settingVar as ConfigVarBool;

      varBool.SetValue(false);
    }
  }

  show() {
    this.setDefaultHud();

    // const group = this.system.GetGroup(this.hud_path);
    // const vars = group.GetVars(false);

    // for (const settingVar of vars) {
    //   if (+String(settingVar.GetType()) !== InGameConfigVarType.Bool) {
    //     continue;
    //   }

    //   settingVar.SetEnabled(true);
    // }
  }
}
