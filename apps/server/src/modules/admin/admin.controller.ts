import type { MpPlayer } from '@cybermp/server-types';
import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import z from 'zod';
import { ChatService } from '../chat/chat.service';
import { AdminService } from './admin.service';

@eager()
@injectable()
export class AdminController {
  constructor(
    @inject(ChatService) private chatService: ChatService,
    @inject(AdminService) private adminService: AdminService,
  ) {}

  private admin(player: MpPlayer, password: string) {
    this.adminService.becomeAdmin(player, password);
  }

  @postConstruct()
  private init() {
    this.chatService.addCommand({
      name: 'admin',
      description: 'Become admin...',
      args: z.tuple([z.string().meta({ title: 'password :)' })]),
      handler: this.admin.bind(this),
    });
  }
}
