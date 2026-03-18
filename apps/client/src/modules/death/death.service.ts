import { inject, postConstruct } from 'inversify';
import { sleep } from 'radash';
import { Observer } from '../../lib/observer';
import { mp } from '../../mp';
import { browser } from '../../rpc/browser';
import { GHealthService } from '../game/health/health.service';
import { GHudService } from '../game/hud.service';
import { GStatusEffectsService } from '../game/status-effects/status-effects.service';

type OnDeathCallback = () => void;

export class DeathService {
  private deathObserver = new Observer<OnDeathCallback>();

  private dead = false;

  constructor(
    @inject(GHealthService) private healthService: GHealthService,
    @inject(GHudService) private hudService: GHudService,
    @inject(GStatusEffectsService) private statusEffects: GStatusEffectsService,
  ) {}

  private onGameLoaded() {
    setInterval(() => {
      if (this.healthService.get() <= 0) {
        this.dead = true;
        this.statusEffects.add('GameplayRestriction.NoCameraControl');
        this.deathObserver.notify();
      } else if (this.dead) {
        this.dead = false;
        this.statusEffects.remove('GameplayRestriction.NoCameraControl');
      }
    }, 1000);

    this.subscribe(this.onGlobalDeath.bind(this));
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

  private onGlobalDeath() {
    this.hudService.hide();
    browser.navigate.trigger('/death');
  }

  @postConstruct()
  private init() {
    mp.game.onGameLoaded(this.onGameLoaded.bind(this));
  }
}
