import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import { mp } from '../../mp';
import { browser } from '../../rpc/browser';
import { GHealthService } from '../game/health/health.service';
import { SpawnService } from '../spawn/spawn.service';
import { ChatService } from './chat.service';

@eager()
@injectable()
export class BasicChatCommands {
  constructor(
    @inject(ChatService) private chatService: ChatService,
    @inject(GHealthService) private healthService: GHealthService,
    @inject(SpawnService) private spawnService: SpawnService,
  ) {}

  private clear() {
    browser.chat.clear.trigger();
  }

  private pos() {
    const { x, y, z } = mp.game.GetPlayer().GetWorldPosition();

    console.log(x, y, z);
    this.chatService.sendMessage(`${x} ${y} ${z}`);
  }

  private killme() {
    this.healthService.setCurrent(0);
  }

  private spawn() {
    this.spawnService.spawn({
      position: [...this.spawnService.getSpawnPosition(), 1],
    });
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
      name: 'killme',
      description: 'You should.. NOW and give somebody else...',
      handler: this.killme.bind(this),
    });

    this.chatService.addCommand({
      name: 'spawn',
      description: 'Spawns you... duh',
      handler: this.spawn.bind(this),
    });
  }
}
