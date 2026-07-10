export const ARROW_ANGLE = 90;
export const HOUSE_EDGE = 0.9;
export const MAX_UPGRADE_PROBABILITY = 80;
export const ROLL_MAX = 100_000;
export const OCTAGON_ROTATION = -22.5;

export interface RollResult {
  roll: number;
  winMax: number;
  won: boolean;
}

export interface WinningArc {
  start: number;
  end: number;
  span: number;
  probability: number;
}

export function normalizeAngle(angle: number): number {
  return ((angle % 360) + 360) % 360;
}

export function getWinningArc(probability: number): WinningArc {
  const p = Math.max(0, Math.min(probability, MAX_UPGRADE_PROBABILITY));
  const span = (p / 100) * 360;
  const start = normalizeAngle(ARROW_ANGLE - span / 2);
  const end = normalizeAngle(ARROW_ANGLE + span / 2);
  return { start, end, span, probability: p };
}

export function isAngleInWinZone(angle: number, arc: WinningArc): boolean {
  const a = normalizeAngle(angle);
  const { start, end, span } = arc;
  if (span <= 0) return false;
  if (span >= 360) return true;
  if (start <= end) return a >= start && a <= end;
  return a >= start || a <= end;
}

/** SVG angle from arrow rotation (0 = needle points to bottom). */
export function svgAngleFromArrowRotation(arrowRot: number): number {
  return normalizeAngle(ARROW_ANGLE + arrowRot);
}

export function arrowRotationFromSvg(svg: number): number {
  return normalizeAngle(svg - ARROW_ANGLE);
}

/** SVG angle the needle points to (0 = top / 12 o'clock). */
export function needleLandingAngle(arrowRot: number): number {
  return svgAngleFromArrowRotation(arrowRot);
}

export function isWinAtArrowAngle(arrowRot: number, probability: number): boolean {
  return isAngleInPerimeterWinZone(200, 200, 176, needleLandingAngle(arrowRot), probability);
}

export function needleGeometry(
  cx: number,
  cy: number,
  arrowRot: number,
  options?: { r?: number; innerR?: number; size?: number; depth?: number },
) {
  const outerR = options?.r ?? 176;
  const innerR = options?.innerR ?? 158;
  const size = options?.size ?? 10;
  const depth = options?.depth ?? 14;
  const landing = needleLandingAngle(arrowRot);
  const outerPerim = getOctagonPerimeter(cx, cy, outerR);
  const dist = perimeterDistanceForAngle(cx, cy, outerR, landing, outerPerim);
  const outerTarget = pointOnPerimeterAt(outerPerim, dist);
  const landingAng = angleAtPoint(cx, cy, outerTarget.x, outerTarget.y);
  const innerPerim = getOctagonPerimeter(cx, cy, innerR);
  const innerDist = perimeterDistanceForAngle(cx, cy, innerR, landingAng, innerPerim);
  const anchor = pointOnPerimeterAt(innerPerim, innerDist);
  const outward = angleAtPoint(cx, cy, anchor.x, anchor.y);
  const tip = polar(anchor.x, anchor.y, depth, outward);
  const baseL = polar(anchor.x, anchor.y, size, outward + 90);
  const baseR = polar(anchor.x, anchor.y, size, outward - 90);
  const trail = [7, 14].map((offset, i) => {
    const pt = pointOnPerimeterAt(innerPerim, innerDist - offset);
    const trailOutward = angleAtPoint(cx, cy, pt.x, pt.y);
    const trailSize = size * 0.62;
    const trailDepth = depth * 0.65;
    return {
      tip: polar(pt.x, pt.y, trailDepth, trailOutward),
      baseL: polar(pt.x, pt.y, trailSize, trailOutward + 90),
      baseR: polar(pt.x, pt.y, trailSize, trailOutward - 90),
      opacity: 0.32 - i * 0.12,
    };
  });
  return { landing, tip, baseL, baseR, target: outerTarget, outward, trail };
}

/** @deprecated Use needleGeometry */
export const needleBeamGeometry = needleGeometry;

export function pickLandingAngle(
  probability: number,
  shouldWin: boolean,
  cx = 200,
  cy = 200,
  r = 176,
): number {
  const perim = getOctagonPerimeter(cx, cy, r);
  const { winStart, winEnd, winLen } = perimeterWinRange(perim, probability);
  if (winLen <= 0) return ARROW_ANGLE;

  let dist: number;
  if (shouldWin) {
    const margin = Math.min(winLen * 0.06, perim.total * 0.015);
    const safe = Math.max(winLen - margin * 2, perim.total * 0.004);
    dist = winStart + margin + Math.random() * safe;
  } else {
    const losePool = perim.total - winLen;
    let picked = winEnd + Math.random() * losePool;
    if (picked >= perim.total) picked -= perim.total;
    dist = picked;
    if (isDistInPerimeterWinZone(dist, winStart, winEnd, perim.total)) {
      dist = normalizePerimeterDist(winStart - perim.total * 0.05, perim.total);
    }
  }

  const pt = pointOnPerimeterAt(perim, dist);
  return angleAtPoint(cx, cy, pt.x, pt.y);
}

function normalizePerimeterDist(dist: number, total: number) {
  return ((dist % total) + total) % total;
}

function isDistInPerimeterWinZone(dist: number, winStart: number, winEnd: number, total: number) {
  const d = normalizePerimeterDist(dist, total);
  const ws = normalizePerimeterDist(winStart, total);
  const we = normalizePerimeterDist(winEnd, total);
  if (ws <= we) return d >= ws && d <= we;
  return d >= ws || d <= we;
}

export function computeFinalArrowAngle(current: number, probability: number, shouldWin: boolean) {
  const landingSvg = pickLandingAngle(probability, shouldWin);
  const landingArrow = arrowRotationFromSvg(landingSvg);
  const spins = 4 + Math.floor(Math.random() * 5);
  let delta = landingArrow - normalizeAngle(current);
  if (delta <= 0) delta += 360;
  return { finalArrow: current + spins * 360 + delta, landingSvg, landingArrow, shouldWin };
}

/** Target must cost more than input — no downgrades (e.g. $1000 → $800). */
export function isValidUpgrade(input: number, target: number): boolean {
  return input > 0 && target > input;
}

/** Winning rolls are 0 … winMax on a 1–100,000 scale (43.4% → 0–43,400). */
export function winRollMax(probability: number): number {
  return Math.round((probability / 100) * ROLL_MAX);
}

export function resolveRoll(probability: number): RollResult {
  const winMax = winRollMax(probability);
  const roll = Math.floor(Math.random() * ROLL_MAX) + 1;
  return { roll, winMax, won: roll <= winMax };
}

export function resolveOutcome(probability: number): boolean {
  return resolveRoll(probability).won;
}

export function formatRoll(n: number) {
  return new Intl.NumberFormat('es-ES').format(n);
}

export function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export function arcSpan(startDeg: number, endDeg: number): number {
  let span = endDeg - startDeg;
  if (span <= 0) span += 360;
  return span;
}

export function octagonPoints(
  cx: number,
  cy: number,
  r: number,
  rotation = OCTAGON_ROTATION,
): string {
  return Array.from({ length: 8 }, (_, i) => {
    const p = polar(cx, cy, r, i * 45 + rotation);
    return `${p.x},${p.y}`;
  }).join(' ');
}

export function octagonVertices(
  cx: number,
  cy: number,
  r: number,
  rotation = OCTAGON_ROTATION,
) {
  return Array.from({ length: 8 }, (_, i) => polar(cx, cy, r, i * 45 + rotation));
}

export interface PerimeterDash {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export function angleAtPoint(cx: number, cy: number, x: number, y: number): number {
  return normalizeAngle((Math.atan2(y - cy, x - cx) * 180) / Math.PI);
}

export interface OctagonPerimeter {
  edges: Array<{
    ax: number;
    ay: number;
    bx: number;
    by: number;
    length: number;
    startDist: number;
    index: number;
  }>;
  total: number;
  topDist: number;
  bottomDist: number;
}

export function getOctagonPerimeter(
  cx: number,
  cy: number,
  r: number,
  rotation = OCTAGON_ROTATION,
): OctagonPerimeter {
  const verts = octagonVertices(cx, cy, r, rotation);
  let total = 0;
  const edges: OctagonPerimeter['edges'] = [];

  for (let i = 0; i < 8; i++) {
    const a = verts[i];
    const b = verts[(i + 1) % 8];
    const length = Math.hypot(b.x - a.x, b.y - a.y);
    edges.push({ ax: a.x, ay: a.y, bx: b.x, by: b.y, length, startDist: total, index: i });
    total += length;
  }

  let topEdge = edges[0];
  let bottomEdge = edges[0];
  let minY = Infinity;
  let maxY = -Infinity;
  for (const edge of edges) {
    const midY = (edge.ay + edge.by) / 2;
    if (midY < minY) {
      minY = midY;
      topEdge = edge;
    }
    if (midY > maxY) {
      maxY = midY;
      bottomEdge = edge;
    }
  }

  return {
    edges,
    total,
    topDist: topEdge.startDist + topEdge.length / 2,
    bottomDist: bottomEdge.startDist + bottomEdge.length / 2,
  };
}

export function pointOnPerimeterAt(perimeter: OctagonPerimeter, dist: number) {
  const d = ((dist % perimeter.total) + perimeter.total) % perimeter.total;
  for (const edge of perimeter.edges) {
    const edgeEnd = edge.startDist + edge.length;
    if (d <= edgeEnd + 1e-6) {
      const t = Math.max(0, (d - edge.startDist) / edge.length);
      return {
        x: edge.ax + (edge.bx - edge.ax) * t,
        y: edge.ay + (edge.by - edge.ay) * t,
      };
    }
  }
  const last = perimeter.edges[7];
  return { x: last.bx, y: last.by };
}

function raySegmentHit(
  ox: number,
  oy: number,
  dx: number,
  dy: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
): number | null {
  const sx = bx - ax;
  const sy = by - ay;
  const denom = dx * sy - dy * sx;
  if (Math.abs(denom) < 1e-9) return null;
  const t = ((ax - ox) * sy - (ay - oy) * sx) / denom;
  const u = ((ax - ox) * dy - (ay - oy) * dx) / denom;
  if (t > 1e-4 && u >= 0 && u <= 1) return t;
  return null;
}

export function perimeterDistanceForAngle(
  cx: number,
  cy: number,
  r: number,
  angle: number,
  perimeter?: OctagonPerimeter,
  rotation = OCTAGON_ROTATION,
): number {
  const perim = perimeter ?? getOctagonPerimeter(cx, cy, r, rotation);
  const rad = (angle * Math.PI) / 180;
  const dx = Math.cos(rad);
  const dy = Math.sin(rad);
  const verts = octagonVertices(cx, cy, r, rotation);
  let bestT = Infinity;
  let hit: { x: number; y: number } | null = null;

  for (let i = 0; i < 8; i++) {
    const a = verts[i];
    const b = verts[(i + 1) % 8];
    const t = raySegmentHit(cx, cy, dx, dy, a.x, a.y, b.x, b.y);
    if (t !== null && t < bestT) {
      bestT = t;
      hit = { x: cx + dx * t, y: cy + dy * t };
    }
  }

  if (!hit) return 0;

  for (const edge of perim.edges) {
    const ex = edge.bx - edge.ax;
    const ey = edge.by - edge.ay;
    const len2 = ex * ex + ey * ey;
    const u = len2 > 0 ? ((hit.x - edge.ax) * ex + (hit.y - edge.ay) * ey) / len2 : 0;
    if (u >= -0.02 && u <= 1.02) {
      const clamped = Math.max(0, Math.min(1, u));
      const dist = Math.hypot(hit.x - (edge.ax + ex * clamped), hit.y - (edge.ay + ey * clamped));
      if (dist < 2.5) return edge.startDist + clamped * edge.length;
    }
  }

  return perim.bottomDist;
}

export function isAngleInPerimeterWinZone(
  cx: number,
  cy: number,
  r: number,
  angle: number,
  probability: number,
): boolean {
  if (probability <= 0) return false;
  const perim = getOctagonPerimeter(cx, cy, r);
  const { winStart, winEnd, winLen } = perimeterWinRange(perim, probability);
  if (winLen >= perim.total) return true;
  const dist = perimeterDistanceForAngle(cx, cy, r, angle, perim);
  return dist >= winStart && dist <= winEnd;
}

function perimeterWinRange(perimeter: OctagonPerimeter, probability: number) {
  const winLen = (Math.max(0, Math.min(probability, 100)) / 100) * perimeter.total;
  const winStart = perimeter.bottomDist - winLen / 2;
  const winEnd = perimeter.bottomDist + winLen / 2;
  return { winStart, winEnd, winLen };
}

function perimeterEdgeOverlaps(
  edgeStart: number,
  edgeEnd: number,
  winStart: number,
  winEnd: number,
): Array<{ start: number; end: number }> {
  if (winEnd <= winStart) return [];
  const overlapStart = Math.max(winStart, edgeStart);
  const overlapEnd = Math.min(winEnd, edgeEnd);
  if (overlapEnd > overlapStart + 0.05) {
    return [{ start: overlapStart, end: overlapEnd }];
  }
  return [];
}

/** Win-zone spans along octagon perimeter (% of border length, centered on bottom flat edge). */
export function buildOctagonWinPerimeterSpans(
  cx: number,
  cy: number,
  r: number,
  probability: number,
  rotation = OCTAGON_ROTATION,
): PerimeterDash[] {
  if (probability <= 0) return [];
  const perimeter = getOctagonPerimeter(cx, cy, r, rotation);
  const { winStart, winEnd } = perimeterWinRange(perimeter, probability);
  const spans: PerimeterDash[] = [];

  for (const edge of perimeter.edges) {
    const edgeEnd = edge.startDist + edge.length;
    const overlaps =
      winEnd >= winStart
        ? perimeterEdgeOverlaps(edge.startDist, edgeEnd, winStart, winEnd)
        : [
            ...perimeterEdgeOverlaps(edge.startDist, edgeEnd, winStart, perimeter.total),
            ...perimeterEdgeOverlaps(edge.startDist, edgeEnd, 0, winEnd),
          ];

    for (const overlap of overlaps) {
      const t0 = Math.max(0, (overlap.start - edge.startDist) / edge.length);
      const t1 = Math.min(1, (overlap.end - edge.startDist) / edge.length);
      if (t1 <= t0 + 0.001) continue;
      spans.push({
        x1: edge.ax + (edge.bx - edge.ax) * t0,
        y1: edge.ay + (edge.by - edge.ay) * t0,
        x2: edge.ax + (edge.bx - edge.ax) * t1,
        y2: edge.ay + (edge.by - edge.ay) * t1,
      });
    }
  }

  return spans;
}

/** Win-zone dashed segments along octagon perimeter (% of border length, centered on top flat edge). */
export function buildOctagonWinPerimeterDashes(
  cx: number,
  cy: number,
  r: number,
  probability: number,
  options?: { rotation?: number; dashLen?: number; gapLen?: number },
): PerimeterDash[] {
  if (probability <= 0) return [];
  const rotation = options?.rotation ?? OCTAGON_ROTATION;
  const dashLen = options?.dashLen ?? 11;
  const gapLen = options?.gapLen ?? 2.5;
  const pitch = dashLen + gapLen;
  const spans = buildOctagonWinPerimeterSpans(cx, cy, r, probability, rotation);
  const dashes: PerimeterDash[] = [];

  for (const span of spans) {
    const spanLen = Math.hypot(span.x2 - span.x1, span.y2 - span.y1);
    if (spanLen < 0.2) continue;
    let pos = 0;
    while (pos < spanLen - 0.05) {
      const t0 = pos / spanLen;
      const t1 = Math.min(1, (pos + dashLen) / spanLen);
      dashes.push({
        x1: span.x1 + (span.x2 - span.x1) * t0,
        y1: span.y1 + (span.y2 - span.y1) * t0,
        x2: span.x1 + (span.x2 - span.x1) * t1,
        y2: span.y1 + (span.y2 - span.y1) * t1,
      });
      pos += pitch;
    }
  }

  return dashes;
}

/** Radial tick marks from octagon inner perimeter toward center (reference style). */
export function octagonInnerTicks(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  rotation = OCTAGON_ROTATION,
) {
  const verts = octagonVertices(cx, cy, outerR, rotation);
  const ticks: { x1: number; y1: number; x2: number; y2: number; major: boolean }[] = [];

  for (let i = 0; i < 8; i++) {
    const a = verts[i];
    const b = verts[(i + 1) % 8];
    const points = [a, { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, b];

    for (const p of points) {
      const ang = angleAtPoint(cx, cy, p.x, p.y);
      const inner = polar(cx, cy, innerR, ang);
      ticks.push({
        x1: p.x,
        y1: p.y,
        x2: inner.x,
        y2: inner.y,
        major: p === a,
      });
    }
  }

  return ticks;
}

export function winSectorPath(cx: number, cy: number, inner: number, outer: number, p: number): string {
  if (p <= 0) return '';
  if (p >= 100) return `M ${cx - outer} ${cy} A ${outer} ${outer} 0 1 1 ${cx + outer} ${cy} A ${outer} ${outer} 0 1 1 ${cx - outer} ${cy} Z`;
  const arc = getWinningArc(p);
  const s = polar(cx, cy, outer, arc.start);
  const e = polar(cx, cy, outer, arc.end);
  const is = polar(cx, cy, inner, arc.end);
  const ie = polar(cx, cy, inner, arc.start);
  const large = arc.span > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${outer} ${outer} 0 ${large} 1 ${e.x} ${e.y} L ${is.x} ${is.y} A ${inner} ${inner} 0 ${large} 0 ${ie.x} ${ie.y} Z`;
}

export function loseSectorPath(cx: number, cy: number, inner: number, outer: number, p: number): string {
  if (p <= 0) return winSectorPath(cx, cy, inner, outer, 100);
  if (p >= 100) return '';
  const win = getWinningArc(p);
  const s = polar(cx, cy, outer, win.end);
  const e = polar(cx, cy, outer, win.start);
  const is = polar(cx, cy, inner, win.start);
  const ie = polar(cx, cy, inner, win.end);
  const loseSpan = 360 - win.span;
  const large = loseSpan > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${outer} ${outer} 0 ${large} 1 ${e.x} ${e.y} L ${is.x} ${is.y} A ${inner} ${inner} 0 ${large} 0 ${ie.x} ${ie.y} Z`;
}

export function tickMarks(cx: number, cy: number, r: number, n: number, major: number) {
  return Array.from({ length: n }, (_, i) => {
    const deg = (i / n) * 360;
    const m = i % major === 0;
    const len = m ? 10 : 5;
    const a = polar(cx, cy, r - len, deg);
    const b = polar(cx, cy, r, deg);
    return { ...a, x2: b.x, y2: b.y, major: m };
  });
}

/** Fair odds from input vs target price (before house edge). */
export function fairProbability(input: number, target: number): number {
  if (!input || !target) return 0;
  return (input / target) * 100;
}

/** House keeps a 10% edge on win rate: 50% fair → 45%, 10% fair → 9%. */

export function applyHouseEdge(fairPercent: number): number {
  return Math.round(Math.min(fairPercent * HOUSE_EDGE, MAX_UPGRADE_PROBABILITY) * 10) / 10;
}

export function calcProbability(input: number, target: number): number {
  if (!isValidUpgrade(input, target)) return 0;
  return applyHouseEdge(fairProbability(input, target));
}

import { formatPrice } from './currency';

/** @deprecated Use formatPrice or CoinPrice in UI */
export function formatUSD(n: number) {
  return formatPrice(n);
}
