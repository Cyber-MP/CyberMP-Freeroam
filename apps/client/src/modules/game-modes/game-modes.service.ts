import type { MatchDTO } from '@freeroam/shared';
import { inject, injectable, preDestroy } from 'inversify';
import { ChatCommandFlag, ChatService } from '../chat/chat.service';
import {
  type BaseGameMode,
  type GameModeFactory,
  GameModeFactorySymbol,
} from './game-mode';

@injectable()
export class GameModesService {
  private activeMode: BaseGameMode | null = null;

  constructor(
    @inject(GameModeFactorySymbol) private gameModeFactory: GameModeFactory,
    @inject(ChatService) private chatService: ChatService,
  ) {}

  getActiveGameMode<T extends BaseGameMode = BaseGameMode>(): T | null {
    return this.activeMode as T | null;
  }

  isActive() {
    return this.activeMode !== null;
  }

  start(match: MatchDTO) {
    const instance = this.gameModeFactory(match.modeName);
    instance.init(match);
    instance.start();

    this.chatService.addCommandFlag(ChatCommandFlag.DisableInGameMode);

    this.activeMode = instance;
  }

  end() {
    if (!this.activeMode) {
      return;
    }

    this.chatService.removeCommandFlag(ChatCommandFlag.DisableInGameMode);

    this.activeMode.end();
    this.activeMode = null;
  }

  @preDestroy()
  private destroy() {
    this.activeMode?.end();
  }
}
