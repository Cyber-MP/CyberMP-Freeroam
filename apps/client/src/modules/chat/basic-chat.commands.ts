import {
  gamedataDevelopmentPointType,
  gamedataNewPerkType,
  gamedataStatType,
} from '@cybermp/client-types/enums';
import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import { sleep } from 'radash';
import { mp } from '../../mp';
import { server } from '../../rpc';
import { browser } from '../../rpc/browser';
import { GMenusService } from '../game/menus.service';
import { GStatusEffectsService } from '../game/status-effects/status-effects.service';
import { ChatCommandFlag, ChatService } from './chat.service';

@eager()
@injectable()
export class BasicChatCommands {
  constructor(
    @inject(ChatService) private chatService: ChatService,
    @inject(GStatusEffectsService) private statusEffects: GStatusEffectsService,
    @inject(GMenusService) private menusService: GMenusService,
  ) {}

  private clear() {
    browser.chat.clear.trigger();
  }

  private pos() {
    const { x, y, z } = mp.game.GetPlayer().GetWorldPosition();

    console.log(x, y, z);
    this.chatService.sendMessage(`${x} ${y} ${z}`);
  }

  private fixWeapons() {
    this.statusEffects.remove('GameplayRestriction.NoCombat');
    this.statusEffects.remove('GameplayRestriction.NoWeapons');
  }

  private spawnBasilisk() {
    server.vehiclesSpawner.spawnVehicle.trigger({
      model: 'v_militech_basilisk_militech',
      appearance: 'militech_basilisk__basic_militech_01',
      health: 25000,
    });
  }

  private async levelUp() {
    const arrData = [
      'Strength',
      'Reflexes',
      'TechnicalAbility',
      'Cool',
      'Intelligence',
    ];

    const player = mp.game.GetPlayerObject();

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

    if (globalMenuScenario) {
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
    } else {
      this.chatService.sendMessage(
        'Command not applied, try run it one more time!',
      );
    }
  }

  private hideHud() {
    browser.hud.hide.trigger();
  }

  private showHud() {
    browser.hud.show.trigger();
  }

  @postConstruct()
  private init() {
    mp.events.addCommand('basilisk1337', this.spawnBasilisk.bind(this));

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
      name: 'hudhide',
      description: 'Hides the HUD',
      handler: this.hideHud.bind(this),
    });

    this.chatService.addCommand({
      name: 'hudshow',
      description: 'Shows the HUD',
      handler: this.showHud.bind(this),
    });
  }
}
