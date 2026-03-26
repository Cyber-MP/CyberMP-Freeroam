import type { ServerVector3 } from '@cybermp/client-types';
import type {
  gameFxInstance,
  gameFxResource,
} from '@cybermp/client-types/game';
import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import z from 'zod';
import { createEulerAngles, createVector4 } from '../../../../lib/vectors';
import { mp } from '../../../../mp';
import { ChatService } from '../../../chat/chat.service';
import { GEntityService } from '../../../game/entity.service';
import type {
  RaceLapsCheckpointNode,
  RaceLapsMap,
  RaceLapsMapNode,
  RaceLapsTrackPath,
} from './dto';

class TrackPathNavigation {
  private trackData: RaceLapsTrackPath = [];
  private activeFx = new Map<number, gameFxInstance>();
  private updateTick!: number;

  private updateFxInstances() {
    const playerPos = mp.game.GetPlayer().GetWorldPosition();
    const SPAWN_DISTANCE = 100;

    this.trackData.forEach((path, index) => {
      const [x, y, z] = path.position;
      const effectPos = createVector4(x, y, z, 1);
      const distance = mp.game.Vector4.Distance(effectPos, playerPos);
      const isSpawned = this.activeFx.has(index);

      if (distance <= SPAWN_DISTANCE) {
        if (!isSpawned) {
          this.spawnEffect(index, path);
        }
      } else if (isSpawned) {
        this.despawnEffect(index);
      }
    });
  }

  private spawnEffect(index: number, path: RaceLapsTrackPath[number]) {
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

  create(trackPath: RaceLapsTrackPath) {
    this.trackData = trackPath;
    this.updateTick = mp.setTick(this.updateFxInstances.bind(this));
  }

  destroy() {
    for (const index of this.activeFx.keys()) {
      this.despawnEffect(index);
    }
    this.trackData = [];
    mp.clearTick(this.updateTick);
  }
}

@eager()
@injectable()
export class RaceLapsMapBuilder {
  private currentMap: RaceLapsMap = { name: 'New Race', nodes: [] };
  private navigation = new TrackPathNavigation();

  private objects = new Set<number>();

  constructor(
    @inject(ChatService) private chatService: ChatService,
    @inject(GEntityService) private entityService: GEntityService,
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
        this.currentMap = { name, nodes: [] };
        this.navigation.destroy();
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
        // z.enum(['forward', 'left', 'right']).default('forward'),
      ]),
      handler: (radius) => {
        const node: RaceLapsCheckpointNode = {
          ...this.getCurrentNode('checkpoint'),
          radius,
          direction: 'forward',
        };
        this.addNode(node);
        this.chatService.sendMessage(
          `Checkpoint added (Radius: ${radius}, Dir: ${'forward'})`,
        );
      },
    });

    // Export/Save to Console
    this.chatService.addCommand({
      name: 'rl_save',
      description: 'Print the map JSON to console',
      handler: () => {
        console.log('--- RACE MAP EXPORT ---');
        console.log(JSON.stringify(this.currentMap, null, 2));
        console.log('-----------------------');
        this.chatService.sendMessage('Map data printed to console.');
      },
    });
  }

  private getCurrentNode(type: RaceLapsMapNode['type']): any {
    const pos = mp.game.GetPlayer().GetWorldPosition();
    const yaw = mp.game.GetPlayer().GetWorldYaw();

    return {
      type,
      position: [pos.x, pos.y, pos.z],
      yaw,
    };
  }

  private addNode(node: RaceLapsMapNode) {
    this.currentMap.nodes.push(node);
    this.refresh();
  }

  private refresh() {
    this.generateCheckpoints();

    const trackPath: RaceLapsTrackPath = this.generateTrackPath(
      this.currentMap.nodes,
    );

    this.navigation.destroy();
    this.navigation.create(trackPath);
  }

  private generateCheckpoints() {
    for (const objId of this.objects.values()) {
      mp.despawnLocalObject(objId);
    }
    this.objects.clear();

    const checkpoints = this.currentMap.nodes.filter(
      (o) => o.type === 'checkpoint',
    );

    const checkpointHash = mp.game.redResourceReferenceScriptToken.GetHash(
      'base\\gameplay\\devices\\street_signs\\race_checkpoint\\race_checkpoint.ent',
    );

    for (const checkpoint of checkpoints) {
      this.objects.add(
        mp.spawnLocalObject(
          checkpointHash,
          0,
          ...checkpoint.position,
          0,
          0,
          checkpoint.yaw ?? 1,
          false,
        ),
      );
    }
  }

  private generateTrackPath(
    mapNodes: RaceLapsMapNode[],
    stepDistance: number = 2.0,
  ): RaceLapsTrackPath {
    const path: RaceLapsTrackPath = [];

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

        // Interpolate Rotation (Yaw)
        // We use lerpAngle to ensure we rotate the shortest way around the circle
        const rotation: [number, number, number] = [
          0, // Pitch: could be calculated based on dz/segmentDistance if needed
          0, // Roll
          this.lerpAngle(startNode.yaw!, endNode.yaw!, t),
        ];

        path.push({ position, rotation });
      }
    }

    // Add the final checkpoint position to close the path
    const lastNode = nodes[nodes.length - 1];
    path.push({
      position: lastNode.position,
      rotation: [0, 0, lastNode.yaw!],
    });

    return path;
  }

  // Simple Euclidean distance helper
  private getDistance(a: ServerVector3, b: ServerVector3): number {
    return Math.sqrt(
      (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2,
    );
  }

  private lerpAngle(start: number, end: number, t: number): number {
    const delta = ((end - start + 540) % 360) - 180;
    return start + delta * t;
  }
}
