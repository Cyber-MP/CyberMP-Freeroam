import { eager } from '@freeroam/inversify';
import { inject, injectable } from 'inversify';
import { ChatService } from '../chat/chat.service';
import { VehicleNitroService } from './vehicle-nitro.service';

@eager()
@injectable()
export class VehicleNitroCommands {
  constructor(
    @inject(VehicleNitroService)
    private vehicleNitroService: VehicleNitroService,
    @inject(ChatService) private chat: ChatService,
  ) {}

  // private nitroForce(force: number) {
  //   this.vehicleNitroService.preset.force = force;
  // }

  // private nitroCheckGround(checkGround: boolean) {
  //   this.vehicleNitroService.preset.checkIsOnGround = checkGround;
  // }

  // private nitroMaxSpeed(maxSpeed: number) {
  //   this.vehicleNitroService.preset.maxSpeed = maxSpeed;
  // }

  // private nitroByUse(byUse: number) {
  //   this.vehicleNitroService.preset.capacityByUse = byUse;
  // }

  // private nitroRegen(regen: number) {
  //   this.vehicleNitroService.preset.capacityRegenRate = regen;
  // }

  // private nitroPreset(presetName: NitroPresetName) {
  //   this.vehicleNitroService.applyPreset(presetName);
  // }

  // @postConstruct()
  // private init() {
  //   this.chat.addCommand({
  //     name: 'nitro-force',
  //     description: 'Sets nitro force (10 is too much)',
  //     args: z.tuple([z.coerce.number().meta({ title: 'force' }).min(0)]),
  //     flags: ChatCommandFlag.Admin,
  //     handler: this.nitroForce.bind(this),
  //   });

  //   this.chat.addCommand({
  //     name: 'nitro-check-ground',
  //     description: 'Use nitro in air, fly to the moon',
  //     args: z.tuple([z.stringbool().meta({ title: 'check-ground' })]),
  //     flags: ChatCommandFlag.Admin,
  //     handler: this.nitroCheckGround.bind(this),
  //   });

  //   this.chat.addCommand({
  //     name: 'nitro-maxspeed',
  //     description: 'Sets nitro max speed',
  //     args: z.tuple([z.coerce.number().meta({ title: 'max speed' }).min(0)]),
  //     flags: ChatCommandFlag.Admin,
  //     handler: this.nitroMaxSpeed.bind(this),
  //   });

  //   this.chat.addCommand({
  //     name: 'nitro-by-use',
  //     description:
  //       'Sets how much nitro is used per boost (set to 0 for free boost)',
  //     args: z.tuple([
  //       z.coerce.number().meta({ title: 'nitro by use' }).min(0).max(100),
  //     ]),
  //     flags: ChatCommandFlag.Admin,
  //     handler: this.nitroByUse.bind(this),
  //   });

  //   this.chat.addCommand({
  //     name: 'nitro-regen',
  //     description: 'Sets nitro regen rate',
  //     args: z.tuple([
  //       z.coerce.number().meta({ title: 'regen rate' }).min(0).max(100),
  //     ]),
  //     flags: ChatCommandFlag.Admin,
  //     handler: this.nitroRegen.bind(this),
  //   });

  //   this.chat.addCommand({
  //     name: 'nitro-preset',
  //     description: `Load nitro preset "${NITRO_PRESET_NAMES.join('", "')}"`,
  //     args: z.tuple([
  //       z.enum(NITRO_PRESET_NAMES).meta({
  //         title: 'preset',
  //       }),
  //     ]),
  //     flags: ChatCommandFlag.DisableInGameMode,
  //     handler: this.nitroPreset.bind(this),
  //   });
  // }
}
