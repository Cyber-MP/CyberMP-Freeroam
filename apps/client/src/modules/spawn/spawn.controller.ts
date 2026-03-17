import { RpcApplyType, type RpcClientContext } from '@cybermp/rpc-client';
import { contract, type InferRouterInputs } from '@cybermp/rpc-router/server';
import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import { isEmpty } from 'radash';
import z from 'zod';
import { mp } from '../../mp';
import { r } from '../../rpc';
import { SpawnService } from './spawn.service';

const zVector4 = z.tuple([z.number(), z.number(), z.number(), z.number()]);

const zSpawnInput = z
  .object({
    position: zVector4.optional(),
    health: z.number().optional(),
  })
  .optional();

export const spawnContract = {
  spawnOnBase: contract.input(zSpawnInput).build(),
  spawnOnLocation: contract.input(z.number().optional()).build(),
  getSpawnPosition: contract
    .method(RpcApplyType.REGISTER)
    .output(zVector4)
    .build(),
};

type ContractInputs = InferRouterInputs<typeof spawnContract>;

@eager()
@injectable()
export class SpawnController {
  constructor(@inject(SpawnService) private spawnService: SpawnService) {}

  spawn(c: RpcClientContext<ContractInputs['spawnOnBase']>) {
    this.spawnService.spawn({
      ...c.data,
      position: c.data?.position ?? this.spawnService.getSpawnPosition(),
    });
  }

  spawnOnCurrentPosition(
    c: RpcClientContext<ContractInputs['spawnOnLocation']>,
  ) {
    this.spawnService.spawn({
      health: isEmpty(c.data) || !c.data ? undefined : c.data,
      position: mp.game.GetPlayer().GetWorldPosition(),
    });
  }

  getSpawnPosition() {
    return this.spawnService.getSpawnPosition();
  }

  @postConstruct()
  private init() {
    r.implement<typeof spawnContract>(spawnContract, {
      spawnOnBase: this.spawn.bind(this),
      getSpawnPosition: this.getSpawnPosition.bind(this),
      spawnOnLocation: this.spawnOnCurrentPosition.bind(this),
    });
  }
}
