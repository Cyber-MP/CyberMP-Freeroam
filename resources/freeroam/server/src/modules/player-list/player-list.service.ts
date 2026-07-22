import type { MpPlayer } from '@cybermp/server-types';
import { MatchStatus } from '@freeroam/shared/matchmaking';
import { inject, injectable } from 'inversify';
import z from 'zod';
import { mp } from '../../mp';
import { KillFeedService } from '../killfeed/killfeed.service';
import { MatchRepository } from '../matchmaking/match.repository';

export const zPlayerListEntry = z.object({
  id: z.number(),
  nickname: z.string(),
  activity: z.string().optional(),
  ping: z.number(),
});

export type PlayerListEntry = z.infer<typeof zPlayerListEntry>;

@injectable()
export class PlayerListService {
  constructor(
    @inject(MatchRepository) private matchRepository: MatchRepository,
    @inject(KillFeedService) private killFeedService: KillFeedService,
  ) {}

  getPlayerActivity(player: MpPlayer): string {
    const DEFAULT_MESSAGE = 'In Freeroam';

    if (this.killFeedService.isOnFire(player.id)) {
      return `Slashing players`;
    }

    const match = this.matchRepository.getByMemberId(player.id);
    if (!match) {
      return DEFAULT_MESSAGE;
    }

    switch (match.status) {
      case MatchStatus.LOBBY: {
        return `Waiting in ${match.mode.name} lobby`;
      }
      case MatchStatus.ACTIVE: {
        return `Playing ${match.mode.name}`;
      }
    }

    return DEFAULT_MESSAGE;
  }

  getAll(): PlayerListEntry[] {
    return mp.players.toArray().map((player) => ({
      id: player.id,
      nickname: player.nickname,
      ping: player.ping,
      activity: this.getPlayerActivity(player),
    }));
  }
}
