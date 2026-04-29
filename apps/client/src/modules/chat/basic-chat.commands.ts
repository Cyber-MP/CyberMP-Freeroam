import { EPlayerGender } from '@cybermp/client-types/enums';
import type { Door } from '@cybermp/client-types/game';
import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import { retry } from 'radash';
import z from 'zod';
import { mp } from '../../mp';
import { browser } from '../../rpc/browser';
import { GAppearanceMenuService } from '../game/appearance-menu.service';
import { GHudService } from '../game/hud.service';
import { GPlayerService } from '../game/player.service';
import { GStatusEffectsService } from '../game/status-effects/status-effects.service';
import { ChatCommandFlag, ChatService } from './chat.service';

@eager()
@injectable()
export class BasicChatCommands {
  constructor(
    @inject(ChatService) private chatService: ChatService,
    @inject(GStatusEffectsService) private statusEffects: GStatusEffectsService,
    @inject(GPlayerService) private playerService: GPlayerService,
    @inject(GHudService) private hudService: GHudService,
    @inject(GAppearanceMenuService)
    private appearanceMenuService: GAppearanceMenuService,
  ) {}

  private clear() {
    browser.chat.clear.trigger();
  }

  private pos() {
    const { x, y, z } = mp.game.GetPlayer().GetWorldPosition();
    const yaw = mp.game.GetPlayer().GetWorldYaw();

    console.log(x, y, z, yaw);
    this.chatService.sendMessage(`${x} ${y} ${z} ${yaw}`);
  }

  private cpos() {
    const { x, y, z } = mp.game.GetPlayer().GetWorldPosition();
    const yaw = mp.game.GetPlayer().GetWorldYaw();

    console.log(x, y, z, yaw);
    this.chatService.sendMessage(`${x} ${y} ${z} ${yaw}`);
    browser.copyToClipboard.trigger(`${x} ${y} ${z} ${yaw}`);
  }

  private fixWeapons() {
    this.statusEffects.remove('GameplayRestriction.NoCombat');
    this.statusEffects.remove('GameplayRestriction.NoWeapons');
  }

  private hideGameHud() {
    this.hudService.hide();
  }

  private showGameHud() {
    this.hudService.show();
  }

  private vehicleBoost(boostStrength = 40) {
    const player = mp.game.GetPlayer();
    const vehicle = player.GetMountedVehicle();
    if (!vehicle) {
      return this.chatService.sendMessage('You are not in a vehicle.');
    }
    const forward = vehicle.GetWorldForward();

    const boost = {
      x: forward.x * boostStrength,
      y: forward.y * boostStrength,
      z: forward.z * boostStrength,
    };

    vehicle.AddLinelyVelocity(boost, { x: 0, y: 0, z: 0 });
  }

  private vehicleStop() {
    const player = mp.game.GetPlayer();
    const vehicle = player.GetMountedVehicle();
    if (!vehicle) {
      return this.chatService.sendMessage('You are not in a vehicle.');
    }

    vehicle.ChangeLinelyVelocity({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0 }, 0);
  }

  private vehicleGravity() {
    const player = mp.game.GetPlayer();
    const vehicle = player.GetMountedVehicle();
    if (!vehicle) {
      return this.chatService.sendMessage('You are not in a vehicle.');
    }

    vehicle.EnableGravity(!vehicle.HasGravity());
  }

  private changeGender() {
    const gender =
      mp.game.GetPlayer().GetGender() === 'Male'
        ? EPlayerGender.Female
        : EPlayerGender.Male;

    this.playerService.changeGender(gender);
  }

  private openDoor() {
    const targetingSystem = mp.game.ScriptGameInstance.GetTargetingSystem();

    const lookAtObject = targetingSystem.GetLookAtObject(
      mp.game.GetPlayerObject(),
    );

    if (!lookAtObject) {
      return;
    }

    if (lookAtObject.IsA('FakeDoor')) {
      mp.despawnLocalObject(lookAtObject.GetEntityID().hash);

      // this.chatService.sendMessage(
      //   'You are looking at a FAKE door. It cannot be opened.',
      // );
      return;
    }

    if (lookAtObject.IsA('Door')) {
      (lookAtObject as unknown as Door).OpenDoor();
      return;
    }

    this.chatService.sendMessage('This is not a door.');
  }

  @postConstruct()
  private init() {
    this.chatService.addCommand({
      name: 'clear',
      description: 'Clears chat',
      handler: this.clear.bind(this),
    });

    this.chatService.addCommand({
      name: 'appearance',
      flags: ChatCommandFlag.DisableInGameMode,
      description: 'Opens appearance menu',
      handler: () => this.appearanceMenuService.open(),
    });

    this.chatService.addCommand({
      name: 'pos',
      description: 'Prints you current position',
      handler: this.pos.bind(this),
    });
    this.chatService.addCommand({
      name: 'cpos',
      description:
        'Prints your current position in the world and copies to clipboard',
      handler: this.cpos.bind(this),
    });

    this.chatService.addCommand({
      name: 'vboost',
      flags: ChatCommandFlag.Admin | ChatCommandFlag.DisableInGameMode,
      args: z.tuple([
        z.coerce
          .number()
          .meta({ title: 'strength', optional: true })
          .default(40)
          .optional(),
      ]),
      description: 'Boosts your vehicle forward',
      handler: this.vehicleBoost.bind(this),
    });
    this.chatService.addCommand({
      name: 'vstop',
      flags: ChatCommandFlag.Admin | ChatCommandFlag.DisableInGameMode,
      description: 'Stop vehicle velocity',
      handler: this.vehicleStop.bind(this),
    });

    this.chatService.addCommand({
      name: 'vgrav',
      flags: ChatCommandFlag.Admin | ChatCommandFlag.DisableInGameMode,

      description: 'Toggle gravity on your current vehicle',
      handler: this.vehicleGravity.bind(this),
    });

    this.chatService.addCommand({
      name: 'fixweapons',
      flags: ChatCommandFlag.DisableInGameMode,
      description: 'Tries to fix your weapons in case you cant shoot',
      handler: this.fixWeapons.bind(this),
    });

    this.chatService.addCommand({
      name: 'levelup',
      description: 'Levels up...',
      handler: () =>
        retry({ times: 3, delay: 250 }, () => this.playerService.levelUp()),
    });

    this.chatService.addCommand({
      name: 'hide-game-hud',
      description: 'Hides game HUD',
      handler: this.hideGameHud.bind(this),
    });

    this.chatService.addCommand({
      name: 'show-game-hud',
      description: 'Shows game HUD',
      handler: this.showGameHud.bind(this),
    });

    this.chatService.addCommand({
      name: 'change-gender',
      description: 'Changes your gender',
      flags: ChatCommandFlag.DisableInGameMode,
      handler: this.changeGender.bind(this),
    });

    this.chatService.addCommand({
      name: 'open-door',
      description: 'Opens the door you are looking at',
      flags: ChatCommandFlag.DisableInGameMode,
      handler: this.openDoor.bind(this),
    });
  }
}
