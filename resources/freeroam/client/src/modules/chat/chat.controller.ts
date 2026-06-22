import { RpcApplyType, type RpcClientContext } from '@cybermp/rpc-client';
import type { InferRouterInputs } from '@cybermp/rpc-router/server';
import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import z from 'zod';
import { r } from '../../rpc';
import { ChatService } from './chat.service';
import { zChatCommandMetaDTO } from './dto/chat-command-meta';
import { zExecuteCommandDTO } from './dto/execute-command';

export const chatContract = {
  executeCommand: r.contract.input(zExecuteCommandDTO).build(),
  getCommandsMeta: r.contract
    .method(RpcApplyType.REGISTER)
    .output(z.array(zChatCommandMetaDTO))
    .build(),
};

type ContractInputs = InferRouterInputs<typeof chatContract>;

@eager()
@injectable()
export class ChatController {
  constructor(@inject(ChatService) private chatService: ChatService) {}

  private executeCommand(
    c: RpcClientContext<ContractInputs['executeCommand']>,
  ) {
    this.chatService.executeCommand(c.data);
  }

  private getCommandsMeta() {
    return this.chatService.getCommandsMeta();
  }

  @postConstruct()
  private init() {
    r.implement<typeof chatContract>(chatContract, {
      executeCommand: this.executeCommand.bind(this),
      getCommandsMeta: this.getCommandsMeta.bind(this),
    });
  }
}
