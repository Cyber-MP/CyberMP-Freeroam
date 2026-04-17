import {
  gamedataDevelopmentPointType,
  gamedataNewPerkType,
  gamedataProficiencyType,
  gamedataStatType,
} from '@cybermp/client-types/enums';
import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import { sleep } from 'radash';
import { mp } from '../../mp';
import { browser } from '../../rpc/browser';
import { GHudService } from '../game/hud.service';
import { GMenusService } from '../game/menus.service';
import { GStatusEffectsService } from '../game/status-effects/status-effects.service';
import { ChatCommandFlag, ChatService } from './chat.service';

@eager()
@injectable()
export class BasicChatCommands {
  private isLevelupProcess = false;

  constructor(
    @inject(ChatService) private chatService: ChatService,
    @inject(GStatusEffectsService) private statusEffects: GStatusEffectsService,
    @inject(GMenusService) private menusService: GMenusService,
    @inject(GHudService) private hudService: GHudService,
  ) {}

  private clear() {
    browser.chat.clear.trigger();
  }

  private pos() {
    const { x, y, z } = mp.game.GetPlayer().GetWorldPosition();
    const yaw = mp.game.GetPlayer().GetWorldYaw();

    console.log(x, y, z, yaw);
    this.chatService.sendMessage(`${x} ${y} ${z} ${yaw}`);
  }

  private fixWeapons() {
    this.statusEffects.remove('GameplayRestriction.NoCombat');
    this.statusEffects.remove('GameplayRestriction.NoWeapons');
  }

  private async levelUp() {
    if (this.isLevelupProcess) {
      this.chatService.sendMessage('Command is already in progress');

      return;
    }

    this.isLevelupProcess = true;

    try {
      const player = mp.game.GetPlayerObject();

      const addExpRequest = new mp.game.AddExperience();
      addExpRequest.Set(player, 50000, gamedataProficiencyType.Level, false);
      mp.game.PreventionSystem.QueueRequest(addExpRequest, 0);

      await sleep(100);

      const arrData = [
        'Strength',
        'Reflexes',
        'TechnicalAbility',
        'Cool',
        'Intelligence',
      ];

      const closeHub = new mp.game.ForceCloseHubMenuEvent();
      const startHub = new mp.game.StartHubMenuEvent();
      const userData = new mp.game.PerkUserData();

      const globalMenuScenario = this.menusService.globalMenuScenario;

      userData.statType = gamedataStatType.Reflexes;

      startHub.SetStartMenu('new_perks', 'ico_character', userData);

      mp.game.ScriptGameInstance.GetUISystem().QueueEvent(startHub);

      await sleep(50);

      for (let i = 0; i < arrData.length; i++) {
        const request1 = new mp.game.SetAttribute();
        request1.Set(player, 20, arrData[i] as any);
        mp.game.ScriptGameInstance.GetScriptableSystemsContainer()
          .Get('PlayerDevelopmentSystem')
          .QueueRequest(request1);
      }

      const devPointsRequest = new mp.game.questAddDevelopmentPointsRequest();

      devPointsRequest.Set(
        mp.game.GetPlayerObject(),
        2000,
        gamedataDevelopmentPointType.Primary,
      );

      mp.game.ScriptGameInstance.GetScriptableSystemsContainer()
        .Get('PlayerDevelopmentSystem')
        .QueueRequest(devPointsRequest);

      await sleep(100);

      if (!globalMenuScenario) {
        throw new Error();
      }

      for (let k = 0; k < 2; k++) {
        userData.statType = gamedataStatType.Cool;
        globalMenuScenario.SwitchMenu('new_perks', userData);

        await sleep(150);

        userData.statType = gamedataStatType.TechnicalAbility;
        globalMenuScenario.SwitchMenu('new_perks', userData);

        await sleep(150);

        userData.statType = gamedataStatType.Strength;
        globalMenuScenario.SwitchMenu('new_perks', userData);

        await sleep(150);

        userData.statType = gamedataStatType.Intelligence;
        globalMenuScenario.SwitchMenu('new_perks', userData);

        await sleep(150);

        userData.statType = gamedataStatType.Espionage;
        globalMenuScenario.SwitchMenu('new_perks', userData);

        await sleep(150);

        userData.statType = gamedataStatType.Reflexes;
        globalMenuScenario.SwitchMenu('new_perks', userData);

        await sleep(150);

        for (let j = 0; j < 5; j++) {
          for (let i = 0; i < gamedataNewPerkType.Count; i++) {
            const buyPerkRequest = new mp.game.BuyNewPerk();
            buyPerkRequest.Set(player, i);
            mp.game.ScriptGameInstance.GetScriptableSystemsContainer()
              .Get('PlayerDevelopmentSystem')
              .QueueRequest(buyPerkRequest);

            await sleep(2);
          }
        }

        await sleep(100);

        mp.game.ScriptGameInstance.GetUISystem().QueueEvent(closeHub);
      }

      await sleep(100);

      mp.game.ScriptGameInstance.GetUISystem().QueueEvent(startHub);

      await sleep(100);

      mp.game.ScriptGameInstance.GetUISystem().QueueEvent(closeHub);
    } catch {
      this.chatService.sendMessage(
        'Command not applied, try run it one more time!',
      );
    } finally {
      this.isLevelupProcess = false;
    }
  }

  private hideGameHud() {
    this.hudService.hide();
  }

  private showGameHud() {
    this.hudService.show();
  }

  private vehicleBoost() {
    const player = mp.game.GetPlayer();
    const vehicle = player.GetMountedVehicle();
    if (!vehicle) {
      return this.chatService.sendMessage('You are not in a vehicle.');
    }
    const forward = vehicle.GetWorldForward();

    const boostStrength = 40;

    const boost = {
      x: forward.x * boostStrength,
      y: forward.y * boostStrength,
      z: forward.z * boostStrength,
    };

    vehicle.AddLinelyVelocity(boost, { x: 0, y: 0, z: 0 });
  }

  private vehicleStop() {
    const player = mp.game.GetPlayer();
    const vehicle = player.GetMountedVehicle();
    if (!vehicle) {
      return this.chatService.sendMessage('You are not in a vehicle.');
    }

    vehicle.ChangeLinelyVelocity({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0 }, 0);
  }

  private vehicleGravity() {
    const player = mp.game.GetPlayer();
    const vehicle = player.GetMountedVehicle();
    if (!vehicle) {
      return this.chatService.sendMessage('You are not in a vehicle.');
    }

    vehicle.EnableGravity(!vehicle.HasGravity());
  }

  @postConstruct()
  private init() {
    this.chatService.addCommand({
      name: 'clear',
      description: 'Clears chat',
      handler: this.clear.bind(this),
    });

    this.chatService.addCommand({
      name: 'pos',
      description: 'Prints you current position',
      handler: this.pos.bind(this),
    });
    
    this.chatService.addCommand({
      name: 'vboost',
      description: 'Prints you current position',
      handler: this.vehicleBoost.bind(this),
    });
    this.chatService.addCommand({
      name: 'vstop',
      description: 'Stop vehicle velocity',
      handler: this.vehicleStop.bind(this),
    });

    this.chatService.addCommand({
      name: 'vgrav',
      description: 'Toggle gravity on your current vehicle',
      handler: this.vehicleGravity.bind(this),
    });

    this.chatService.addCommand({
      name: 'fixweapons',
      flags: ChatCommandFlag.DisableInGameMode,
      description: 'Tries to fix your weapons in case you cant shoot',
      handler: this.fixWeapons.bind(this),
    });

    this.chatService.addCommand({
      name: 'levelup',
      description: 'Levels up...',
      handler: this.levelUp.bind(this),
    });

    this.chatService.addCommand({
      name: 'hide-game-hud',
      description: 'Hides game HUD',
      handler: this.hideGameHud.bind(this),
    });

    this.chatService.addCommand({
      name: 'show-game-hud',
      description: 'Shows game HUD',
      handler: this.showGameHud.bind(this),
    });
  }
}
