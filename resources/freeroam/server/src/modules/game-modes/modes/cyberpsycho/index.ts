import {
  type DamageEventData,
  EntityType,
  type MpAnyEntity,
  type MpPlayer,
} from '@cybermp/server-types';
import { GameModeName } from '@freeroam/shared/game-modes';
import {
  type CyberpsychoMap,
  CyberpsychoMapName,
  type CyberpsychoStartPoint,
} from '@freeroam/shared/game-modes/cyberpsycho';
import {
  zCreateMatchOptions,
  zJoinMatchOptions,
} from '@freeroam/shared/matchmaking';
import { inject, injectable } from 'inversify';
import ms from 'ms';
import { draw, shuffle, sleep } from 'radash';
import z from 'zod';
import { mp } from '../../../../mp';
import { client } from '../../../../rpc';
import { browser } from '../../../../rpc/browser';
import type { Match } from '../../../matchmaking/match';
import type { Polygon } from '../../../polygons/polygon';
import { PolygonsService } from '../../../polygons/polygons.service';
import { BaseGameMode } from '../../game-mode';
import { CyberpsychoWeapons } from './data';
import { CyberpsychoMaps } from './maps';

export const zCreateCyberpsychoOptions = zCreateMatchOptions.extend({
  map: z.enum(CyberpsychoMapName).meta({ title: 'Map' }),
  maxPlayers: z.number().min(2).max(20).meta({ default: 20 }),
  healing: z.boolean().default(true).optional().meta({ title: 'Healing' }),
  // freeWeapons: z
  //   .boolean()
  //   .default(false)
  //   .optional()
  //   .meta({ title: 'Free weapons' }),
});

export const zJoinCyberpsychoOptions = zJoinMatchOptions.extend({
  weapon: z.enum(CyberpsychoWeapons).meta({ title: 'Weapon' }),
});

type FighterConstructorOptions = {
  match: Match<Cyberpsycho>;
  playerId: number;
  psychoId: number;
  map: CyberpsychoMap;
  startPoint: CyberpsychoStartPoint;
};

class Fighter {
  private map: CyberpsychoMap;
  private match: Match<Cyberpsycho>;

  options: z.infer<typeof zJoinCyberpsychoOptions>;
  player: MpPlayer;
  psychoId: number;
  weapon: string;
  isPsycho: boolean;
  startPoint: CyberpsychoStartPoint;
  alive = true;

  constructor(opts: FighterConstructorOptions) {
    this.map = opts.map;
    this.player = mp.players.at(opts.playerId);
    this.psychoId = opts.psychoId;
    this.isPsycho = opts.psychoId === opts.playerId;

    this.match = opts.match;
    this.startPoint = opts.startPoint;

    // biome-ignore lint/style/noNonNullAssertion: Player is obviously present
    this.options = opts.match.members.get(opts.playerId)!;

    this.weapon =
      Object.entries(CyberpsychoWeapons).find(
        ([_key, name]) => name === this.options.weapon,
      )?.[0] ?? 'Items.Preset_Silverhand_3516';
  }

  async prepare() {
    this.player.dimension = this.match.dimension;

    await client.gameModes.cyberpsycho.prepare
      .call(
        this.player,
        {
          isPsycho: this.isPsycho,
          psychoId: this.psychoId,
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
export class Cyberpsycho extends BaseGameMode<
  typeof zCreateCyberpsychoOptions,
  typeof zJoinCyberpsychoOptions
> {
  name = GameModeName.CYBERPSYCHO;

  readonly CREATE_OPTIONS_SCHEMA = zCreateCyberpsychoOptions;
  readonly JOIN_OPTIONS_SCHEMA = zJoinCyberpsychoOptions;

  private match!: Match<this>;
  private dimension!: number;
  private map!: CyberpsychoMap;
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
    const candidateMap = CyberpsychoMaps.find(
      (o) => o.name === this.match.options.map,
    );
    if (!candidateMap) {
      throw new Error(
        `Cyberpsycho map by name ${this.match.options.map} is not found`,
      );
    }

    this.match = match;
    this.map = candidateMap;
    this.dimension = match.dimension;
  }

  async start() {
    const members = [...this.match.members.keys()];
    const psychoId = draw(members);
    if (!psychoId) {
      return;
    }

    const shuffledStartPoints = shuffle(this.map.startPoints);

    await Promise.all(
      members.map(async (member, index) => {
        const fighter = new Fighter({
          map: this.map,
          match: this.match,
          playerId: member,
          psychoId,
          startPoint: shuffledStartPoints[index],
        });

        await fighter.prepare();

        this.fighters.set(member, fighter);
      }),
    );

    const livingIds = [...this.fighters.values()].map((r) => r.player.id);

    for (const fighterId of livingIds) {
      client.gameModes.cyberpsycho.updateLivingIds.trigger(
        fighterId,
        livingIds,
      );
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

  private onPlayerDamage = (attackerId: number, data: DamageEventData) => {
    const victimId = data.victimId;
    if (!victimId) {
      return;
    }

    if (!this.fighters.has(attackerId)) {
      return;
    }

    const victim = this.fighters.get(victimId);

    if (!victim?.isPsycho) {
      mp.cancelEvent();
    }
  };

  private checkSurvivors() {
    const living = [...this.fighters.values()].filter(
      (fighter) => fighter.alive,
    );

    if (living.length >= 2) {
      const livingIds = living.map((fighter) => fighter.player.id);

      for (const playerId of [...this.fighters.keys()]) {
        client.gameModes.cyberpsycho.updateLivingIds.trigger(
          playerId,
          livingIds,
        );
      }
    }

    if (living.length <= 1) {
      this.endMatch(living[0]?.player.id);
    }
  }

  release() {
    for (const fighter of this.fighters.values()) {
      browser.gameModes.cyberpsycho.startDrawTimer.trigger(
        fighter.player.id,
        Date.now() + this.DRAW_TIME,
      );
    }

    this.polygon = this.polygonsService.create({
      dimension: this.dimension,
      height: this.map.height,
      vertices: this.map.vertices,
    });

    this.polygon.entityLeaveObserver.subscribe(this.onPolygonLeave);

    mp.events.on('playerDeath', this.onPlayerDeath);
    mp.events.on('damage', this.onPlayerDamage);

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
    for (const fighterId of this.fighters.keys()) {
      client.gameModes.cyberpsycho.startCountdown.trigger(
        fighterId,
        this.COUNTDOWN_TIME,
      );
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
    mp.events.off('damage', this.onPlayerDamage);

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
