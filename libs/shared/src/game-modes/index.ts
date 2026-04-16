export const GameModeName = {
  SUMO: 'sumo',
  RACE: 'race',
  PVP: 'pvp',
} as const;

export type TGameModeName = (typeof GameModeName)[keyof typeof GameModeName];
