import { eager } from '@freeroam/inversify';
import { injectable } from 'inversify';
import z from 'zod';
import { r } from '../../rpc';
import { zCreateMatchDTO } from './dto/create-match.dto';
import { zJoinMatchDTO } from './dto/join-match.dto';
import { zMatchDTO } from './dto/match.dto';

export const matchmakingContract = {
  create: r.contract.input(zCreateMatchDTO).build(),
  join: r.contract.input(zJoinMatchDTO).build(),
  leave: r.contract.build(),
  getAll: r.contract.input(z.array(zMatchDTO)).build(),
};

@eager()
@injectable()
export class MatchmakingController {}
