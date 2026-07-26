import type { ServerVector3 } from '@cybermp/client-types';
import type { entEntity } from '@cybermp/client-types/game';
import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import { createQuaternion } from '../../lib/vectors';
import { mp } from '../../mp';
import { browser } from '../../rpc/browser';
import { CefService } from '../cef/cef.service';
import { GCameraService } from '../game/camera.service';
import { GHealthService } from '../game/health/health.service';
import { GHudService } from '../game/hud.service';
import { GKeyboardService } from '../game/keyboard.service';
import { GLoadingScreenService } from '../game/loading-screen.service';
import { GMenusService } from '../game/menus.service';
import { GPlayerService } from '../game/player.service';
import { GStatusEffectsService } from '../game/status-effects/status-effects.service';
import { LoggerService } from '../logger/logger.service';

@eager()
@injectable()
export class EntryService {
  private readonly ENTRY_STATUS_EFFECTS = [
    'BaseStatusEffect.Invulnerable',
    'GameplayRestriction.NoZooming',
    'GameplayRestriction.NoMovement',
    'GameplayRestriction.NoWeapons',
    'GameplayRestriction.NoCombat',
  ];

  private readonly CAMERA_POSITION: ServerVector3 = [
    -1417.2535, 1247.6887, 34.843918,
  ];
  private readonly CAMERA_ORIENTATION: [number, number, number, number] = [
    0, 0, -0.98321944, 0.18242696,
  ];
  private readonly LOCAL_CAMERA_ORIENTATION: [number, number, number, number] =
    [-0.072726674, 0.26657978, -0.9271797, 0.25295055];

  private cameraEntity: entEntity | null = null;
  private isEntered = false;

  constructor(
    @inject(GLoadingScreenService)
    private readonly loadingScreen: GLoadingScreenService,
    @inject(GHealthService) private readonly health: GHealthService,
    @inject(GHudService) private readonly hud: GHudService,
    @inject(GStatusEffectsService)
    private readonly statusEffects: GStatusEffectsService,
    @inject(CefService) private readonly cefService: CefService,
    @inject(GKeyboardService)
    private readonly keyboardService: GKeyboardService,
    @inject(GCameraService) private readonly cameraService: GCameraService,
    @inject(LoggerService) private readonly logger: LoggerService,
    @inject(GPlayerService) private readonly playerService: GPlayerService,
    @inject(GMenusService) private readonly menusService: GMenusService,
  ) {
    this.logger.setContext('EntryService');
  }

  @postConstruct()
  private async init() {
    mp.game.onceGameLoaded(() => {
      this.onceGameLoaded().catch(this.logger.error);
    });
    mp.events.onCef('domReady', () => {
      if (this.isEntered) {
        return;
      }

      browser.hud.setGlobalPath.trigger('/entry');
      browser.navigate.trigger('/entry');
    });
    mp.game.onGameLoaded(() => {
      this.applyDefaultGarbage();
    });
  }

  public enter() {
    if (this.isEntered) {
      return;
    }
    this.isEntered = true;

    this.logger.info('Exiting entry screen and restoring gameplay state');
    this.toggleEntryRestrictions(false);

    // this.playerService.invisible(false);
    this.hud.show();

    // if (this.cameraEntity) {
    //   this.cameraService.destroy(this.cameraEntity);
    //   this.cameraEntity = null;
    // }

    this.keyboardService.unsubscribe(this.onKeyPressed);

    browser.hud.setGlobalPath.trigger('/hud');
    browser.navigate.trigger('/hud');
  }

  private applyDefaultGarbage() {
    const questsSystem = mp.game.ScriptGameInstance.GetQuestsSystem();

    questsSystem.SetFactStr('apartment_on', 1);
    questsSystem.SetFactStr('unlock_car_hud_dpad', 1);
    questsSystem.SetFactStr('vvc_visual_customization_unlocked', 1);
    questsSystem.SetFactStr('disable_tutorials', 1);

    mp.game.AddToInventory('Ammo.HandgunAmmo', 1000);
    mp.game.AddToInventory('Ammo.ShotgunAmmo', 2000);
    mp.game.AddToInventory('Ammo.RifleAmmo', 3000);
    mp.game.AddToInventory('Ammo.SniperRifleAmmo', 700);
    mp.game.AddToInventory('Ammo.Special', 700);
  }

  private async onceGameLoaded() {
    this.hud.hide();
    this.menusService.closeAllMenus();

    // this.cefService.setLoadingRedirect('/entry');
    browser.hud.setGlobalPath.trigger('/entry');

    setTimeout(() => this.toggleEntryRestrictions(true), 0);

    await this.loadingScreen.waitForLoadingScreenToHide(200, 1000);

    // retry({ times: 5, delay: 500 }, this.initCamera.bind(this));

    browser.navigate.trigger('/entry');
    mp.events.onCef('domReady', () => {
      if (this.isEntered) {
        return;
      }
      browser.navigate.trigger('/entry');
    });

    this.keyboardService.subscribe(this.onKeyPressed);

    this.logger.info('Fully initialized entry service, spawn player and etc ');
  }

  private async initCamera() {
    try {
      const euler = mp.game.Quaternion.ToEulerAngles(
        createQuaternion(...this.CAMERA_ORIENTATION),
      );

      this.cameraEntity =
        (await this.cameraService
          .create({
            position: this.CAMERA_POSITION,
            orientation: euler,
          })
          .catch(this.logger.error)) ?? null;

      if (!this.cameraEntity) {
        throw new Error('Entity creation returned null');
      }

      const component = this.cameraService.getComponent(this.cameraEntity);
      if (!component) {
        throw new Error('Camera component not found on entity');
      }

      component.SetLocalOrientation(
        createQuaternion(...this.LOCAL_CAMERA_ORIENTATION),
      );

      component.Activate(0, false);
    } catch (err) {
      this.logger.fail(`Failed to initialize entry camera: ${err}`);
    }
  }

  private onKeyPressed = () => {
    this.enter();
  };

  private toggleEntryRestrictions(active: boolean) {
    this.ENTRY_STATUS_EFFECTS.forEach((effect) => {
      if (active) {
        this.statusEffects.add(effect);
      } else {
        this.statusEffects.remove(effect);
      }
    });

    this.health.god(active);
  }
}
