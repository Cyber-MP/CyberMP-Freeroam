import type { Rotation, Vector3 } from '@cybermp/server-types';
import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import { LoggerService } from '../../../logger/logger.service';
import { type RaceLapsMap, type RaceLapsMapName, zRaceLapsMap } from './data';
import { RaceLapsMaps } from './maps';

export interface PathTransform {
  position: Vector3;
  rotation: Rotation;
}

@eager()
@injectable()
export class RaceLapsTrackCalculator {
  private registry = new Map<RaceLapsMapName, PathTransform[]>();

  constructor(@inject(LoggerService) private logger: LoggerService) {
    this.logger.setContext('RaceLapsTrackCalculator');
  }

  @postConstruct()
  private init() {
    for (const map of RaceLapsMaps) {
      const parsedMap = zRaceLapsMap.safeParse(map);
      if (!parsedMap.success) {
        this.logger.error(
          `map "${map.name}" has an invalid schema -`,
          parsedMap.error.message,
        );
        continue;
      }

      this.registry.set(map.name, this.generateTrackPath(map as RaceLapsMap));
      this.logger.success(`Generated track path for "${map.name}" map`);
    }
  }

  getTrackPath(mapName: RaceLapsMapName): PathTransform[] | undefined {
    return this.registry.get(mapName);
  }

  private generateTrackPath(
    map: RaceLapsMap,
    stepDistance: number = 2.0,
  ): PathTransform[] {
    const path: PathTransform[] = [];

    // 1. Combine Start Point and Checkpoints into a single sequence of nodes
    // We'll use the first start point as the origin
    const nodes = [...map.nodes.filter((o) => o.type !== 'start-point')];

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
        const position: Vector3 = [
          startPos[0] + dx * t,
          startPos[1] + dy * t,
          startPos[2] + dz * t,
        ];

        // Interpolate Rotation (Yaw)
        // We use lerpAngle to ensure we rotate the shortest way around the circle
        const rotation: Rotation = [
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

  /**
   * Smoothly interpolates between two angles in degrees,
   * ensuring it takes the shortest path (e.g., 350 to 10 goes through 0).
   */
  private lerpAngle(start: number, end: number, t: number): number {
    const delta = ((end - start + 540) % 360) - 180;
    return start + delta * t;
  }
}
