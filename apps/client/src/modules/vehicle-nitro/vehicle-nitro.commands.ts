import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import z from 'zod';
import { ChatCommandFlag, ChatService } from '../chat/chat.service';
import { NitroPresetNames } from './vehicle-nitro.presets';
import { VehicleNitroService } from './vehicle-nitro.service';

@eager()
@injectable()
export class VehicleNitroCommands {
  constructor(
    @inject(VehicleNitroService)
    private vehicleNitroService: VehicleNitroService,
    @inject(ChatService) private chat: ChatService,
  ) {}

  private nitroForce(force: number) {
    this.vehicleNitroService.currentPreset.force = force;
  }

  private nitroCheckGround(checkGround: boolean) {
    this.vehicleNitroService.currentPreset.checkIsOnGround = checkGround;
  }

  private nitroMaxSpeed(maxSpeed: number) {
    this.vehicleNitroService.currentPreset.maxSpeed = maxSpeed;
  }

  private nitroByUse(byUse: number) {
    this.vehicleNitroService.currentPreset.capacityByUse = byUse;
  }

  private nitroRegen(regen: number) {
    this.vehicleNitroService.currentPreset.capacityRegenRate = regen;
  }

  private nitroPreset(presetName: (typeof NitroPresetNames)[number]) {
    this.vehicleNitroService.applyPreset(presetName);
  }

  @postConstruct()
  private init() {
    this.chat.addCommand({
      name: 'nitro-force',
      description: 'Sets nitro force (10 is too much)',
      args: z.tuple([z.coerce.number().meta({ title: 'force' }).min(0)]),
      flags: ChatCommandFlag.Admin,
      handler: this.nitroForce.bind(this),
    });

    this.chat.addCommand({
      name: 'nitro-check-ground',
      description: 'Use nitro in air, fly to the moon',
      args: z.tuple([z.stringbool().meta({ title: 'check-ground' })]),
      flags: ChatCommandFlag.Admin,
      handler: this.nitroCheckGround.bind(this),
    });

    this.chat.addCommand({
      name: 'nitro-maxspeed',
      description: 'Sets nitro max speed',
      args: z.tuple([z.coerce.number().meta({ title: 'max speed' }).min(0)]),
      flags: ChatCommandFlag.Admin,
      handler: this.nitroMaxSpeed.bind(this),
    });

    this.chat.addCommand({
      name: 'nitro-by-use',
      description:
        'Sets how much nitro is used per boost (set to 0 for free boost)',
      args: z.tuple([
        z.coerce.number().meta({ title: 'nitro by use' }).min(0).max(100),
      ]),
      flags: ChatCommandFlag.Admin,
      handler: this.nitroByUse.bind(this),
    });

    this.chat.addCommand({
      name: 'nitro-regen',
      description: 'Sets nitro regen rate',
      args: z.tuple([
        z.coerce.number().meta({ title: 'regen rate' }).min(0).max(100),
      ]),
      flags: ChatCommandFlag.Admin,
      handler: this.nitroRegen.bind(this),
    });

    this.chat.addCommand({
      name: 'nitro-preset',
      description: `Load nitro preset "${NitroPresetNames.join('", "')}"`,
      args: z.tuple([
        z.enum(NitroPresetNames).meta({
          title: 'preset',
        }),
      ]),
      flags: ChatCommandFlag.DisableInGameMode,
      handler: this.nitroPreset.bind(this),
    });
  }
}
