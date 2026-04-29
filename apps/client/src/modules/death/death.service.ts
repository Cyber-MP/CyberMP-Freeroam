import { inject, postConstruct } from 'inversify';
import { sleep } from 'radash';
import { Observer } from '../../lib/observer';
import { mp } from '../../mp';
import { browser } from '../../rpc/browser';
import { GHealthService } from '../game/health/health.service';
import { GHudService } from '../game/hud.service';
import { GMenusService } from '../game/menus.service';
import { GStatusEffectsService } from '../game/status-effects/status-effects.service';

export class DeathEvent {
  prevented = false;

  preventDefault() {
    this.prevented = true;
  }
}

export type OnDeathCallback = (event: DeathEvent) => void;

export class DeathService {
  private deathObserver = new Observer<OnDeathCallback>();

  private dead = false;

  constructor(
    @inject(GHealthService) private healthService: GHealthService,
    @inject(GHudService) private hudService: GHudService,
    @inject(GStatusEffectsService) private statusEffects: GStatusEffectsService,
    @inject(GMenusService) private menuServce: GMenusService,
  ) {}

  private onGameLoaded() {
    setInterval(() => {
      if (this.healthService.get() <= 0) {
        this.onDeath();
      } else if (this.dead) {
        this.onRevive();
      }
    }, 300);
  }

  private onDeath() {
    if (this.dead) {
      return;
    }

    const event = new DeathEvent();

    this.deathObserver.notify(event);
    if (event.prevented) {
      return;
    }

    this.dead = true;
    this.statusEffects.add('GameplayRestriction.NoCameraControl');

    this.menuServce.closeAllMenus();

    this.hudService.hide();
    browser.navigate.trigger('/death');
  }

  private onRevive() {
    this.dead = false;
    this.statusEffects.remove('GameplayRestriction.NoCameraControl');
  }

  async stand() {
    const player = mp.game.GetPlayer();

    const animFeature = new mp.game.AnimFeature_SwimmingData();
    animFeature.state = 1;

    player
      .GetAnimationControllerComponent()
      .ApplyFeature('SwimmingData', animFeature);

    await sleep(50);

    animFeature.state = 0;

    player
      .GetAnimationControllerComponent()
      .ApplyFeature('SwimmingData', animFeature);
  }

  isDead() {
    return this.dead === true;
  }

  subscribe(callback: OnDeathCallback) {
    this.deathObserver.subscribe(callback);
  }

  unsubscribe(callback: OnDeathCallback) {
    this.deathObserver.unsubscribe(callback);
  }

  @postConstruct()
  private init() {
    mp.game.onGameLoaded(this.onGameLoaded.bind(this));
  }
}
