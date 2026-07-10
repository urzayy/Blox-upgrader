export const ARROW_ANGLE = 90;
export const HOUSE_EDGE = 0.9;
export const MAX_UPGRADE_PROBABILITY = 80;
export const ROLL_MAX = 100_000;

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

/** SVG circle angle from arrow orbit rotation (0 = arrow at bottom) */
export function svgAngleFromArrowRotation(arrowRot: number): number {
  return normalizeAngle(ARROW_ANGLE + arrowRot);
}

export function arrowRotationFromSvg(svg: number): number {
  return normalizeAngle(svg - ARROW_ANGLE);
}

export function isWinAtArrowAngle(arrowRot: number, probability: number): boolean {
  return isAngleInWinZone(svgAngleFromArrowRotation(arrowRot), getWinningArc(probability));
}

export function pickLandingAngle(probability: number, shouldWin: boolean): number {
  const arc = getWinningArc(probability);
  if (shouldWin) {
    if (arc.span <= 0) return ARROW_ANGLE;
    const margin = Math.min(arc.span * 0.06, 3);
    const safe = Math.max(arc.span - margin * 2, 0.5);
    return normalizeAngle(arc.start + margin + Math.random() * safe);
  }
  let angle: number;
  let i = 0;
  do {
    angle = normalizeAngle(Math.random() * 360);
    i++;
  } while (isAngleInWinZone(angle, arc) && i < 60);
  if (isAngleInWinZone(angle, arc)) angle = normalizeAngle(arc.end + (360 - arc.span) / 2);
  return angle;
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
