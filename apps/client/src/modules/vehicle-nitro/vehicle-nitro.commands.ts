import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import z from 'zod';
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

  private nitroForce = (force: number) => {
    this.vehicleNitroService.force = force;
  };

  private nitroMaxSpeed = (maxSpeed: number) => {
    this.vehicleNitroService.maxSpeed = maxSpeed;
  };

  private nitroByUse = (byUse: number) => {
    this.vehicleNitroService.capacityByUse = byUse;
  };

  @postConstruct()
  private init() {
    this.chat.addCommand({
      name: 'nitro-force',
      description: 'Sets nitro force (10 is too much)',
      args: z.tuple([
        z.coerce.number().meta({ title: 'force' }).min(0).max(70),
      ]),
      handler: this.nitroForce.bind(this),
    });

    this.chat.addCommand({
      name: 'nitro-maxspeed',
      description: 'Sets nitro max speed',
      args: z.tuple([
        z.coerce
          .number()
          .meta({ title: 'max speed, 450 KM/PH is game limit' })
          .min(0)
          .max(450),
      ]),
      handler: this.nitroMaxSpeed.bind(this),
    });

    this.chat.addCommand({
      name: 'nitro-by-use',
      description:
        'Sets how much nitro is used per boost (set to 0 for free boost)',
      args: z.tuple([
        z.coerce.number().meta({ title: 'nitro by use' }).min(0).max(100),
      ]),
      handler: this.nitroByUse.bind(this),
    });
  }
}
