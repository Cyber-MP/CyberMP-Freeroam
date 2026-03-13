import { RpcApplyType, type RpcClientContext } from '@cybermp/rpc-client';
import { contract, type InferRouterInputs } from '@cybermp/rpc-router/server';
import { eager } from '@freeroam/inversify';
import { injectable, postConstruct } from 'inversify';
import z from 'zod';
import { mp } from '../../mp';
import { r } from '../../rpc';

const zSetFocusInput = z.union([
  z.boolean(),
  z.tuple([z.boolean(), z.boolean()]),
]);

export const cefContract = {
  setFocus: contract.input(zSetFocusInput).build(),
  isInFocus: contract.method(RpcApplyType.REGISTER).output(z.boolean()).build(),
};

type ContractInputs = InferRouterInputs<typeof cefContract>;

@eager()
@injectable()
export class CefController {
  @postConstruct()
  private init() {
    r.implement<typeof cefContract>(cefContract, {
      isInFocus: this.isInFocus.bind(this),
      setFocus: this.setFocus.bind(this),
    });
  }

  private isInFocus() {
    return mp.cef.isInFocus();
  }

  private setFocus(context: RpcClientContext<ContractInputs['setFocus']>) {
    const { data } = context;

    if (Array.isArray(data)) {
      mp.cef.setFocus(...data);
    } else {
      mp.cef.setFocus(data, data);
    }
  }
}
