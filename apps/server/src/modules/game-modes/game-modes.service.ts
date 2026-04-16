import type { TGameModeName } from '@freeroam/shared/game-modes';
import { injectable } from 'inversify';
import z from 'zod';
import type { zGameModesCreateSchemas } from './dto/game-modes-schemas.dto';
import { GameModes } from './modes';

@injectable()
export class GameModesService {
  getJoinSchema(modeName: TGameModeName, createOptions: any) {
    const GameModeClass = GameModes.find((m) => new m().name === modeName);
    if (!GameModeClass) throw new Error(`Game mode ${modeName} not found`);

    const instance = new GameModeClass();

    const dynamicZodSchema = instance.getJoinSchema(createOptions);

    return dynamicZodSchema.toJSONSchema({ target: 'draft-07' });
  }

  getCreateSchemas() {
    const result: z.infer<typeof zGameModesCreateSchemas> = {} as any;

    for (const GameMode of GameModes) {
      const instance = new GameMode();

      result[instance.name] = z.toJSONSchema(instance.CREATE_OPTIONS_SCHEMA, {
        target: 'draft-07',
      });
    }

    return result;
  }
}
