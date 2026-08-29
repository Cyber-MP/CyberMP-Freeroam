import { contract } from '@cybermp/rpc-router/server';
import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import { r } from '../../rpc';
import { GreenZonesService } from './greenzones.service';

export const greenZonesContract = {
  enter: contract.build(),
  leave: contract.build(),
};

@eager()
@injectable()
export class GreenZonesController {
  constructor(
    @inject(GreenZonesService) private greenZonesService: GreenZonesService,
  ) {}

  @postConstruct()
  private init() {
    r.implement(greenZonesContract, {
      enter: () => this.greenZonesService.enter(),
      leave: () => this.greenZonesService.leave(),
    });
  }
}
