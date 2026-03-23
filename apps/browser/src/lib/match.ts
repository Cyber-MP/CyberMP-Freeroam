import type { ServerOutputs } from '@/rpc';

export const isMatchMember = (match: Match, playerId: number) =>
  Object.keys(match.members).some((o) => +o === +(playerId ?? 0));

export type MatchStatus =
  `${ServerOutputs['matchmaking']['getAll'][0]['status']}`;
export type GameModeName =
  `${ServerOutputs['matchmaking']['getAll'][0]['modeName']}`;

export type Match = Omit<
  ServerOutputs['matchmaking']['getAll'][0],
  'modeName' | 'status'
> & {
  status: MatchStatus;
  modeName: GameModeName;
};
