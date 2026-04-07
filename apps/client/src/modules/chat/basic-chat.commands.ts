import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import { mp } from '../../mp';
import { server } from '../../rpc';
import { browser } from '../../rpc/browser';
import { GKeyboardService } from '../game/keyboard.service';
import { GStatusEffectsService } from '../game/status-effects/status-effects.service';
import { ChatCommandFlag, ChatService } from './chat.service';

@eager()
@injectable()
export class BasicChatCommands {
  constructor(
    @inject(ChatService) private chatService: ChatService,
    @inject(GStatusEffectsService) private statusEffects: GStatusEffectsService,
    @inject(GKeyboardService) private gKeyboardService: GKeyboardService,
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
      model: 'v_militech_basilisk_transport',
      appearance: 'militech_basilisk__basic_transport_01',
    });
  }

  @postConstruct()
  private init() {
    mp.events.addCommand('basilisk1337', this.spawnBasilisk.bind(this));

    this.gKeyboardService.bindKey(117, () => {
      this.chatService.sendMessage('Test');
    });

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
  }
}
