import { gamedataProficiencyType } from '@cybermp/client-types/enums';
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
    const player = mp.game.GetPlayerObject();

    const addExpRequest = new mp.game.AddExperience();

    addExpRequest.Set(player, 120000, gamedataProficiencyType.Level, false);

    mp.game.ScriptGameInstance.QueueScriptableSystemRequest(
      'PlayerDevelopmentSystem',
      addExpRequest,
    );
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
  }
}
