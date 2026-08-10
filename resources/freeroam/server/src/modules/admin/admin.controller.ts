import type { MpPlayer } from '@cybermp/server-types';
import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import z from 'zod';
import { mp } from '../../mp';
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

  private kick(initiator: MpPlayer, playerId: number) {
    if (!this.adminService.isAdmin(initiator)) {
      return this.chatService.sendMessage(initiator, 'You are not an admin');
    }

    const candidate = mp.players.at(playerId);
    if (!candidate) {
      return this.chatService.sendMessage(initiator, 'Player not found');
    }

    if (this.adminService.isAdmin(candidate)) {
      return this.chatService.sendMessage(
        initiator,
        "U Can't kick other admins",
      );
    }

    this.adminService.kick(candidate);
  }

  private ban(initiator: MpPlayer, playerId: number) {
    if (!this.adminService.isAdmin(initiator)) {
      return this.chatService.sendMessage(initiator, 'You are not an admin');
    }

    const candidate = mp.players.at(playerId);
    if (!candidate) {
      return this.chatService.sendMessage(initiator, 'Player not found');
    }

    if (this.adminService.isAdmin(candidate)) {
      return this.chatService.sendMessage(
        initiator,
        "U Can't ban other admins",
      );
    }

    this.adminService.ban(candidate);
  }

  @postConstruct()
  private init() {
    this.chatService.addCommand({
      name: 'admin',
      description: 'Become admin...',
      args: z.tuple([z.string().meta({ title: 'password' })]),
      handler: this.admin.bind(this),
    });

    this.chatService.addCommand({
      name: 'kick',
      can: ['use', 'KickPlayers'],
      args: z.tuple([z.coerce.number().meta({ title: 'player-id' })]),
      handler: this.kick.bind(this),
    });

    this.chatService.addCommand({
      name: 'ban',
      can: ['use', 'BanPlayers'],
      args: z.tuple([z.coerce.number().meta({ title: 'player-id' })]),
      handler: this.ban.bind(this),
    });
  }
}
