export const GameModeName = {
  SUMO: 'sumo',
  RACE: 'race',
  PVP: 'pvp',
  BOUNTY_HUNTER: 'bounty_hunter',
} as const;

export type TGameModeName = (typeof GameModeName)[keyof typeof GameModeName];
