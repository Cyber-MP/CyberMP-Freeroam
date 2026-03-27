import { eager } from '@freeroam/inversify';
import { injectable, postConstruct, preDestroy } from 'inversify';
import { world3dToScreen2d } from '../../lib/vectors';
import { mp } from '../../mp';
import type { EntityLabel } from './entity-label';

@eager()
@injectable()
export class EntityLabelsService {
  private labels = new Set<EntityLabel>();
  private updateTick!: number;

  @postConstruct()
  private init() {
    this.updateTick = mp.setTick(() => this.onTick());
  }

  @preDestroy()
  private destroyAll() {
    mp.clearTick(this.updateTick);

    for (const l of this.labels.values()) {
      l.destroy();
    }
    this.labels.clear();
  }

  public add(label: EntityLabel) {
    this.labels.add(label);
  }

  public remove(label: EntityLabel) {
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
