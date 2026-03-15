import type { gameCameraComponent } from '@cybermp/client-types/game';
import { eager } from '@freeroam/inversify';
import { injectable, postConstruct } from 'inversify';
import { createVector4 } from '../../lib/vectors';
import { mp } from '../../mp';

@eager()
@injectable()
export class GCameraService {
  @postConstruct()
  private init() {}

  create() {
    // const cameraSpec = new mp.game.DynamicEntitySpec();
    // cameraSpec.templatePath = ;

    // const gamePosition = mp.game.GetPlayer().GetWorldPosition();
    // gamePosition.z += 1.5;
    // gamePosition.y += 1.5;

    // cameraSpec.position = gamePosition;

    // // cameraSpec.position = this.GetPosition(5.0, 45.0);
    // // cameraSpec.orientation = this.GetOrientation(225.0);
    // cameraSpec.persistState = true;
    // cameraSpec.persistSpawn = true;
    // cameraSpec.tags = ['camera'];

    // const entityId = this.system.CreateEntity(cameraSpec);

    const spawnTransform = mp.game.GetPlayer().GetWorldTransform();

    const heading = mp.game.GetPlayer().GetWorldForward();
    const playerPos = mp.game.GetPlayer().GetWorldPosition();
    const { x, y, z, w } = createVector4(
      playerPos.x + heading.x,
      playerPos.y + heading.y,
      playerPos.z + 1.5,
      playerPos.w,
    );

    Object.assign(spawnTransform.Position, { x, y, z });

    const entityId = mp.game.exEntitySpawner.Spawn(
      'base\\entities\\cameras\\simple_free_camera.ent',
      spawnTransform,
      '',
    );

    console.log('entity created');

    const entity = mp.game.ScriptGameInstance.FindEntityByID(entityId);
    if (!entity) {
      console.log('entity dont exist');
      return;
    }

    const component = entity.FindComponentByName(
      'camera',
    ) as gameCameraComponent;
    component.SetFOV(60);
    component.SetZoom(1);

    component.Activate(0, false);
    console.log('activated camera');
  }
}
