import { useEffect, useMemo } from 'react';
import { BoxGeometry, BufferAttribute, BufferGeometry, CatmullRomCurve3, Color, Matrix4, Quaternion, Vector3 } from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { TowerParameters } from '../types/tower';
import { applyEasingCurve } from '../utils/easing';
import { cubicBezierY, lerp, biasLerp } from '../utils/math';
import { createPolygonBaseGeometry } from '../utils/polygon';

const upAxis = new Vector3(0, 1, 0);
const scratchMatrix = new Matrix4();
const scratchDirection = new Vector3();
const scratchMidpoint = new Vector3();
const scratchQuaternion = new Quaternion();
const scratchScale = new Vector3();
const scratchVector = new Vector3();
const scratchSegmentStart = new Vector3();
const scratchSegmentEnd = new Vector3();
const scratchSegmentPoint = new Vector3();
const scratchOriginalPoint = new Vector3();
const scratchPlaneDirection = new Vector3();
const scratchPlaneNormal = new Vector3();
const scratchLocalPlaneNormal = new Vector3();
const scratchDeltaVector = new Vector3();
const scratchClampStart = new Vector3();
const scratchClampEnd = new Vector3();
const scratchClampDirection = new Vector3();
const scratchInfluencePoint = new Vector3();
const bottomColor = new Color();
const topColor = new Color();
const segmentColor = new Color();

type FacadeGeometryResult = {
  rails: BufferGeometry | null;
  tweens: BufferGeometry | null;
  floorLoops: BufferGeometry | null;
};

export const useFacadeGeometry = (params: TowerParameters): FacadeGeometryResult => {
  const result = useMemo<FacadeGeometryResult>(() => {
    const { floorCount } = params;
    if (floorCount < 2) {
      return { rails: null, tweens: null, floorLoops: null };
    }

    const segmentCount = Math.max(3, Math.floor(params.floorSegments));
    const towerOffset = -(floorCount * params.floorHeight) * 0.5;
    const baseGeometry = new BoxGeometry(1, 1, 1);
    const { corners: baseCorners } = createPolygonBaseGeometry(segmentCount);
    const railGeometries: BufferGeometry[] = [];
    const tweenPositions: number[] = [];
    const loopPositions: number[] = [];
    const profileSize = Math.min(0.2, Math.max(0.1, params.facadeProfile ?? 0.1));
    const tweenCount = Math.max(1, Math.floor(params.facadeTweenCount ?? 1));
    const loopCount = Math.max(1, Math.floor(params.facadeTween2Count ?? 1));

    const pinchSettings = params.pinchSpread ?? {
      enabled: false,
      radius: 0,
      strength: 0,
      attractors: [],
    };
    const pinchAttractors =
      pinchSettings.attractors?.map((attractor) => new Vector3(attractor.x, attractor.y, attractor.z)) ?? [];
    const pinchActive =
      pinchSettings.enabled &&
      Math.abs(pinchSettings.strength ?? 0) > 1e-3 &&
      (pinchSettings.radius ?? 0) > 0 &&
      pinchAttractors.length > 0;
    const pinchRadius = Math.max(0, pinchSettings.radius ?? 0);
    const pinchStrength = pinchSettings.strength ?? 0;
    const baseTweenSamples = pinchActive ? 12 : 1;
    const baseLoopSamples = pinchActive ? 6 : 1;

    const applyPinchSpread = (vector: Vector3) => {
      if (!pinchActive) {
        return;
      }
      for (const attractor of pinchAttractors) {
        scratchDirection.copy(vector).sub(attractor);
        const distance = scratchDirection.length();
        if (distance > pinchRadius || distance < 1e-4) {
          continue;
        }
        scratchDirection.normalize();
        const falloff = 1 - distance / pinchRadius;
        const magnitude = Math.abs(pinchStrength) * falloff * falloff * (pinchRadius * 0.3);
        const directionSign = pinchStrength >= 0 ? 1 : -1;
        vector.addScaledVector(scratchDirection, magnitude * directionSign);
      }
    };

    bottomColor.set(params.gradientColors.bottom);
    topColor.set(params.gradientColors.top);

    const ringPoints: Array<Array<[number, number, number]>> = Array.from({ length: floorCount }, () => []);
    const floorColors: Color[] = [];
    const segmentPlaneNormals: Vector3[] = Array.from({ length: segmentCount }, () => new Vector3());
    const floorYPositions: number[] = [];

    for (let floorIndex = 0; floorIndex < floorCount; floorIndex += 1) {
      const normalized = floorCount === 1 ? 0 : floorIndex / (floorCount - 1);
      const biasedColorPosition = biasLerp(params.gradientBias, normalized);
      const scaleEase = applyEasingCurve(normalized, params.easing.scale);
      const twistEase = applyEasingCurve(normalized, params.easing.twist);
      const scaleT = params.scaleBezier.enabled
        ? cubicBezierY(normalized, params.scaleBezier.handles[0], params.scaleBezier.handles[1])
        : scaleEase;

      const radius = params.baseRadius * lerp(params.minScale, params.maxScale, scaleT);
      const twistRadians = (Math.PI / 180) * lerp(params.minTwist, params.maxTwist, twistEase);
      const y = towerOffset + floorIndex * params.floorHeight + params.floorHeight * 0.5;

      segmentColor.lerpColors(bottomColor, topColor, biasedColorPosition);

      floorColors[floorIndex] = segmentColor.clone();
      if (!floorYPositions[floorIndex]) {
        floorYPositions[floorIndex] = y;
      }

      scratchQuaternion.setFromAxisAngle(upAxis, twistRadians);

      for (let segmentIndex = 0; segmentIndex < segmentCount; segmentIndex += 1) {
        scratchVector.copy(baseCorners[segmentIndex]).multiplyScalar(radius).applyQuaternion(scratchQuaternion);
        ringPoints[floorIndex][segmentIndex] = [scratchVector.x, y, scratchVector.z];
      }
    }

    const appendSegment = (start: [number, number, number], end: [number, number, number], color: Color) => {
      scratchDirection.set(end[0] - start[0], end[1] - start[1], end[2] - start[2]);
      const length = scratchDirection.length();
      if (length <= 1e-5) {
        return;
      }
      scratchDirection.normalize();
      scratchMidpoint.set((start[0] + end[0]) * 0.5, (start[1] + end[1]) * 0.5, (start[2] + end[2]) * 0.5);
      scratchQuaternion.setFromUnitVectors(upAxis, scratchDirection);
      scratchScale.set(profileSize, length, profileSize);
      scratchMatrix.compose(scratchMidpoint, scratchQuaternion, scratchScale);

      const segmentGeometry = baseGeometry.clone();
      segmentGeometry.applyMatrix4(scratchMatrix);

      const vertexCount = segmentGeometry.attributes.position.count;
      const colors = new Float32Array(vertexCount * 3);
      for (let vertexIndex = 0; vertexIndex < vertexCount; vertexIndex += 1) {
        const offset = vertexIndex * 3;
        colors[offset] = color.r;
        colors[offset + 1] = color.g;
        colors[offset + 2] = color.b;
      }
      segmentGeometry.setAttribute('color', new BufferAttribute(colors, 3));
      railGeometries.push(segmentGeometry);
    };

    const appendRailSegments = (points: [number, number, number][]) => {
      let previous: [number, number, number] | null = null;
      for (let floorIndex = 0; floorIndex < points.length; floorIndex += 1) {
        const current = points[floorIndex];
        if (previous) {
          appendSegment(previous, current, floorColors[floorIndex]);
        }
        previous = current;
      }
    };

    const computeAttractorInfluence = (point: Vector3) => {
      if (!pinchActive) {
        return 0;
      }
      let influence = 0;
      for (const attractor of pinchAttractors) {
        const distance = point.distanceTo(attractor);
        if (distance > pinchRadius || distance < 1e-4) {
          continue;
        }
        const falloff = 1 - distance / pinchRadius;
        influence = Math.max(influence, falloff * falloff);
        if (influence >= 0.95) {
          break;
        }
      }
      return influence;
    };

    const pushSegmentWithSamples = (
      start: [number, number, number],
      end: [number, number, number],
      baseSamples: number,
      target: number[],
      planeNormal?: Vector3 | null,
      clampSegmentIndex?: number,
    ) => {
      scratchSegmentStart.set(start[0], start[1], start[2]);
      scratchSegmentEnd.set(end[0], end[1], end[2]);
      scratchLocalPlaneNormal.set(0, 0, 0);
      if (planeNormal) {
        scratchLocalPlaneNormal.copy(planeNormal);
      }
      let subdivisions = Math.max(1, Math.floor(baseSamples));
      if (pinchActive) {
        const startInfluence = computeAttractorInfluence(scratchSegmentStart);
        const endInfluence = computeAttractorInfluence(scratchSegmentEnd);
        const influence = Math.max(startInfluence, endInfluence);
        const adaptiveSamples = baseSamples * (1 + influence * 8);
        subdivisions = Math.min(40, Math.max(1, Math.floor(adaptiveSamples)));
      }
      const hasPlaneConstraint = scratchLocalPlaneNormal.lengthSq() > 1e-6;
      const applySample = (t: number) => {
        scratchOriginalPoint.copy(scratchSegmentStart).lerp(scratchSegmentEnd, t);
        scratchSegmentPoint.copy(scratchOriginalPoint);
        applyPinchSpread(scratchSegmentPoint);
        if (hasPlaneConstraint) {
          scratchDeltaVector.copy(scratchSegmentPoint).sub(scratchOriginalPoint);
          const projection = scratchDeltaVector.dot(scratchLocalPlaneNormal);
          scratchSegmentPoint.addScaledVector(scratchLocalPlaneNormal, -projection);
        }
        if (pinchActive && typeof clampSegmentIndex === 'number' && clampSegmentIndex >= 0) {
          clampPointWithinFacadePlane(clampSegmentIndex, scratchSegmentPoint.y, scratchSegmentPoint);
        }
        target.push(scratchSegmentPoint.x, scratchSegmentPoint.y, scratchSegmentPoint.z);
      };
      for (let step = 0; step < subdivisions; step += 1) {
        const t0 = step / subdivisions;
        const t1 = (step + 1) / subdivisions;
        applySample(t0);
        applySample(t1);
      }
    };

    const getBoundaryPointsAtY = (segmentIndex: number, y: number, startTarget: Vector3, endTarget: Vector3) => {
      const nextIndex = (segmentIndex + 1) % segmentCount;
      const clampedY = Math.min(Math.max(y, floorYPositions[0]), floorYPositions[floorCount - 1]);
      if (floorCount === 1) {
        startTarget.set(...ringPoints[0][segmentIndex]);
        endTarget.set(...ringPoints[0][nextIndex]);
        return;
      }
      let lowerIndex = 0;
      for (let i = 0; i < floorCount - 1; i += 1) {
        const y0 = floorYPositions[i];
        const y1 = floorYPositions[i + 1];
        if (clampedY >= y0 && clampedY <= y1) {
          lowerIndex = i;
          break;
        }
        if (clampedY > y1) {
          lowerIndex = i + 1;
        }
      }
      const upperIndex = Math.min(lowerIndex + 1, floorCount - 1);
      const startLower = ringPoints[lowerIndex][segmentIndex];
      const startUpper = ringPoints[upperIndex][segmentIndex];
      const endLower = ringPoints[lowerIndex][nextIndex];
      const endUpper = ringPoints[upperIndex][nextIndex];
      const y0 = floorYPositions[lowerIndex];
      const y1 = floorYPositions[upperIndex];
      const denom = Math.max(1e-6, y1 - y0);
      const t = Math.min(Math.max((clampedY - y0) / denom, 0), 1);
      startTarget.set(
        startLower[0] + (startUpper[0] - startLower[0]) * t,
        clampedY,
        startLower[2] + (startUpper[2] - startLower[2]) * t,
      );
      endTarget.set(
        endLower[0] + (endUpper[0] - endLower[0]) * t,
        clampedY,
        endLower[2] + (endUpper[2] - endLower[2]) * t,
      );
    };

    const clampPointWithinFacadePlane = (segmentIndex: number, y: number, point: Vector3) => {
      getBoundaryPointsAtY(segmentIndex, y, scratchClampStart, scratchClampEnd);
      scratchClampDirection.copy(scratchClampEnd).sub(scratchClampStart);
      const length = scratchClampDirection.length();
      if (length <= 1e-6) {
        point.set(scratchClampStart.x, point.y, scratchClampStart.z);
        return;
      }
      scratchClampDirection.normalize();
      scratchDeltaVector.copy(point).sub(scratchClampStart);
      let distance = scratchDeltaVector.dot(scratchClampDirection);
      distance = Math.min(Math.max(distance, 0), length);
      point.set(
        scratchClampStart.x + scratchClampDirection.x * distance,
        point.y,
        scratchClampStart.z + scratchClampDirection.z * distance,
      );
    };

    const appendSplineLine = (
      points: [number, number, number][],
      target: number[],
      baseSamples: number,
      planeNormal?: Vector3 | null,
      segmentIndexClamp?: number,
      closed = false,
    ) => {
      if (points.length < 2) {
        return;
      }
      const vectorPoints = points.map(([x, y, z]) => new Vector3(x, y, z));
      let maxInfluence = 0;
      if (pinchActive) {
        for (const point of vectorPoints) {
          scratchInfluencePoint.copy(point);
          maxInfluence = Math.max(maxInfluence, computeAttractorInfluence(scratchInfluencePoint));
        }
      }
      const tension = 0.35;
      const curve = new CatmullRomCurve3(vectorPoints, closed, 'catmullrom', tension);
      const influenceMultiplier = pinchActive ? 1 + maxInfluence * 5 : 1;
      const detail = Math.min(400, Math.max(4, points.length * baseSamples * influenceMultiplier));
      const sampledPoints = curve.getPoints(detail);
      for (let index = 1; index < sampledPoints.length; index += 1) {
        const previous = sampledPoints[index - 1];
        const current = sampledPoints[index];
        pushSegmentWithSamples(
          [previous.x, previous.y, previous.z],
          [current.x, current.y, current.z],
          pinchActive ? Math.max(1, baseTweenSamples * 2) : 1,
          target,
          planeNormal,
          segmentIndexClamp,
        );
      }
    };

    const appendTweenLine = (segmentIndex: number, points: [number, number, number][], planeNormalVector?: Vector3 | null) => {
      if (pinchActive) {
        appendSplineLine(points, tweenPositions, baseTweenSamples * 4, planeNormalVector ?? null, segmentIndex, false);
        return;
      }
      for (let floorIndex = 1; floorIndex < points.length; floorIndex += 1) {
        const start = points[floorIndex - 1];
        const end = points[floorIndex];
        let planeNormalForSegment: Vector3 | undefined;
        scratchPlaneDirection.set(end[0] - start[0], 0, end[2] - start[2]);
        if (scratchPlaneDirection.lengthSq() > 1e-6) {
          scratchPlaneNormal.copy(scratchPlaneDirection).cross(upAxis);
          if (scratchPlaneNormal.lengthSq() > 1e-6) {
            scratchPlaneNormal.normalize();
            planeNormalForSegment = scratchPlaneNormal.clone();
          }
        }
        pushSegmentWithSamples(start, end, baseTweenSamples, tweenPositions, planeNormalForSegment, segmentIndex);
      }
    };

    for (let segmentIndex = 0; segmentIndex < segmentCount; segmentIndex += 1) {
      const nextIndex = (segmentIndex + 1) % segmentCount;
      const baseStart = ringPoints[0][segmentIndex];
      const baseEnd = ringPoints[0][nextIndex];
      scratchPlaneDirection.set(baseEnd[0] - baseStart[0], 0, baseEnd[2] - baseStart[2]);
      if (scratchPlaneDirection.lengthSq() > 1e-6) {
        scratchPlaneNormal.copy(scratchPlaneDirection).cross(upAxis);
        if (scratchPlaneNormal.lengthSq() > 1e-6) {
          segmentPlaneNormals[segmentIndex].copy(scratchPlaneNormal).normalize();
        }
      }
    }

    // Primary rails
    const applyTweenCurve = (value: number) =>
      params.facadeTweenCurve.enabled
        ? cubicBezierY(value, params.facadeTweenCurve.handles[0], params.facadeTweenCurve.handles[1])
        : value;
    const applyTween2Curve = (value: number) =>
      params.facadeTween2Curve?.enabled
        ? cubicBezierY(value, params.facadeTween2Curve.handles[0], params.facadeTween2Curve.handles[1])
        : value;

    for (let segmentIndex = 0; segmentIndex < segmentCount; segmentIndex += 1) {
      const railPoints = ringPoints.map((ring) => ring[segmentIndex]);
      appendRailSegments(railPoints);
    }

    // Tween rails
    for (let segmentIndex = 0; segmentIndex < segmentCount; segmentIndex += 1) {
      const nextIndex = (segmentIndex + 1) % segmentCount;
      const planeNormal = segmentPlaneNormals[segmentIndex];
      for (let tweenIndex = 1; tweenIndex <= tweenCount; tweenIndex += 1) {
        const baseFactor = tweenIndex / (tweenCount + 1);
        const factor = applyTweenCurve(baseFactor);
        const tweenPoints: [number, number, number][] = [];
        for (let floorIndex = 0; floorIndex < floorCount; floorIndex += 1) {
          const start = ringPoints[floorIndex][segmentIndex];
          const end = ringPoints[floorIndex][nextIndex];
          tweenPoints.push([
            start[0] + (end[0] - start[0]) * factor,
            start[1] + (end[1] - start[1]) * factor,
            start[2] + (end[2] - start[2]) * factor,
          ]);
        }
        appendTweenLine(segmentIndex, tweenPoints, planeNormal.lengthSq() > 1e-6 ? planeNormal : undefined);
      }
    }

    const appendLoop = (points: [number, number, number][]) => {
      for (let index = 0; index < points.length; index += 1) {
        const current = points[index];
        const next = points[(index + 1) % points.length];
        const planeNormal = pinchActive ? segmentPlaneNormals[index] : upAxis;
        const sampleCount = pinchActive ? baseLoopSamples * 4 : baseLoopSamples;
        pushSegmentWithSamples(
          current,
          next,
          sampleCount,
          loopPositions,
          planeNormal.lengthSq() > 1e-6 ? planeNormal : upAxis,
          pinchActive ? index : undefined,
        );
      }
    };

    for (let floorIndex = 0; floorIndex < floorCount - 1; floorIndex += 1) {
      const currentRing = ringPoints[floorIndex];
      const nextRing = ringPoints[floorIndex + 1];
      for (let loopIndex = 1; loopIndex <= loopCount; loopIndex += 1) {
        const factor = applyTween2Curve(loopIndex / (loopCount + 1));
        const loopPoints: [number, number, number][] = currentRing.map(([sx, sy, sz], segmentIndex) => {
          const [ex, ey, ez] = nextRing[segmentIndex];
          return [sx + (ex - sx) * factor, sy + (ey - sy) * factor, sz + (ez - sz) * factor];
        });
        appendLoop(loopPoints);
      }
    }

    baseGeometry.dispose();

    const rails = railGeometries.length > 0 ? mergeGeometries(railGeometries, false) ?? null : null;
    railGeometries.forEach((geometryInstance) => geometryInstance.dispose());

    const tweens =
      tweenPositions.length > 0
        ? new BufferGeometry().setAttribute('position', new BufferAttribute(new Float32Array(tweenPositions), 3))
        : null;

    const floorLoops =
      loopPositions.length > 0
        ? new BufferGeometry().setAttribute('position', new BufferAttribute(new Float32Array(loopPositions), 3))
        : null;

    return { rails, tweens, floorLoops };
  }, [params]);

  useEffect(
    () => () => {
      result.rails?.dispose();
      result.tweens?.dispose();
      result.floorLoops?.dispose();
    },
    [result],
  );

  return result;
};
