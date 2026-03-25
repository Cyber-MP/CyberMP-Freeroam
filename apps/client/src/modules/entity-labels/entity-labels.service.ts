import { eager } from '@freeroam/inversify';
import { injectable, postConstruct } from 'inversify';
import { throttle } from 'radash';
import { world3dToScreen2d } from '../../lib/vectors';
import { mp } from '../../mp';
import type { EntityLabel } from './entity-label';

const throttleLog = throttle({ interval: 4000 }, (...ags: any) => {
  console.log(...ags);
});

@eager()
@injectable()
export class EntityLabelsService {
  private labels = new Set<EntityLabel>();

  @postConstruct()
  private init() {
    mp.setTick(() => this.onTick());
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
        throttleLog('RENDERING', labelPos, dist);

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
        throttleLog('SKIIPING DIST');
        label.hide();
      }
    }
  }
}
