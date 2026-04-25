import {
  EInputAction,
  EInputKey,
  EquipmentManipulationAction,
  gamedataEquipmentArea,
} from '@cybermp/client-types/enums';
import type { Vector4 } from '@cybermp/client-types/game';
import type { CyberpsychoMap } from '@freeroam/shared/game-modes/cyberpsycho';
import { inject, injectable } from 'inversify';
import { mp } from '../../../../mp';
import { browser } from '../../../../rpc/browser';
import {
  type DeathEvent,
  DeathService,
  type OnDeathCallback,
} from '../../../death/death.service';
import { GHealthService } from '../../../game/health/health.service';
import { GKeyboardService } from '../../../game/keyboard.service';
import { GLoadingScreenService } from '../../../game/loading-screen.service';
import { GPlayerService } from '../../../game/player.service';
import { GStatusEffectsService } from '../../../game/status-effects/status-effects.service';
import { GTeleportService } from '../../../game/teleport/teleport.service';
import { MappingService } from '../../../mapping/mapping.service';
import { SpawnService } from '../../../spawn/spawn.service';
import { SpectatingService } from '../../../spectating/spectating.service';
import { BaseGameMode } from '../../game-mode';
import type { CyberpsychoPrepareDTO } from './dto';

@injectable()
export class Cyberpsycho extends BaseGameMode<'cyberpsycho'> {
  private livingIds: number[] = [];
  private isAlive = true;
  private isPsycho = false;
  private initialPosition!: Vector4;

  private countDownInterval: ReturnType<typeof setInterval> | undefined;
  private checkWeaponInterval: ReturnType<typeof setInterval> | undefined;

  private weapon!: string;
  private map!: CyberpsychoMap;

  private BASE_HEALTH = 3000;

  private PSYCHO_CYBERWARE = {};

  constructor(
    @inject(GTeleportService) private teleportService: GTeleportService,
    @inject(GHealthService) private healthService: GHealthService,
    @inject(GStatusEffectsService)
    private statusEffectsService: GStatusEffectsService,
    @inject(GKeyboardService) private keyboardService: GKeyboardService,
    @inject(SpectatingService) private spectatingService: SpectatingService,
    @inject(DeathService) private deathService: DeathService,
    @inject(SpawnService) private spawnService: SpawnService,
    @inject(MappingService) private mappingService: MappingService,
    @inject(GLoadingScreenService)
    private loadingScreenService: GLoadingScreenService,
    @inject(GPlayerService)
    private playerService: GPlayerService,
  ) {
    super();
  }

  calculatePsychoHealth() {
    const players = Object.keys(this.members).length || 1;

    let health = this.BASE_HEALTH * players ** 0.8;

    if (this.options.healing) {
      health *= 1.3; // +30%
    }

    const MIN_HEALTH = this.BASE_HEALTH * 1.5;
    if (health < MIN_HEALTH) {
      health = MIN_HEALTH;
    }

    const MAX_HEALTH = this.BASE_HEALTH * 12;
    if (health > MAX_HEALTH) {
      health = MAX_HEALTH;
    }

    return Math.round(health);
  }

  calculateFighterHealth() {
    const players = Object.keys(this.members).length || 1;

    let health = 800;

    if (players <= 3) {
      health *= 1.2;
    }

    if (this.options.healing) {
      health *= 1.2;
    }

    return Math.round(health);
  }

  start() {
    this.spectatingService.unspectate();

    this.initialPosition = mp.game.GetPlayer().GetWorldPosition();

    this.mountDeathHandler();
  }

  end() {
    if (this.map.mapping) {
      this.mappingService.destroy(this.map.mapping as any);
    }

    this.unmountCheckWeaponInterval();

    setTimeout(() => {
      this.unmountDeathHandler();
    }, 1000);

    setTimeout(() => {
      this.unmountSpectateBinds();
      this.spectatingService.unspectate();
    });

    if (this.countDownInterval) {
      clearInterval(this.countDownInterval);
    }

    setTimeout(() => {
      this.teleportService.teleport(this.initialPosition);
    });

    this.healthService.resetToDefault();

    this.statusEffectsService.remove('GameplayRestriction.NoMovement');
    this.statusEffectsService.remove('GameplayRestriction.NoCombat');
    this.statusEffectsService.remove('GameplayRestriction.NoWeapons');
    this.statusEffectsService.remove('GameplayRestriction.BlockAllMenu');
    this.statusEffectsService.remove('GameplayRestriction.NoRadialMenus');
    this.statusEffectsService.remove('GameplayRestriction.NoHealing');

    browser.hud.setGlobalPath.trigger('/hud');
    browser.navigate.trigger('/hud');
  }

  private prepareWeapons() {
    const localPlayerObject = mp.game.GetPlayerObject();
    const localPlayer = mp.game.GetPlayer();

    // Unequip all weapons
    for (let i = 0; i < 3; i++) {
      mp.game.EquipmentSystem.RequestUnequipItem(
        localPlayerObject,
        gamedataEquipmentArea.Weapon,
        i,
      );
    }

    const eqSystem =
      mp.game.ScriptGameInstance.GetScriptableSystemsContainer().Get(
        'EquipmentSystem',
      );

    // eqSystem.EquipCyberwareByTDBID(
    //   localPlayer,
    //   'Items.AdvancedBoostedTendonsLegendary',
    // );
  }

  async prepare(data: CyberpsychoPrepareDTO) {
    this.spawnService.spawn({
      position: data.startPoint,
      health: data.isPsycho
        ? this.calculatePsychoHealth()
        : this.calculateFighterHealth(),
    });
    await this.loadingScreenService.waitForLoadingScreenToHide();

    this.statusEffectsService.add('GameplayRestriction.NoMovement');
    this.statusEffectsService.add('GameplayRestriction.NoCombat');
    this.statusEffectsService.add('GameplayRestriction.NoWeapons');
    this.statusEffectsService.add('GameplayRestriction.BlockAllMenu');
    this.statusEffectsService.add('GameplayRestriction.NoRadialMenus');
    this.statusEffectsService.add('GameplayRestriction.NoHealing');

    browser.hud.setGlobalPath.trigger('/hud/game-modes/cyberpsycho/');
    browser.navigate.trigger('/hud/game-modes/cyberpsycho/');

    await this.playerService.levelUp();

    this.prepareWeapons();

    this.weapon = data.weapon;
    this.map = data.map;
    this.isPsycho = data.isPsycho;

    if (data.map.mapping) {
      this.mappingService.create(data.map.mapping as any);
    }
  }

  private checkCurrentWeapon() {
    const equipmentSystem =
      mp.game.ScriptGameInstance.GetScriptableSystemsContainer().Get(
        'EquipmentSystem',
      );
    const transactionSystem = mp.game.ScriptGameInstance.GetTransactionSystem();

    const [, itemsList] = transactionSystem.GetItemList(
      mp.game.GetPlayerObject(),
    );

    const doesHaveItem = itemsList.some(
      (item) =>
        item.GetID().id === mp.game.gameItemID.FromTDBID(this.weapon).id,
    );

    const player = mp.game.GetPlayerObject();

    const comradeItemId = mp.game.gameItemID.FromTDBID(this.weapon);
    const isComradeEquipped = equipmentSystem.IsEquipped(player, comradeItemId);

    if (!isComradeEquipped) {
      if (!doesHaveItem) {
        mp.game.AddToInventory(this.weapon, 1);
      }

      const drawItemRequest = new mp.game.gameDrawItemRequest();
      drawItemRequest.owner = player;
      drawItemRequest.itemID = mp.game.gameItemID.CreateQuery(this.weapon);
      equipmentSystem.QueueRequest(drawItemRequest);
    } else {
      const request = new mp.game.EquipmentSystemWeaponManipulationRequest();
      request.owner = player;
      request.requestType =
        EquipmentManipulationAction.RequestLastUsedOrFirstAvailableWeapon;
      equipmentSystem.QueueRequest(request);
    }
  }

  private mountCheckWeaponInterval() {
    this.checkWeaponInterval = setInterval(
      this.checkCurrentWeapon.bind(this),
      500,
    );
  }

  private unmountCheckWeaponInterval() {
    if (this.checkWeaponInterval) {
      clearInterval(this.checkWeaponInterval);
    }
  }

  private deathHandler: OnDeathCallback = (event: DeathEvent) => {
    event.preventDefault();
    this.spawnService.spawn({
      position: mp.game.GetPlayer().GetWorldPosition(),
    });
  };

  private mountDeathHandler() {
    this.deathService.subscribe(this.deathHandler);
  }

  private unmountDeathHandler() {
    this.deathService.unsubscribe(this.deathHandler);
  }

  updateLivingIds(data: number[]) {
    this.livingIds = data;
    const localPlayerId = mp.getPlayerServerId(1);

    if (!this.livingIds.includes(localPlayerId)) {
      this.onDead();
    } else {
      const current = this.spectatingService.getSpectatedPlayerId();

      if (current && !this.livingIds.includes(current)) {
        this.spectateNextValidTarget();
      }
    }
  }

  private onDead() {
    if (this.isAlive) {
      return;
    }

    this.isAlive = false;

    this.mountSpectateBinds();

    this.spectateNextValidTarget();
  }

  private spectateNextKeyHandler = (action: EInputAction) => {
    if (action === EInputAction.IACT_Press) {
      this.cycleSpectateTarget(-1);
    }
  };

  private spectatePrevKeyHandler = (action: EInputAction) => {
    if (action === EInputAction.IACT_Press) {
      this.cycleSpectateTarget(1);
    }
  };

  private mountSpectateBinds() {
    browser.hints.add.trigger({
      'A/D': 'Switch Player',
    });

    this.keyboardService.bindKey(EInputKey.IK_A, this.spectatePrevKeyHandler);
    this.keyboardService.bindKey(EInputKey.IK_D, this.spectateNextKeyHandler);
  }

  private unmountSpectateBinds() {
    browser.hints.remove.trigger('A/D');

    this.keyboardService.unbindKey(EInputKey.IK_A, this.spectatePrevKeyHandler);
    this.keyboardService.unbindKey(EInputKey.IK_D, this.spectateNextKeyHandler);
  }

  private spectateNextValidTarget() {
    if (this.livingIds[0]) {
      this.spectatingService.spectate(this.livingIds[0]);
    } else {
      this.spectatingService.unspectate();
    }
  }

  private cycleSpectateTarget(direction: number) {
    if (this.livingIds.length === 0) {
      return;
    }

    const currentIndex = this.livingIds.findIndex(
      (id) => id === this.spectatingService.getSpectatedPlayerId(),
    );

    let nextIndex = (currentIndex + direction) % this.livingIds.length;
    if (nextIndex < 0) {
      nextIndex = this.livingIds.length - 1;
    }

    this.spectatingService.spectate(this.livingIds[nextIndex]);
  }

  release() {
    this.statusEffectsService.remove('GameplayRestriction.NoMovement');

    this.statusEffectsService.remove('GameplayRestriction.NoCombat');
    this.statusEffectsService.remove('GameplayRestriction.NoWeapons');

    if (this.options.healing) {
      this.statusEffectsService.remove('GameplayRestriction.NoHealing');
    }

    this.mountCheckWeaponInterval();
  }

  startCountdown(duration: number) {
    const startTime = Date.now();

    this.countDownInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.ceil((duration - elapsed) / 1000);

      if (remaining <= 0) {
        browser.gameModes.cyberpsycho.setCountdownText.trigger('GO!');

        this.release();
        clearInterval(this.countDownInterval);
      } else {
        browser.gameModes.cyberpsycho.setCountdownText.trigger(
          String(remaining),
        );
      }
    }, 100);
  }
}
