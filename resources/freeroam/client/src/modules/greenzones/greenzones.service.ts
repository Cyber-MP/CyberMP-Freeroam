import { inject, injectable } from 'inversify';
import { ChatService } from '../chat/chat.service';
import { GStatusEffectsService } from '../game/status-effects/status-effects.service';

@injectable()
export class GreenZonesService {
  constructor(
    @inject(GStatusEffectsService)
    private statusEffectsService: GStatusEffectsService,
    @inject(ChatService)
    private chatService: ChatService,
  ) {}

  enter() {
    this.statusEffectsService.add('GameplayRestriction.NoCombat');
    this.statusEffectsService.add('GameplayRestriction.NoWeapons');

    this.chatService.sendMessage('You entered green zone');
  }

  leave() {
    this.statusEffectsService.remove('GameplayRestriction.NoCombat');
    this.statusEffectsService.remove('GameplayRestriction.NoWeapons');

    this.chatService.sendMessage('You leaved green zone');
  }
}
