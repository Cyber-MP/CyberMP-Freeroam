import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import z from 'zod';
import { ChatService } from '../chat/chat.service';
import {
  NITRO_PRESET_NAMES,
  type NitroPresetName,
  VehicleNitroPresetRepository,
} from './vehicle-nitro-preset.repository';

@eager()
@injectable()
export class VehicleNitroCommands {
  constructor(
    @inject(VehicleNitroPresetRepository)
    private presetRepo: VehicleNitroPresetRepository,
    @inject(ChatService) private chat: ChatService,
  ) {}

  private nitroForce(force: number) {
    this.presetRepo.applyPreset({ force });
  }

  private nitroCheckGround(checkIsOnGround: boolean) {
    this.presetRepo.applyPreset({ checkIsOnGround });
  }

  private nitroMaxSpeed(maxSpeed: number) {
    this.presetRepo.applyPreset({ maxSpeed });
  }

  private nitroByUse(capacityByUse: number) {
    this.presetRepo.applyPreset({ capacityByUse });
  }

  private nitroRegen(capacityRegenRate: number) {
    this.presetRepo.applyPreset({ capacityRegenRate });
  }

  private nitroPreset(presetName: NitroPresetName) {
    this.presetRepo.applyPreset(presetName);
  }

  @postConstruct()
  private init() {
    this.chat.addCommand({
      name: 'nitro-force',
      description: 'Sets nitro force (10 is too much)',
      args: z.tuple([z.coerce.number().meta({ title: 'force' }).min(0)]),
      can: ['update', 'VehicleNitro'],
      handler: this.nitroForce.bind(this),
    });

    this.chat.addCommand({
      name: 'nitro-check-ground',
      description: 'Use nitro in air, fly to the moon',
      args: z.tuple([z.stringbool().meta({ title: 'check-ground' })]),
      can: ['update', 'VehicleNitro'],
      handler: this.nitroCheckGround.bind(this),
    });

    this.chat.addCommand({
      name: 'nitro-maxspeed',
      description: 'Sets nitro max speed',
      args: z.tuple([z.coerce.number().meta({ title: 'max speed' }).min(0)]),
      can: ['update', 'VehicleNitro'],
      handler: this.nitroMaxSpeed.bind(this),
    });

    this.chat.addCommand({
      name: 'nitro-by-use',
      description:
        'Sets how much nitro is used per boost (set to 0 for free boost)',
      args: z.tuple([
        z.coerce.number().meta({ title: 'nitro by use' }).min(0).max(100),
      ]),
      can: ['update', 'VehicleNitro'],
      handler: this.nitroByUse.bind(this),
    });

    this.chat.addCommand({
      name: 'nitro-regen',
      description: 'Sets nitro regen rate',
      args: z.tuple([
        z.coerce.number().meta({ title: 'regen rate' }).min(0).max(100),
      ]),
      can: ['update', 'VehicleNitro'],
      handler: this.nitroRegen.bind(this),
    });

    this.chat.addCommand({
      name: 'nitro-preset',
      description: `Load nitro preset "${NITRO_PRESET_NAMES.join('", "')}"`,
      args: z.tuple([
        z.enum(NITRO_PRESET_NAMES).meta({
          title: 'preset',
        }),
      ]),
      can: ['use', 'VehicleNitro'],
      handler: this.nitroPreset.bind(this),
    });
  }
}
