import { RpcError } from '@cybermp/rpc-server';
import type { MpPlayer } from '@cybermp/server-types';
import { inject, injectable } from 'inversify';
import type z from 'zod';
import {
  type GameModeFactory,
  GameModeFactorySymbol,
} from '../game-modes/game-mode';
import type { zCreateMatchDTO } from './dto/create-match.dto';
import type { zJoinMatchDTO } from './dto/join-match.dto';
import {
  type JoinMatchOptions,
  type MatchFactory,
  MatchFactorySymbol,
  MatchStatus,
} from './match';
import { MatchRepository } from './match.repository';

@injectable()
export class MatchmakingService {
  constructor(
    @inject(MatchRepository) private matchRepository: MatchRepository,
    @inject(GameModeFactorySymbol)
    private gameModeFactory: GameModeFactory,
    @inject(MatchFactorySymbol)
    private matchFactory: MatchFactory,
  ) {}

  isOnActiveMatch(player: number | MpPlayer) {
    const match = this.matchRepository.getByMemberId(
      typeof player === 'number' ? player : player.id,
    );
    if (!match) {
      return false;
    }

    return match.status === MatchStatus.ACTIVE;
  }

  createMatch(ownerId: number, dto: z.infer<typeof zCreateMatchDTO>) {
    const mode = this.gameModeFactory(dto.name);

    if (!mode.CREATE_OPTIONS_SCHEMA.safeParse(dto.createOptions).success) {
      throw new RpcError({
        message: 'Invalid create options',
      });
    }

    if (!mode.JOIN_OPTIONS_SCHEMA.safeParse(dto.joinOptions).success) {
      throw new RpcError({
        message: 'Invalid join options',
      });
    }

    const match = this.matchFactory();
    match._init(
      {
        ownerId,
        mode,
        createOptions: dto.createOptions,
        joinOptions: dto.joinOptions,
        dimension: this.matchRepository.getUniqueDimension(),
      },
      {
        onEnd: () => {
          this.matchRepository.delete(match);
        },
      },
    );

    this.leaveMatch(ownerId);

    this.matchRepository.save(match);

    return match;
  }

  joinMatch(playerId: number, dto: z.infer<typeof zJoinMatchDTO>) {
    const match = this.matchRepository.findById(dto.id);
    if (!match) {
      return false;
    }

    this.leaveMatch(playerId);

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
