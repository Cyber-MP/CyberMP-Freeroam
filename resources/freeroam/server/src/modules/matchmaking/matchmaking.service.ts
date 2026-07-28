import { RpcError } from '@cybermp/rpc-server';
import type { MpPlayer } from '@cybermp/server-types';
import {
  type JoinMatchOptions,
  MatchStatus,
} from '@freeroam/shared/matchmaking';
import { inject, injectable } from 'inversify';
import type z from 'zod';
import { mp } from '../../mp';
import { browser } from '../../rpc/browser';
import {
  type GameModeFactory,
  GameModeFactorySymbol,
} from '../game-modes/game-mode';
import type { zCreateMatchDTO } from './dto/create-match.dto';
import type { zJoinMatchDTO } from './dto/join-match.dto';
import { type MatchFactory, MatchFactorySymbol } from './match';
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

  private broadcastMatches = () => {
    for (const player of mp.players.toArray()) {
      browser.matchmaking.updateMatches.trigger(
        player,
        this.matchRepository.getAll().map((o) => o.toDTO()),
      );
    }
  };

  isOnActiveMatch(player: number | MpPlayer) {
    const match = this.matchRepository.getByMemberId(
      typeof player === 'number' ? player : player.id,
    );
    if (!match) {
      return false;
    }

    return match.status === MatchStatus.ACTIVE;
  }

  async createMatch(ownerId: number, dto: z.infer<typeof zCreateMatchDTO>) {
    const mode = this.gameModeFactory(dto.name);

    if (!mode.CREATE_OPTIONS_SCHEMA.safeParse(dto.createOptions).success) {
      throw RpcError.invalidData({
        message: 'Invalid create options',
      });
    }

    if (!mode.JOIN_OPTIONS_SCHEMA.safeParse(dto.joinOptions).success) {
      throw RpcError.invalidData({
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
        onPlayerJoin: this.broadcastMatches,
        onPlayerLeave: this.broadcastMatches,
        onEnd: () => {
          this.matchRepository.delete(match);
          this.broadcastMatches();
        },
        onStart: this.broadcastMatches,
      },
    );

    await this.leaveMatch(ownerId);

    this.matchRepository.save(match);

    this.broadcastMatches();

    return match;
  }

  async joinMatch(playerId: number, dto: z.infer<typeof zJoinMatchDTO>) {
    const match = this.matchRepository.findById(dto.id);
    if (!match) {
      return false;
    }

    await this.leaveMatch(playerId);

    return match.join(playerId, dto.options as JoinMatchOptions);
  }

  async leaveMatch(playerId: number) {
    const match = this.matchRepository.getByMemberId(playerId);
    if (!match) {
      return;
    }

    await match.leave(playerId);
  }
}
