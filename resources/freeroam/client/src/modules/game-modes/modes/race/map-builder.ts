import type { ServerVector3 } from '@cybermp/client-types';
import type {
  gameFxInstance,
  gameFxResource,
} from '@cybermp/client-types/game';
import { eager } from '@freeroam/inversify';
import type {
  RaceCheckpointNode,
  RaceMap,
  RaceMapNode,
  RaceTrackPath,
} from '@freeroam/shared/game-modes/race';
import { inject, injectable, postConstruct } from 'inversify';
import z from 'zod';
import { createEulerAngles, createVector4 } from '../../../../lib/vectors';
import { mp } from '../../../../mp';
import { browser } from '../../../../rpc/browser';
import { ChatService } from '../../../chat/chat.service';
import type { EntityLabel } from '../../../entity-labels/entity-label';
import { EntityLabelsService } from '../../../entity-labels/entity-labels.service';
import { GEntityService } from '../../../game/entity.service';
import { GObjectsService } from '../../../game/objects.service';

class TrackPathNavigation {
  private trackData: RaceTrackPath = [];
  private activeFx = new Map<number, gameFxInstance>();

  private spawnEffect(index: number, path: RaceTrackPath[number]) {
    const [x, y, z] = path.position;
    const [roll, pitch, yaw] = path.rotation;

    const transform = new mp.game.WorldTransform();
    mp.game.WorldTransform.SetPosition(transform, createVector4(x, y, z, 1));
    mp.game.WorldTransform.SetOrientationEuler(
      transform,
      createEulerAngles(roll, pitch, yaw),
    );

    const instance = mp.game.ScriptGameInstance.GetFxSystem().SpawnEffect(
      Object.assign(new mp.game.gameFxResource(), {
        effect:
          'user\\jackhumbert\\effects\\world_navigation_yellow.effect' as any,
      } satisfies gameFxResource),
      transform,
    );

    this.activeFx.set(index, instance);
  }

  private despawnEffect(index: number) {
    const instance = this.activeFx.get(index);
    if (instance) {
      instance.Kill();
      this.activeFx.delete(index);
    }
  }

  create(trackPath: RaceTrackPath) {
    this.trackData = trackPath;

    // Spawn every point in the path immediately
    this.trackData.forEach((path, index) => {
      this.spawnEffect(index, path);
    });
  }

  destroy() {
    // Clean up all active instances
    for (const index of this.activeFx.keys()) {
      this.despawnEffect(index);
    }
    this.trackData = [];
  }
}

@eager()
@injectable()
export class RaceMapBuilder {
  private currentMap: RaceMap = { name: 'New Race' as any, nodes: [] };
  private navigation = new TrackPathNavigation();

  private entityLabels = new Set<EntityLabel>();

  private readonly OBJECTS_GROUP = 'race-map-builder';

  constructor(
    @inject(ChatService) private chatService: ChatService,
    @inject(GEntityService) private entityService: GEntityService,
    @inject(GObjectsService) private objectsService: GObjectsService,
    @inject(EntityLabelsService)
    private entityLabelsService: EntityLabelsService,
  ) {}

  @postConstruct()
  private init() {
    if (!import.meta.env.DEV) {
      return;
    }

    // Initialize a new map
    this.chatService.addCommand({
      name: 'rl_new',
      description: 'Start a new race map',
      args: z.tuple([z.string().meta({ title: 'name' })]),
      handler: (name) => {
        this.currentMap = { name: name as any, nodes: [] };
        this.navigation.destroy();
        this.destroyEntityLabels();
        this.objectsService.destroyGroup(this.OBJECTS_GROUP);
        this.chatService.sendMessage(`Started building map: ${name}`);
      },
    });

    // Add Start Point
    this.chatService.addCommand({
      name: 'rl_start',
      description: 'Set the start point at current position',
      handler: () => {
        const node = this.getCurrentNode('start-point');
        this.addNode(node);
        this.chatService.sendMessage('Start point set!');
      },
    });

    // Add Path Point (Simple navigation marker)
    this.chatService.addCommand({
      name: 'rl_path',
      description: 'Add a path point for navigation',
      handler: () => {
        const node = this.getCurrentNode('path-point');
        this.addNode(node);
        this.chatService.sendMessage(
          `Path point #${this.currentMap.nodes.length} added`,
        );
      },
    });

    this.chatService.addCommand({
      name: 'rl_undo',
      description: 'Remove last node',
      handler: () => {
        this.currentMap.nodes.pop();
        this.refresh();
        this.chatService.sendMessage('Builder: Last node removed');
      },
    });

    // Add Checkpoint
    this.chatService.addCommand({
      name: 'rl_checkpoint',
      description: 'Add a checkpoint (args: radius, direction)',
      args: z.tuple([
        z.coerce.number().default(5).meta({ title: 'radius' }),
        z
          .enum(['forward', 'left', 'right'])
          .meta({ title: 'direction' })
          .default('forward'),
      ]),
      handler: (radius, direction) => {
        const node: RaceCheckpointNode = {
          ...this.getCurrentNode('checkpoint'),
          radius: radius || 5,
          direction: direction || 'forward',
        };
        this.addNode(node);
        this.chatService.sendMessage(
          `Checkpoint added (Radius: ${radius || 5}, Dir: ${direction || 'forward'})`,
        );
      },
    });

    // Export/Save to Console
    this.chatService.addCommand({
      name: 'rl_save',
      description: 'Print the map JSON to console',
      handler: () => {
        browser.copyToClipboard.trigger(JSON.stringify(this.currentMap));

        console.log('--- RACE MAP EXPORT ---');
        console.log(JSON.stringify(this.currentMap));
        console.log('-----------------------');
        this.chatService.sendMessage(
          'Map data is printed to console and *copied to your clipboard*.',
        );
      },
    });
  }

  private destroyEntityLabels() {
    for (const label of this.entityLabels.values()) {
      this.entityLabelsService.destroy(label);
    }
    this.entityLabels.clear();
  }

  private getCurrentNode(type: RaceMapNode['type']): any {
    const pos = mp.game.GetPlayer().GetWorldPosition();
    const yaw = mp.game.GetPlayer().GetWorldYaw();

    return {
      type,
      position: [pos.x, pos.y, pos.z],
      yaw,
    };
  }

  private addNode(node: RaceMapNode) {
    this.currentMap.nodes.push(node);
    this.refresh();
  }

  private refresh() {
    this.objectsService.destroyGroup(this.OBJECTS_GROUP);
    this.destroyEntityLabels();

    this.generateCheckpoints();
    this.generateStartPoints();

    const trackPath: RaceTrackPath = this.generateTrackPath(
      this.currentMap.nodes,
    );

    this.navigation.destroy();
    this.navigation.create(trackPath);
  }

  private async generateStartPoints() {
    const startPoints = this.currentMap.nodes.filter(
      (o) => o.type === 'start-point',
    );

    const startPointHash = 7454566152498118096n;

    for (let i = 0; i < startPoints.length; i++) {
      const startPoint = startPoints[i];

      const objId = this.objectsService.create({
        skinHash: startPointHash,
        appHash: 0,
        position: startPoint.position,
        rotation: {
          pitch: 0,
          yaw: startPoint.yaw ?? 1,
          roll: 0,
        },
        group: this.OBJECTS_GROUP,
        streaming: false,
      });
      const entity = await this.entityService.waitForEntityToSpawn(objId);
      if (!entity) continue;

      this.entityLabels.add(
        this.entityLabelsService.create(entity, `Start point #${i + 1}`, 22),
      );
    }
  }

  private async generateCheckpoints() {
    const checkpoints = this.currentMap.nodes.filter(
      (o) => o.type === 'checkpoint',
    );

    const checkpointHash = mp.game.redResourceReferenceScriptToken.GetHash(
      'base\\gameplay\\devices\\street_signs\\race_checkpoint\\race_checkpoint.ent',
    );

    for (let i = 0; i < checkpoints.length; i++) {
      const checkpoint = checkpoints[i];

      const objId = this.objectsService.create({
        skinHash: checkpointHash,
        appHash: 0,
        position: checkpoint.position,
        rotation: {
          pitch: 0,
          yaw: checkpoint.yaw ?? 1,
          roll: 0,
        },
        group: this.OBJECTS_GROUP,
        streaming: false,
      });
      const entity = await this.entityService.waitForEntityToSpawn(objId);
      if (!entity) continue;

      this.entityLabels.add(
        this.entityLabelsService.create(entity, `Checkpoint #${i + 1}`, 22),
      );
    }
  }

  private generateTrackPath(
    mapNodes: RaceMapNode[],
    stepDistance: number = 2.0,
  ): RaceTrackPath {
    const path: RaceTrackPath = [];

    // 1. Combine Start Point and Checkpoints into a single sequence of nodes
    // We'll use the first start point as the origin
    const nodes = [...mapNodes.filter((o) => o.type !== 'start-point')];

    if (nodes.length < 2) return path;

    for (let i = 0; i < nodes.length - 1; i++) {
      const startNode = nodes[i];
      const endNode = nodes[i + 1];

      const startPos = startNode.position;
      const endPos = endNode.position;

      // Calculate distance between these two points
      const dx = endPos[0] - startPos[0];
      const dy = endPos[1] - startPos[1];
      const dz = endPos[2] - startPos[2];
      const segmentDistance = Math.sqrt(dx * dx + dy * dy + dz * dz);

      // Determine how many steps fit in this segment
      const steps = Math.max(1, Math.floor(segmentDistance / stepDistance));

      for (let j = 0; j < steps; j++) {
        const t = j / steps;

        // Interpolate Position
        const position: ServerVector3 = [
          startPos[0] + dx * t,
          startPos[1] + dy * t,
          startPos[2] + dz * t,
        ];

        if (startNode.yaw !== undefined && endNode.yaw !== undefined) {
          // Interpolate Rotation (Yaw)
          // We use lerpAngle to ensure we rotate the shortest way around the circle
          const rotation: [number, number, number] = [
            0, // Pitch: could be calculated based on dz/segmentDistance if needed
            0, // Roll
            this.lerpAngle(startNode.yaw, endNode.yaw, t),
          ];

          path.push({ position, rotation });
        }
      }
    }

    // Add the final checkpoint position to close the path
    const lastNode = nodes[nodes.length - 1];

    if (lastNode.yaw !== undefined) {
      path.push({
        position: lastNode.position,
        rotation: [0, 0, lastNode.yaw],
      });
    }

    return path;
  }

  private lerpAngle(start: number, end: number, t: number): number {
    const delta = ((end - start + 540) % 360) - 180;
    return start + delta * t;
  }
}
