import {
  gamedataProficiencyType,
  telemetryLevelGainReason,
} from '@cybermp/client-types/enums';
import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import { mp } from '../../mp';
import { server } from '../../rpc';
import { browser } from '../../rpc/browser';
import { GStatusEffectsService } from '../game/status-effects/status-effects.service';
import { ChatCommandFlag, ChatService } from './chat.service';

@eager()
@injectable()
export class BasicChatCommands {
  constructor(
    @inject(ChatService) private chatService: ChatService,
    @inject(GStatusEffectsService) private statusEffects: GStatusEffectsService,
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

  private levelUp() {
    try {
      console.log('LEVELUP: Getting player object...');
      const player = mp.game.GetPlayerObject();
      console.log('LEVELUP: Player object:', player);

      if (!player) {
        console.log('LEVELUP ERROR: Player is null');
        return;
      }

      console.log('LEVELUP: Creating AddExperience request...');
      const addExpRequest = new mp.game.AddExperience();

      addExpRequest.Set(player, 120000, gamedataProficiencyType.Level, false);

      console.log('LEVELUP: Queueing request via ScriptGameInstance...');
      const queued = mp.game.ScriptGameInstance.QueueScriptableSystemRequest(
        'PlayerDevelopmentSystem',
        addExpRequest,
      );

      console.log('LEVELUP: Queued result:', queued);

      if (queued) {
        console.log('LEVELUP: Success!');
      } else {
        console.log('LEVELUP ERROR: Failed to queue request');
      }
    } catch (err) {
      console.log('LEVELUP ERROR', err);
    }
  }

  private levelUpSkills() {
    try {
      console.log('SKILLS: Getting player object...');
      const player = mp.game.GetPlayerObject();

      if (!player) {
        console.log('SKILLS ERROR: Player is null');
        return;
      }

      const skills = [
        { name: 'Headhunter', type: gamedataProficiencyType.ColdBlood },
        { name: 'Netrunner', type: gamedataProficiencyType.Hacking },
        { name: 'Shinobi', type: gamedataProficiencyType.Stealth },
        { name: 'Solo', type: gamedataProficiencyType.Assault },
        { name: 'Engineer', type: gamedataProficiencyType.Engineering },
      ];

      console.log('SKILLS: Leveling up all skills...');

      for (const skill of skills) {
        console.log(`SKILLS: Leveling up ${skill.name}...`);

        const setLevelRequest = new mp.game.SetProficiencyLevel();
        setLevelRequest.Set(
          player,
          20,
          skill.type,
          telemetryLevelGainReason.Ignore,
        );

        const queued = mp.game.ScriptGameInstance.QueueScriptableSystemRequest(
          'PlayerDevelopmentSystem',
          setLevelRequest,
        );

        if (queued) {
          console.log(`SKILLS: ${skill.name} - Set to level 20!`);
        } else {
          console.log(`SKILLS: ${skill.name} - Failed to queue request`);
        }
      }

      console.log('SKILLS: All skills level up complete!');
    } catch (err) {
      console.log('SKILLS ERROR', err);
    }
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
      name: 'levelupskills',
      description: 'Levels up all skills',
      handler: this.levelUpSkills.bind(this),
    });
  }
}
