import { inject, injectable } from 'inversify';
import { random } from 'radash';
import { LoggerService } from '../logger/logger.service';
import type { Match } from './match';

@injectable()
export class MatchRepository {
  private matches = new Map<string, Match>();

  constructor(@inject(LoggerService) private loggerService: LoggerService) {}

  save(match: Match) {
    this.matches.set(match.id, match);
  }

  delete(match: Match) {
    this.loggerService.debug(
      `Deleting match ${match.mode.name}:${match.id} with status of ${match.status}`,
    );

    this.matches.delete(match.id);
  }

  findById(id: string) {
    return this.matches.get(id);
  }

  getByMemberId(playerId: number) {
    for (const match of this.matches.values()) {
      if ([...match.members.keys()].some((o) => o === playerId)) {
        return match;
      }
    }
  }

  getByOwnerId(ownerId: number) {
    for (const match of this.matches.values()) {
      if (match.ownerId === ownerId) {
        return match;
      }
    }
  }

  getUniqueDimension() {
    let candidate: number;

    do {
      candidate = random(1000, 10000);
    } while (
      [...this.matches.values()].some((lobby) => lobby.dimension === candidate)
    );

    return candidate;
  }

  getAll() {
    return Array.from(this.matches.values());
  }
}
