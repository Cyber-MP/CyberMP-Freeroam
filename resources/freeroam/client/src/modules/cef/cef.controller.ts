import type { RpcClientContext } from '@cybermp/rpc-client';
import { contract, type InferRouterInputs } from '@cybermp/rpc-router/server';
import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import z from 'zod';
import { r } from '../../rpc';
import { CefService } from './cef.service';
import { zSetFocusDTO } from './dto/set-focus-dto';

export const cefContract = {
  setFocus: contract.input(zSetFocusDTO).build(),
  setForceFocus: contract.input(z.boolean()).build(),
};

type ContractInputs = InferRouterInputs<typeof cefContract>;

@eager()
@injectable()
export class CefController {
  constructor(@inject(CefService) private cefService: CefService) {}

  private setFocus(context: RpcClientContext<ContractInputs['setFocus']>) {
    const { data } = context;

    if (Array.isArray(data)) {
      this.cefService.setFocus(...data);
    } else {
      this.cefService.setFocus(data, data);
    }
  }

  private setForceFocus(context: RpcClientContext<ContractInputs['setForceFocus']>) {
    const { data } = context;

    this.cefService.setForceFocus(data);
  }

  @postConstruct()
  private init() {
    r.implement<typeof cefContract>(cefContract, {
      setFocus: this.setFocus.bind(this),
      setForceFocus: this.setForceFocus.bind(this),
    });
  }
}
