import type { Rotation, Vector3 } from '@cybermp/server-types';
import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct } from 'inversify';
import { LoggerService } from '../../../logger/logger.service';
import {
  type RaceLapsMap,
  type RaceLapsMapName,
  RaceLapsMaps,
  zRaceLapsMap,
} from './data';

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
    for (const [name, map] of Object.entries(RaceLapsMaps)) {
      const parsedMap = zRaceLapsMap.safeParse(map);
      if (!parsedMap.success) {
        this.logger.error(
          `map "${name}" has an invalid schema -`,
          parsedMap.error.message,
        );
        continue;
      }

      this.registry.set(
        name as RaceLapsMapName,
        this.generateTrackPath(map as RaceLapsMap),
      );
      this.logger.success(`Generated track path for "${name}" map`);
    }
  }

  getTrackPath(mapName: RaceLapsMapName): PathTransform[] | undefined {
    return this.registry.get(mapName);
  }

  private generateTrackPath(
    map: RaceLapsMap,
    stepDistance: number = 2.0,
  ): PathTransform[] {
    const transforms: PathTransform[] = [];
    if (map.checkpoints.length === 0) return transforms;

    const rawPoints: Vector3[] = [];
    const segmentDirections: string[] = [];

    let previousPos = map.startPoints[0].position;
    let previousYaw = this.getAngleBetween(
      previousPos,
      map.checkpoints[0].position,
    );

    // 1. Generate High-Res Path with Metadata
    for (const cp of map.checkpoints) {
      const segment = this.calculateBezierSegment(
        previousPos,
        previousYaw,
        cp.position,
        cp.yaw ?? 0,
        30,
      );

      rawPoints.push(...segment);
      // Map the checkpoint's direction to every point in this segment
      for (let i = 0; i <= 30; i++) {
        segmentDirections.push(cp.direction!);
      }

      previousPos = cp.position;
      previousYaw = cp.yaw ?? 0;
    }

    // 2. Walk the path and calculate 3D Rotations
    let lastSpawnPos = rawPoints[0];

    for (let i = 1; i < rawPoints.length; i++) {
      const currentPos = rawPoints[i];
      const dist = this.getDistance(lastSpawnPos, currentPos);

      if (dist >= stepDistance) {
        // YAW (Z) - Horizontal facing
        const yaw = this.getAngleBetween(lastSpawnPos, currentPos);

        // PITCH (X) - Climbing/Descending
        const verticalDist = currentPos[2] - lastSpawnPos[2];
        const horizontalDist = Math.sqrt(
          (currentPos[0] - lastSpawnPos[0]) ** 2 +
            (currentPos[1] - lastSpawnPos[1]) ** 2,
        );
        const pitch =
          Math.atan2(verticalDist, horizontalDist) * (180 / Math.PI);

        // ROLL (Y) - Leaning into the turn
        let roll = 0;
        const dir = segmentDirections[i];
        if (dir === 'left') roll = -15;
        else if (dir === 'right') roll = 15;

        transforms.push({
          position: currentPos,
          rotation: [pitch, roll, yaw],
        });

        lastSpawnPos = currentPos;
      }
    }

    return transforms;
  }

  private calculateBezierSegment(
    p0: Vector3,
    yaw0: number,
    p3: Vector3,
    yaw3: number,
    segments: number,
  ): Vector3[] {
    const points: Vector3[] = [];
    const strength = this.getDistance(p0, p3) * 0.35;

    const p1 = this.getForwardPoint(p0, yaw0, strength);
    const p2 = this.getForwardPoint(p3, yaw3, -strength);

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const invT = 1 - t;
      const b = (idx: number) =>
        invT ** 3 * p0[idx] +
        3 * invT ** 2 * t * p1[idx] +
        3 * invT * t ** 2 * p2[idx] +
        t ** 3 * p3[idx];

      points.push([b(0), b(1), b(2)]);
    }
    return points;
  }

  private getForwardPoint(
    pos: Vector3,
    yaw: number,
    distance: number,
  ): Vector3 {
    const rad = (yaw * Math.PI) / 180;
    return [
      pos[0] + Math.sin(rad) * distance,
      pos[1] + Math.cos(rad) * distance,
      pos[2],
    ];
  }

  private getDistance(a: Vector3, b: Vector3): number {
    return Math.sqrt(
      (b[0] - a[0]) ** 2 + (b[1] - a[1]) ** 2 + (b[2] - a[2]) ** 2,
    );
  }

  private getAngleBetween(a: Vector3, b: Vector3): number {
    const angle = Math.atan2(b[0] - a[0], b[1] - a[1]) * (180 / Math.PI);
    return (angle + 360) % 360;
  }
}
