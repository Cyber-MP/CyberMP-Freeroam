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
import { GTeleportService } from '../game/teleport/teleport.service';
import { ChatService } from './chat.service';

@eager()
@injectable()
export class BasicChatCommands {
  constructor(
    @inject(ChatService) private chatService: ChatService,
    @inject(GStatusEffectsService) private statusEffects: GStatusEffectsService,
    @inject(GPlayerService) private playerService: GPlayerService,
    @inject(GHudService) private hudService: GHudService,
    @inject(GTeleportService) private teleportService: GTeleportService,
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

  private openDoor(force: string = '') {
    const targetingSystem = mp.game.ScriptGameInstance.GetTargetingSystem();

    const lookAtObject = targetingSystem.GetLookAtObject(
      mp.game.GetPlayerObject(),
    );

    if (!lookAtObject) {
      this.chatService.sendMessage('This is not a game object');
      return;
    }

    if (lookAtObject.IsA('FakeDoor')) {
      lookAtObject.Dispose();
      return;
    }

    if (lookAtObject.IsA('Door')) {
      const door = lookAtObject as unknown as Door;
      const ps = door.GetDevicePS();

      if (ps.IsSealed()) {
        ps.ToggleSealOnDoor();
      }

      if (!ps.IsLocked()) {
        ps.ToggleLockOnDoor();
      }

      door.OpenDoor();

      if (force) {
        door.Dispose();
      }

      return;
    }

    this.chatService.sendMessage('This is not a door');
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
      can: ['update', 'PlayerAppearance'],
      description: 'Opens appearance menu',
      handler: async () => {
        try {
          await this.appearanceMenuService.open();
        } catch {
          await this.teleportService.teleportAsync(
            -1382.1414794921875,
            1276.2388916015625,
            123.16490173339844,
            84.79995727539062,
          );

          this.chatService.sendMessage(
            "Oops! Some of our shit broke, appearance command don't work if u reconnected, or its just our shit code",
          );
        }
      },
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
      can: ['use', 'VehicleBoost'],
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
      can: ['use', 'VehicleBoost'],
      description: 'Stop vehicle velocity',
      handler: this.vehicleStop.bind(this),
    });

    this.chatService.addCommand({
      name: 'vgrav',
      can: ['use', 'VehicleBoost'],
      description: 'Toggle gravity on your current vehicle',
      handler: this.vehicleGravity.bind(this),
    });

    this.chatService.addCommand({
      name: 'fixweapons',
      can: ['use', 'FixWeaponsCommand'],
      description: 'Tries to fix your weapons in case you cant shoot',
      handler: this.fixWeapons.bind(this),
    });

    this.chatService.addCommand({
      name: 'levelup',
      description: 'Levels up...',
      can: ['use', 'LevelUpCommand'],
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
      can: ['update', 'PlayerAppearance'],
      handler: this.changeGender.bind(this),
    });

    this.chatService.addCommand({
      name: 'open-door',
      description:
        'Opens the door you are looking at (force deletes if not openable)',
      args: z.tuple([
        z
          .string()
          .meta({ title: 'force', optional: true })
          .optional()
          .default('true'),
      ]),
      can: ['use', 'OpenDoorCommand'],
      handler: this.openDoor.bind(this),
    });
  }
}
