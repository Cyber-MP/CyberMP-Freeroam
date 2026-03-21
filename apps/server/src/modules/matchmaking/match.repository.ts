import { injectable } from 'inversify';
import { random } from 'radash';
import type { Match } from './match';

@injectable()
export class MatchRepository {
  private matches = new Map<string, Match>();

  save(match: Match) {
    this.matches.set(match.id, match);
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

  getUniqueDimension() {
    let candidate: number;

    do {
      candidate = random(1000, 10000);
    } while (
      [...this.matches.values()].some((lobby) => lobby.dimension === candidate)
    );

    return candidate;
  }

  getByOwnerId(ownerId: number) {
    for (const match of this.matches.values()) {
      if (match.ownerId === ownerId) {
        return match;
      }
    }
  }

  getAll() {
    return Array.from(this.matches.values());
  }
}
