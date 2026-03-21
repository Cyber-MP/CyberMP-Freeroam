import { inject, injectable } from 'inversify';
import type z from 'zod';
import type { GameModeFactory } from '../game-modes/game-mode';
import { GAME_MODES_TYPES } from '../game-modes/game-modes.module';
import type { zCreateMatchDTO } from './dto/create-match.dto';
import type { zJoinMatchDTO } from './dto/join-match.dto';
import { type JoinMatchOptions, Match } from './match';
import { MatchRepository } from './match.repository';

@injectable()
export class MatchmakingService {
  constructor(
    @inject(MatchRepository) private matchRepository: MatchRepository,
    @inject(GAME_MODES_TYPES.GameModeFactory)
    private gameModeFactory: GameModeFactory,
  ) {}

  createMatch(ownerId: number, dto: z.infer<typeof zCreateMatchDTO>) {
    const mode = this.gameModeFactory(dto.name);

    if (!mode.CREATE_OPTIONS_SCHEMA.safeParse(dto.createOptions).success) {
      return;
    }

    if (!mode.JOIN_OPTIONS_SCHEMA.safeParse(dto.joinOptions).success) {
      return;
    }

    const match = new Match<any>({
      ownerId,
      mode,
      createOptions: dto.createOptions,
      joinOptions: dto.joinOptions,
      dimension: this.matchRepository.getUniqueDimension(),
    });

    this.matchRepository.save(match);

    return match;
  }

  joinMatch(playerId: number, dto: z.infer<typeof zJoinMatchDTO>) {
    const match = this.matchRepository.findById(dto.id);
    if (!match) {
      return false;
    }

    return match.join(playerId, dto.options as JoinMatchOptions);
  }

  leaveMatch(playerId: number) {
    const match = this.matchRepository.getByMemberId(playerId);
    if (!match) {
      return;
    }

    match.leave(playerId);
  }
}
