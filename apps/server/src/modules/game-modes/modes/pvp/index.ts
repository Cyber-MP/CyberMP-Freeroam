import {
  EntityType,
  type MpAnyEntity,
  type MpPlayer,
} from '@cybermp/server-types';
import { GameModeName } from '@freeroam/shared/game-modes';
import {
  type PvpMap,
  PvpMapName,
  type PvpStartPoint,
} from '@freeroam/shared/game-modes/pvp';
import {
  zCreateMatchOptions,
  zJoinMatchOptions,
} from '@freeroam/shared/matchmaking';
import { inject, injectable } from 'inversify';
import ms from 'ms';
import { shuffle, sleep } from 'radash';
import z from 'zod';
import { mp } from '../../../../mp';
import { client } from '../../../../rpc';
import { browser } from '../../../../rpc/browser';
import type { Match } from '../../../matchmaking/match';
import type { Polygon } from '../../../polygons/polygon';
import { PolygonsService } from '../../../polygons/polygons.service';
import { BaseGameMode } from '../../game-mode';
import { PvpWeapons } from './data';
import { PvpMaps } from './maps';

export const zCreatePvpOptions = zCreateMatchOptions.extend({
  map: z.enum(PvpMapName).meta({ title: 'Map' }),
  maxPlayers: z.number().min(2).max(20).meta({ default: 20 }),
  healing: z.boolean().default(true).optional().meta({ title: 'Healing' }),
  freeWeapons: z
    .boolean()
    .default(false)
    .optional()
    .meta({ title: 'Free weapons' }),
});

export const zJoinPvpOptions = zJoinMatchOptions.extend({
  weapon: z.enum(PvpWeapons).meta({ title: 'Weapon' }),
});

type FighterConstructorOptions = {
  player: number;
  map: PvpMap;
  match: Match<Pvp>;
  startPoint: PvpStartPoint;
};

class Fighter {
  private map: PvpMap;
  private match: Match<Pvp>;

  options: z.infer<typeof zJoinPvpOptions>;
  player: MpPlayer;
  weapon: string;
  startPoint: PvpStartPoint;
  alive = true;

  constructor(opts: FighterConstructorOptions) {
    this.map = opts.map;
    this.player = mp.players.at(opts.player);

    this.match = opts.match;
    this.startPoint = opts.startPoint;

    // biome-ignore lint/style/noNonNullAssertion: Player is obviously present
    this.options = opts.match.members.get(opts.player)!;

    this.weapon =
      Object.entries(PvpWeapons).find(
        ([key, name]) => name === this.options.weapon,
      )?.[0] ?? 'Items.Preset_Silverhand_3516';
  }

  async prepare() {
    this.player.dimension = this.match.dimension;

    await client.gameModes.pvp.prepare
      .call(
        this.player,
        {
          map: structuredClone(this.map),
          weapon: this.weapon,
          startPoint: structuredClone(this.startPoint),
        },
        {},
        { timeout: ms('30s') },
      )
      .catch(() => {
        this.match.leave(this.player.id);
      });
  }

  lose() {
    if (!this.alive) {
      return;
    }

    this.alive = false;
  }

  reset() {
    this.player.dimension = 0;
  }
}

@injectable()
export class Pvp extends BaseGameMode<
  typeof zCreatePvpOptions,
  typeof zJoinPvpOptions
> {
  name = GameModeName.PVP;

  readonly CREATE_OPTIONS_SCHEMA = zCreatePvpOptions;
  readonly JOIN_OPTIONS_SCHEMA = zJoinPvpOptions;

  private match!: Match<this>;
  private dimension!: number;
  private map!: PvpMap;
  private polygon?: Polygon;

  private fighters = new Map<number, Fighter>();
  private released = false;
  private drawTimeout: ReturnType<typeof setTimeout> | null = null;

  private readonly COUNTDOWN_TIME = ms('5s');
  private readonly DRAW_TIME = ms('10m');

  @inject(PolygonsService)
  private polygonsService!: PolygonsService;

  override getJoinSchema() {
    return this.JOIN_OPTIONS_SCHEMA;
  }

  init(match: Match<this>): void {
    this.match = match;
    this.map = PvpMaps.find((o) => o.name === this.match.options.map)!;
    this.dimension = match.dimension;
  }

  async start() {
    const members = [...this.match.members.keys()];

    const shuffledStartPoints = shuffle(this.map.startPoints);

    await Promise.all(
      members.map(async (member, index) => {
        const fighter = new Fighter({
          map: this.map,
          match: this.match,
          player: member,
          startPoint: shuffledStartPoints[index],
        });

        await fighter.prepare();

        this.fighters.set(member, fighter);
      }),
    );

    const livingIds = [...this.fighters.values()].map((r) => r.player.id);

    for (const fighterId of livingIds) {
      client.gameModes.pvp.updateLivingIds.trigger(fighterId, livingIds);
    }

    await this.startCountdown();
  }

  private onPolygonLeave = (entity: MpAnyEntity) => {
    if (entity.type !== EntityType.Player) {
      return;
    }

    const fighter = this.fighters.get(entity.id);

    fighter?.lose();

    this.checkSurvivors();
  };

  private onPlayerDeath = (playerId: number) => {
    const fighter = this.fighters.get(playerId);
    if (!fighter) {
      return;
    }

    fighter.lose();

    this.checkSurvivors();
  };

  private checkSurvivors() {
    const living = [...this.fighters.values()].filter((fighter) => fighter.alive);

    if (living.length >= 2) {
      const livingIds = living.map((fighter) => fighter.player.id);

      for (const playerId of [...this.fighters.keys()]) {
        client.gameModes.pvp.updateLivingIds.trigger(playerId, livingIds);
      }
    }

    if (living.length <= 1) {
      this.endMatch(living[0]?.player.id);
    }
  }

  release() {
    for (const fighter of this.fighters.values()) {
      browser.gameModes.pvp.startDrawTimer.trigger(
        fighter.player.id,
        Date.now() + this.DRAW_TIME,
      );
    }

    this.polygon = this.polygonsService.create({
      dimension: this.dimension,
      height: this.map.height,
      vertices: this.map.vertices,
      // TODO: remove in prod
      visible: true,
    });

    this.polygon.entityLeaveObserver.subscribe(this.onPolygonLeave);

    mp.events.on('playerDeath', this.onPlayerDeath);

    this.drawTimeout = setTimeout(() => {
      this.match.end();
    }, this.DRAW_TIME);

    this.released = true;
  }

  lose(playerId: number) {
    if (!this.released) {
      return;
    }

    const fighter = this.fighters.get(playerId);

    if (!fighter) {
      return;
    }

    return fighter.lose();
  }

  async startCountdown() {
    for (const fighter of this.fighters.keys()) {
      client.gameModes.pvp.startCountdown.trigger(fighter, this.COUNTDOWN_TIME);
    }

    await sleep(this.COUNTDOWN_TIME);

    this.release();
  }

  private endMatch(winnerId?: number) {
    const winner = winnerId ? this.fighters.get(winnerId) : undefined;

    const title = winner
      ? `${winner?.player.nickname} won this match! Choomba!`
      : `Draw! Better luck next time...`;

    for (const member of [...this.match.members.keys()]) {
      browser.toast.trigger(member, {
        title,
        type: 'success',
      });
    }

    this.match.end();
  }

  end() {
    if (this.drawTimeout) {
      clearTimeout(this.drawTimeout);
    }

    if (this.polygon) {
      this.polygon.entityLeaveObserver.unsubscribe(this.onPolygonLeave);
      this.polygonsService.destroy(this.polygon);
    }

    mp.events.off('playerDeath', this.onPlayerDeath);

    for (const fighter of this.fighters.values()) {
      fighter.reset();
    }

    this.fighters.clear();
  }

  onPlayerLeave(playerId: number): void {
    const fighter = this.fighters.get(playerId);

    fighter?.reset();

    this.fighters.delete(playerId);

    this.checkSurvivors();
  }

  onPlayerJoin() {}
}
