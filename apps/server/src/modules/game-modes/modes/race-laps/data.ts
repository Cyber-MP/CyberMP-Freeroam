export enum RaceLapsMap {
  TEST = 'test',
}

export enum RaceLapsVehicleClass {
  MOTO = 'moto',
  SPORT = 'sport',
}

export enum RaceLapsVehicle {
  CALIBURN = 'caliburn',
  BIKE = 'bike',
  BIKE2 = 'bike2',
}

export const RaceLapsVehicleMap: Record<
  RaceLapsVehicleClass,
  RaceLapsVehicle[]
> = {
  moto: [RaceLapsVehicle.BIKE],
  sport: [RaceLapsVehicle.CALIBURN],
};
