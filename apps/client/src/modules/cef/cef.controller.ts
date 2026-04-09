import { EInputAction } from '@cybermp/client-types/enums';
import { RpcApplyType, type RpcClientContext } from '@cybermp/rpc-client';
import { contract, type InferRouterInputs } from '@cybermp/rpc-router/server';
import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import z from 'zod';
import { mp } from '../../mp';
import { r } from '../../rpc';
import { browser } from '../../rpc/browser';
import { GKeyboardService } from '../game/keyboard.service';
import { zSetFocusDTO } from './dto/set-focus-dto';

export const cefContract = {
  setFocus: contract.input(zSetFocusDTO).build(),
  isInFocus: contract.method(RpcApplyType.REGISTER).output(z.boolean()).build(),
};

type ContractInputs = InferRouterInputs<typeof cefContract>;

@eager()
@injectable()
export class CefController {
  constructor(@inject(GKeyboardService) private keyboard: GKeyboardService) {}

  private toggleHudVisibility(action: EInputAction) {
    if (action === EInputAction.IACT_Release) {
      browser.hud.toggleVisibility.trigger();
    }
  }

  @postConstruct()
  private init() {
    r.implement<typeof cefContract>(cefContract, {
      isInFocus: this.isInFocus.bind(this),
      setFocus: this.setFocus.bind(this),
    });

    this.keyboard.bindKey(117, this.toggleHudVisibility.bind(this));
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
