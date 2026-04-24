import { GameModeName, type TGameModeName } from '@freeroam/shared/game-modes';
import { inject, injectable } from 'inversify';
import z from 'zod';
import type { zGameModesCreateSchemas } from './dto/game-modes-schemas.dto';
import { type GameModeFactory, GameModeFactorySymbol } from './game-mode';

@injectable()
export class GameModesService {
  constructor(
    @inject(GameModeFactorySymbol)
    private gameModeFactory: GameModeFactory,
  ) {}

  getJoinSchema(modeName: TGameModeName, createOptions: any) {
    const instance = this.gameModeFactory(modeName);
    if (!instance) {
      throw new Error(`Game mode ${modeName} not found`);
    }

    const dynamicZodSchema = instance.getJoinSchema(createOptions);

    return dynamicZodSchema.toJSONSchema({ target: 'draft-07' });
  }

  getCreateSchemas() {
    const result: z.infer<typeof zGameModesCreateSchemas> = {} as any;

    for (const name of Object.values(GameModeName)) {
      const instance = this.gameModeFactory(name);

      result[instance.name] = z.toJSONSchema(instance.CREATE_OPTIONS_SCHEMA, {
        target: 'draft-07',
      });
    }

    return result;
  }
}
