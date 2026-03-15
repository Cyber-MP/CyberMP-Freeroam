import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import { mp } from '../../mp';
import { browser } from '../../rpc/browser';
import { GHudService } from '../game/hud.service';
import { GKeyboardService } from '../game/keyboard.service';
import { GLoadingScreenService } from '../game/loading-screen.service';
import { GStatusEffectsService } from '../game/status-effects/status-effects.service';

// TODO: show entry screen only when loading is FULLY completed, also add localStorage data, so if a player recently been already on server then dont show this screen to him

@eager()
@injectable()
export class EntryService {
  private readonly entryStatusEffect = [
    'BaseStatusEffect.Invulnerable',
    'GameplayRestriction.NoZooming',
    'GameplayRestriction.NoMovement',
    'GameplayRestriction.NoWeapons',
    'GameplayRestriction.NoCombat',
    'GameplayRestriction.BlockAllMenu',
    'GameplayRestriction.NoRadialMenus',
  ];

  private passed = false;

  constructor(
    @inject(GLoadingScreenService) private loadingScreen: GLoadingScreenService,
    @inject(GKeyboardService) private keyboard: GKeyboardService,
    @inject(GHudService) private hud: GHudService,
    @inject(GStatusEffectsService)
    private statusEffects: GStatusEffectsService,
  ) {}

  isPassed() {
    return this.passed === true;
  }

  enter() {
    for (const effect of this.entryStatusEffect) {
      this.statusEffects.remove(effect);
    }

    this.keyboard.unsubscribe(this.onInput);
    this.hud.show();

    mp.cef.setFocus(false, false);
    browser.navigate.trigger('/hud');
    this.passed = true;
  }

  private onInput = (...args: any[]) => {
    console.log('input pressed', args);
    this.enter();
  };

  @postConstruct()
  private async init() {
    mp.game.onGameLoaded(async () => {
      // this in setTimeout because effect "GameplayRestriction.NoMovement" cant work instantly on game loaded
      setTimeout(() => {
        for (const effect of this.entryStatusEffect) {
          this.statusEffects.add(effect);
        }
      });

      await this.loadingScreen.waitForLoadingScreenToHide(200, 1000);

      this.keyboard.subscribe(this.onInput);
      this.hud.hide();

      mp.cef.setFocus(true, true);
      browser.navigate.trigger('/entry');
    });
  }
}
