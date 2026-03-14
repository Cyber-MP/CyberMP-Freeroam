import { EInputAction, type EInputKey } from '@cybermp/client-types/enums';
import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import { mp } from '../../mp';
import { browser } from '../../rpc/browser';
import { GHudService } from '../game/hud.service';
import { GKeyboardService } from '../game/keyboard.service';
import { GLoadingScreenService } from '../game/loading-screen.service';

@eager()
@injectable()
export class EntryService {
  constructor(
    @inject(GLoadingScreenService) private loadingScreen: GLoadingScreenService,
    @inject(GKeyboardService) private keyboard: GKeyboardService,
    @inject(GHudService) private hud: GHudService,
  ) {}

  enter() {
    this.keyboard.unsubscribe(this.onInput);
    this.hud.show();

    mp.cef.setFocus(false, false);
    browser.navigate.trigger('/');
  }

  private onInput = (key: EInputKey, action: EInputAction) => {
    if (action === EInputAction.IACT_Release) {
      this.enter();
    }
  };

  @postConstruct()
  private async init() {
    mp.game.onGameLoaded(async () => {
      this.keyboard.subscribe(this.onInput);
      this.hud.hide();

      mp.cef.setFocus(true, true);
      browser.navigate.trigger('/entry');
    });
  }
}
