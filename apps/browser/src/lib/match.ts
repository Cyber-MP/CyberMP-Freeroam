import type { MatchDTO } from '@freeroam/shared/matchmaking';

export const isMatchMember = (match: MatchDTO, playerId: number) =>
  Object.keys(match.members).some((o) => +o === +(playerId ?? 0));
