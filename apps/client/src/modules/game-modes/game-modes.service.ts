import { inject, injectable, preDestroy } from 'inversify';
import { ChatCommandFlag, ChatService } from '../chat/chat.service';
import { LoggerService } from '../logger/logger.service';
import {
  type BaseGameMode,
  type GameModeFactory,
  GameModeFactorySymbol,
} from './game-mode';
import type { MatchDTO } from './match';

@injectable()
export class GameModesService {
  private activeMode: BaseGameMode | null = null;

  constructor(
    @inject(GameModeFactorySymbol) private gameModeFactory: GameModeFactory,
    @inject(ChatService) private chatService: ChatService,
    @inject(LoggerService) private logger: LoggerService,
  ) {
    this.logger.setContext('GameModesService');
  }

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

    this.logger.info('Started game mode', match.modeName);
  }

  end() {
    if (!this.activeMode) {
      return;
    }

    this.chatService.removeCommandFlag(ChatCommandFlag.DisableInGameMode);

    this.logger.info('Ended game mode', this.activeMode?.match.modeName);

    this.activeMode.end();
    this.activeMode = null;
  }

  @preDestroy()
  private destroy() {
    this.activeMode?.end();
  }
}
