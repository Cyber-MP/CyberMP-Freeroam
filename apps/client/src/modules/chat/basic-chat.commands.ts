import {
  EPlayerGender,
  gamedataDevelopmentPointType,
  gamedataNewPerkType,
  gamedataProficiencyType,
  gamedataStatType,
} from '@cybermp/client-types/enums';
import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import { sleep } from 'radash';
import z from 'zod';
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

  private cpos() {
    const { x, y, z } = mp.game.GetPlayer().GetWorldPosition();
    const yaw = mp.game.GetPlayer().GetWorldYaw();

    console.log(x, y, z, yaw);
    this.chatService.sendMessage(`${x} ${y} ${z} ${yaw}`);
    browser.copyToClipboard.trigger(`${x} ${y} ${z} ${yaw}`);
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
      const devSystem =
        mp.game.ScriptGameInstance.GetScriptableSystemsContainer().Get(
          'PlayerDevelopmentSystem',
        );

      const uiSystem = mp.game.ScriptGameInstance.GetUISystem();

      const addExpRequest = new mp.game.AddExperience();
      addExpRequest.Set(player, 150000, gamedataProficiencyType.Level, false);

      const queued = mp.game.ScriptGameInstance.QueueScriptableSystemRequest(
        'PlayerDevelopmentSystem',
        addExpRequest,
      );

      await sleep(1);

      if (!queued) {
        throw new Error('Failed to queue request');
      }

      await sleep(10);

      const stats = [
        gamedataStatType.Strength,
        gamedataStatType.Reflexes,
        gamedataStatType.TechnicalAbility,
        gamedataStatType.Cool,
        gamedataStatType.Intelligence,
      ];

      for (const stat of stats) {
        const req = new mp.game.SetAttribute();
        req.Set(player, 20, stat);
        devSystem.QueueRequest(req);
        await sleep(2);
      }

      const devPointsRequest = new mp.game.questAddDevelopmentPointsRequest();
      devPointsRequest.Set(player, 2000, gamedataDevelopmentPointType.Primary);
      devSystem.QueueRequest(devPointsRequest);

      await sleep(10);

      const startHub = new mp.game.StartHubMenuEvent();
      const closeHub = new mp.game.ForceCloseHubMenuEvent();
      const userData = new mp.game.PerkUserData();

      startHub.SetStartMenu('new_perks', 'ico_character', userData);
      uiSystem.QueueEvent(startHub);

      await sleep(100);

      const menu = this.menusService.globalMenuScenario;
      if (!menu) throw new Error();

      const perkStats = [
        gamedataStatType.Cool,
        gamedataStatType.TechnicalAbility,
        gamedataStatType.Strength,
        gamedataStatType.Intelligence,
        gamedataStatType.Reflexes,
      ];

      // first cycle buy all skills, but UI don't update it for user, so next cycle do it
      for (let i = 0; i < 2; i++) {
        for (const stat of perkStats) {
          userData.statType = stat;
          menu.SwitchMenu('new_perks', userData);

          for (let i = 0; i < gamedataNewPerkType.Count; i++) {
            const buy = new mp.game.BuyNewPerk();
            buy.Set(player, i);
            devSystem.QueueRequest(buy);

            await sleep(1);
          }
        }
      }

      await sleep(50);
      uiSystem.QueueEvent(closeHub);

      // TODO: call CompleteTutorial from inited class, not new
      // new mp.game.TutorialMainController().CompleteTutorial();

      this.chatService.sendMessage('Command applied');
    } catch {
      this.chatService.sendMessage('Command failed, try again');
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

  private vehicleBoost(boostStrength = 40) {
    const player = mp.game.GetPlayer();
    const vehicle = player.GetMountedVehicle();
    if (!vehicle) {
      return this.chatService.sendMessage('You are not in a vehicle.');
    }
    const forward = vehicle.GetWorldForward();

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

  private changeGender() {
    const gender =
      mp.game.GetPlayer().GetGender() === 'Male'
        ? EPlayerGender.Female
        : EPlayerGender.Male;

    mp.game.ScriptGameInstance.GetCharacterCustomizationSystem().SetPlayerGender(
      gender,
      true,
    );
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
      name: 'cpos',
      description:
        'Prints your current position in the world and copies to clipboard',
      handler: this.cpos.bind(this),
    });

    this.chatService.addCommand({
      name: 'vboost',
      flags: ChatCommandFlag.DisableInGameMode,
      args: z.tuple([
        z.coerce.number().meta({ title: 'strength' }).default(40).optional(),
      ]),
      description: 'Boosts your vehicle forward',
      handler: this.vehicleBoost.bind(this),
    });
    this.chatService.addCommand({
      name: 'vstop',
      flags: ChatCommandFlag.DisableInGameMode,
      description: 'Stop vehicle velocity',
      handler: this.vehicleStop.bind(this),
    });

    this.chatService.addCommand({
      name: 'vgrav',
      flags: ChatCommandFlag.DisableInGameMode,

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

    this.chatService.addCommand({
      name: 'change-gender',
      description: 'Changes your gender',
      flags: ChatCommandFlag.DisableInGameMode,
      handler: this.changeGender.bind(this),
    });
  }
}
