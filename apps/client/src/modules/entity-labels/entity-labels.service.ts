import type { entEntity } from '@cybermp/client-types/game';
import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct, preDestroy } from 'inversify';
import { world3dToScreen2d } from '../../lib/math';
import { mp } from '../../mp';
import {
  type EntityLabel,
  type EntityLabelFactory,
  EntityLabelFactorySymbol,
} from './entity-label';

@eager()
@injectable()
export class EntityLabelsService {
  private labels = new Set<EntityLabel>();
  private updateTick!: number;

  constructor(
    @inject(EntityLabelFactorySymbol)
    private entityLabelFactory: EntityLabelFactory,
  ) {}

  @postConstruct()
  private init() {
    mp.game.onGameLoaded(() => {
      this.updateTick = mp.setTick(() => this.onTick());
    });
  }

  @preDestroy()
  private destroyAll() {
    mp.clearTick(this.updateTick);

    for (const label of this.labels.values()) {
      label.destroy();
    }

    this.labels.clear();
  }

  create(entity: entEntity, text: string, fontSize?: number) {
    const newLabel = this.entityLabelFactory();
    newLabel.create(entity, text, fontSize);

    this.labels.add(newLabel);

    return newLabel;
  }

  destroy(label: EntityLabel) {
    label.destroy();
    this.labels.delete(label);
  }

  private onTick() {
    const playerPos = mp.game.GetPlayer().GetWorldPosition();

    for (const label of this.labels) {
      const labelPos = label.getPosition();
      const dist = mp.game.Vector4.Distance(playerPos, labelPos);

      const labelMaxDist = label.getMaxDistance();

      if (dist < labelMaxDist) {
        const t = Math.min(dist / labelMaxDist, 1);
        const scale = 1.0 - t * 0.4;
        const alpha = 1.0 - t * 0.8;

        const screenPos = world3dToScreen2d({
          x: labelPos.x,
          y: labelPos.y,
          z: labelPos.z,
        });

        label.update(screenPos, scale, alpha);
      } else {
        label.hide();
      }
    }
  }
}
