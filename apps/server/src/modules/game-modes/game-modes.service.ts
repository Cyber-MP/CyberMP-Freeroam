import { injectable } from 'inversify';
import z from 'zod';
import type { zGameModesSchemas } from './dto/game-modes-schemas.dto';
import { GameModes } from './modes';

@injectable()
export class GameModesService {
  getSchemas() {
    const result: z.infer<typeof zGameModesSchemas> = {} as any;

    for (const GameMode of GameModes) {
      const instance = new GameMode();

      result[instance.name] = {
        createSchema: z.toJSONSchema(instance.CREATE_OPTIONS_SCHEMA, {
          target: 'draft-07',
        }),
        joinSchema: z.toJSONSchema(instance.JOIN_OPTIONS_SCHEMA, {
          target: 'draft-07',
        }),
      };
    }

    return result;
  }
}
