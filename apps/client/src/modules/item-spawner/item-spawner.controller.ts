import type { RpcClientContext } from '@cybermp/rpc-client';
import type { InferRouterInputs } from '@cybermp/rpc-router/server';
import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import z from 'zod';
import { r } from '../../rpc';
import { ITEM_SPAWNER_KEYS, ItemSpawnerService } from './item-spawner.service';

const zItemSpawnerKey = z.enum(ITEM_SPAWNER_KEYS);

export const itemSpawnerContract = {
  spawnItem: r.contract
    .validate({ input: true })
    .input(zItemSpawnerKey)
    .build(),
};

type ContractInputs = InferRouterInputs<typeof itemSpawnerContract>;

@eager()
@injectable()
export class ItemSpawnerController {
  constructor(
    @inject(ItemSpawnerService) private itemSpawnerService: ItemSpawnerService,
  ) {}

  private spawnItem(c: RpcClientContext<ContractInputs['spawnItem']>) {
    this.itemSpawnerService.spawnItem(c.data);
  }

  @postConstruct()
  private init() {
    r.implement(itemSpawnerContract, {
      spawnItem: this.spawnItem.bind(this),
    });
  }
}
