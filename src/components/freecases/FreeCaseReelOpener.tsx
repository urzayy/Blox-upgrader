import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import gsap from 'gsap';
import type { Skin } from '../../data/skins';
import { RARITY } from '../../data/skins';
import type { FreeCaseReelResult } from '../../lib/freeCaseReel';
import { reelCardDepth, reelCardDepthVertical, runReelSmoothScroll } from '../../lib/freeCaseReelMotion';
import { playFreeCaseLandSound } from '../../lib/freeCaseDropSound';
import { sfx } from '../../lib/audio';
import { CoinPrice } from '../ui/CoinPrice';
import { SkinImage } from '../skins/SkinImage';
import { Confetti } from '../effects/Confetti';
import { BloxRoyalCard } from './BloxRoyalCard';
import { RoyalCrownBadge } from './RoyalCrownBadge';
import { BattleRarityDiamond } from '../casebattles/BattleRarityDiamond';

type ReelSize = 'default' | 'large' | 'multi-2' | 'multi-3' | 'multi-4' | 'multi-5' | 'battle' | 'battle-4' | 'battle-6';

export type { ReelSize };

export function getMultiReelSize(count: number): ReelSize {
  if (count <= 2) return 'multi-2';
  if (count === 3) return 'multi-3';
  if (count === 4) return 'multi-4';
  return 'multi-5';
}

export function getMultiReelLayout(count: number) {
  const size = getMultiReelSize(count);
  const dims = REEL_DIMS[size];
  return {
    size,
    columnWidth: dims.columnWidth ?? 120,
    viewportHeight: dims.viewportHeight ?? 300,
  };
}

interface ReelDimensions {
  itemWidth: number;
  itemHeight: number;
  dividerWidth: number;
  imageHeight: number;
  weaponText: string;
  skinText: string;
  markerText: string;
  containerPadding: string;
  titleText: string;
  statusText: string;
  compactPins?: boolean;
  viewportHeight?: number;
  columnWidth?: number;
}

const REEL_DIMS: Record<ReelSize, ReelDimensions> = {
  default: {
    itemWidth: 148,
    itemHeight: 172,
    dividerWidth: 2,
    imageHeight: 88,
    weaponText: 'text-[9px]',
    skinText: 'text-[10px]',
    markerText: 'text-[9px]',
    containerPadding: 'px-1 py-6 sm:px-2 sm:py-7',
    titleText: 'text-lg sm:text-xl',
    statusText: 'text-sm sm:text-base',
  },
  large: {
    itemWidth: 192,
    itemHeight: 224,
    dividerWidth: 2,
    imageHeight: 118,
    weaponText: 'text-[10px]',
    skinText: 'text-xs',
    markerText: 'text-[10px]',
    containerPadding: 'px-2 py-8 sm:px-3 sm:py-9',
    titleText: 'text-xl sm:text-2xl',
    statusText: 'text-base sm:text-lg',
  },
  'multi-2': {
    itemWidth: 232,
    itemHeight: 184,
    dividerWidth: 2,
    imageHeight: 120,
    weaponText: 'text-[10px]',
    skinText: 'text-xs',
    markerText: 'text-[9px]',
    containerPadding: 'p-0',
    titleText: 'text-base',
    statusText: 'text-sm',
    compactPins: false,
    viewportHeight: 460,
    columnWidth: 232,
  },
  'multi-3': {
    itemWidth: 232,
    itemHeight: 184,
    dividerWidth: 2,
    imageHeight: 120,
    weaponText: 'text-[10px]',
    skinText: 'text-xs',
    markerText: 'text-[9px]',
    containerPadding: 'p-0',
    titleText: 'text-base',
    statusText: 'text-sm',
    compactPins: false,
    viewportHeight: 460,
    columnWidth: 232,
  },
  'multi-4': {
    itemWidth: 232,
    itemHeight: 184,
    dividerWidth: 2,
    imageHeight: 120,
    weaponText: 'text-[10px]',
    skinText: 'text-xs',
    markerText: 'text-[9px]',
    containerPadding: 'p-0',
    titleText: 'text-base',
    statusText: 'text-sm',
    compactPins: false,
    viewportHeight: 460,
    columnWidth: 232,
  },
  'multi-5': {
    itemWidth: 232,
    itemHeight: 184,
    dividerWidth: 2,
    imageHeight: 120,
    weaponText: 'text-[10px]',
    skinText: 'text-xs',
    markerText: 'text-[9px]',
    containerPadding: 'p-0',
    titleText: 'text-base',
    statusText: 'text-sm',
    compactPins: false,
    viewportHeight: 460,
    columnWidth: 232,
  },
  battle: {
    itemWidth: 260,
    itemHeight: 200,
    dividerWidth: 20,
    imageHeight: 128,
    weaponText: 'text-[8px]',
    skinText: 'text-[9px]',
    markerText: 'text-[8px]',
    containerPadding: 'p-0',
    titleText: 'text-sm',
    statusText: 'text-xs',
    compactPins: true,
    viewportHeight: 380,
  },
  'battle-4': {
    itemWidth: 220,
    itemHeight: 172,
    dividerWidth: 16,
    imageHeight: 108,
    weaponText: 'text-[8px]',
    skinText: 'text-[9px]',
    markerText: 'text-[8px]',
    containerPadding: 'p-0',
    titleText: 'text-sm',
    statusText: 'text-xs',
    compactPins: true,
    viewportHeight: 330,
  },
  'battle-6': {
    itemWidth: 120,
    itemHeight: 92,
    dividerWidth: 6,
    imageHeight: 54,
    weaponText: 'text-[7px]',
    skinText: 'text-[7px]',
    markerText: 'text-[7px]',
    containerPadding: 'p-0',
    titleText: 'text-[10px]',
    statusText: 'text-[9px]',
    compactPins: true,
    viewportHeight: 165,
  },
};

const ROLL_MS = 4800;
const INTRO_MS = 500;
const TURBO_ROLL_MS = ROLL_MS / 2;
const TURBO_INTRO_MS = INTRO_MS / 2;
const ROYAL_HOLD_MS = 1200;
const BATTLE_REVEAL_HOLD_MS = 1500;

type Phase = 'intro' | 'rolling' | 'royal-hold' | 'reveal';

const SELL_BUTTON_CLASS =
  'rounded-xl bg-gradient-to-r from-[#22c55e] to-[#16a34a] px-5 py-2.5 font-display text-xs font-black uppercase tracking-[0.1em] text-white shadow-[0_0_18px_rgba(34,197,94,0.28)] transition hover:brightness-110';

function splitSkinName(name: string): { weapon: string; skin: string } {
  const parts = name.split('|').map(part => part.trim());
  if (parts.length >= 2) {
    return { weapon: parts[0], skin: parts.slice(1).join(' | ') };
  }
  return { weapon: name, skin: '' };
}

function rarityCardBackground(color: string, isKnife: boolean): string {
  if (isKnife) {
    return 'linear-gradient(180deg, rgba(255,215,0,0.22) 0%, rgba(180,130,20,0.55) 42%, rgba(60,45,8,0.95) 100%)';
  }
  return `linear-gradient(180deg, color-mix(in srgb, ${color} 22%, #14101f) 0%, color-mix(in srgb, ${color} 48%, #100d18) 46%, color-mix(in srgb, ${color} 30%, #080610) 100%)`;
}

function ReelPin({ side, royal, compact }: { side: 'top' | 'bottom'; royal?: boolean; compact?: boolean }) {
  const line = (
    <span
      className={`block rounded-full shadow-[0_0_8px_rgba(255,255,255,0.65)] ${
        compact ? 'h-2.5 w-[2px]' : 'h-4 w-[2px]'
      } ${royal ? 'bg-[#e8c56d]' : 'bg-white'}`}
    />
  );
  const dot = (
    <span
      className={`block rounded-full ring-2 ${
        compact ? 'h-1.5 w-1.5' : 'h-2.5 w-2.5'
      } ${
        royal
          ? 'bg-[#e8c56d] shadow-[0_0_12px_rgba(212,168,83,0.9)] ring-[#e8c56d]/35'
          : 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.85)] ring-white/25'
      }`}
    />
  );

  return (
    <div className="flex flex-col items-center">
      {side === 'top' ? (
        <>
          {dot}
          {line}
        </>
      ) : (
        <>
          {line}
          {dot}
        </>
      )}
    </div>
  );
}

function ReelSelector({ royal, compact }: { royal?: boolean; compact?: boolean }) {
  const sideFade = compact ? 'w-12 sm:w-16' : 'w-20 sm:w-28';
  const pinOffset = compact ? '-top-3' : '-top-6';
  const pinBottom = compact ? '-bottom-3' : '-bottom-6';

  return (
    <>
      <div
        className={`pointer-events-none absolute inset-y-0 left-0 z-30 ${sideFade} ${
          royal
            ? 'bg-gradient-to-r from-[#120d08] via-[#120d08]/96 to-transparent'
            : 'bg-gradient-to-r from-[#0a0812] via-[#0a0812]/96 to-transparent'
        }`}
      />
      <div
        className={`pointer-events-none absolute inset-y-0 right-0 z-30 ${sideFade} ${
          royal
            ? 'bg-gradient-to-l from-[#120d08] via-[#120d08]/96 to-transparent'
            : 'bg-gradient-to-l from-[#0a0812] via-[#0a0812]/96 to-transparent'
        }`}
      />

      <div className={`pointer-events-none absolute left-1/2 z-50 -translate-x-1/2 ${pinOffset}`}>
        <ReelPin side="top" royal={royal} compact={compact} />
      </div>
      <div className={`pointer-events-none absolute left-1/2 z-50 -translate-x-1/2 ${pinBottom}`}>
        <ReelPin side="bottom" royal={royal} compact={compact} />
      </div>

      {royal && (
        <motion.div
          className="pointer-events-none absolute inset-2 z-10 rounded-lg border border-[#d4a853]/55"
          animate={{ opacity: [0.35, 0.75, 0.35] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
    </>
  );
}

function ReelPinVertical({ side, royal, compact }: { side: 'left' | 'right'; royal?: boolean; compact?: boolean }) {
  const line = (
    <span
      className={`block rounded-full shadow-[0_0_8px_rgba(255,255,255,0.65)] ${
        compact ? 'h-[2px] w-2.5' : 'h-[2px] w-4'
      } ${royal ? 'bg-[#e8c56d]' : 'bg-white'}`}
    />
  );
  const dot = (
    <span
      className={`block rounded-full ring-2 ${
        compact ? 'h-1.5 w-1.5' : 'h-2.5 w-2.5'
      } ${
        royal
          ? 'bg-[#e8c56d] shadow-[0_0_12px_rgba(212,168,83,0.9)] ring-[#e8c56d]/35'
          : 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.85)] ring-white/25'
      }`}
    />
  );

  return (
    <div className="flex items-center">
      {side === 'left' ? (
        <>
          {dot}
          {line}
        </>
      ) : (
        <>
          {line}
          {dot}
        </>
      )}
    </div>
  );
}

function ReelSelectorVertical({
  royal,
  compact,
  transparent,
}: {
  royal?: boolean;
  compact?: boolean;
  transparent?: boolean;
}) {
  const edgeFade = compact ? 'h-10 sm:h-12' : 'h-14 sm:h-16';
  const pinOffset = compact ? '-left-3' : '-left-5';
  const pinRight = compact ? '-right-3' : '-right-5';
  const fadeFrom = transparent ? '#0f0d18' : royal ? '#120d08' : '#0a0812';

  return (
    <>
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 z-30 ${edgeFade}`}
        style={{
          background: `linear-gradient(to bottom, ${fadeFrom} 0%, ${fadeFrom}f2 45%, transparent 100%)`,
        }}
      />
      <div
        className={`pointer-events-none absolute inset-x-0 bottom-0 z-30 ${edgeFade}`}
        style={{
          background: `linear-gradient(to top, ${fadeFrom} 0%, ${fadeFrom}f2 45%, transparent 100%)`,
        }}
      />

      <div className={`pointer-events-none absolute top-1/2 z-50 -translate-y-1/2 ${pinOffset}`}>
        <ReelPinVertical side="left" royal={royal} compact={compact} />
      </div>
      <div className={`pointer-events-none absolute top-1/2 z-50 -translate-y-1/2 ${pinRight}`}>
        <ReelPinVertical side="right" royal={royal} compact={compact} />
      </div>

      {royal && (
        <motion.div
          className="pointer-events-none absolute inset-2 z-10 rounded-lg border border-[#d4a853]/55"
          animate={{ opacity: [0.35, 0.75, 0.35] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
    </>
  );
}

function ReelDivider({
  royal,
  dividerWidth,
  vertical,
  transparent,
}: {
  royal?: boolean;
  dividerWidth: number;
  vertical?: boolean;
  transparent?: boolean;
}) {
  if (vertical) {
    return (
      <div
        className={`w-full shrink-0 ${transparent ? 'bg-transparent' : royal ? 'bg-[#2a2010]' : 'bg-black'}`}
        style={{ height: dividerWidth }}
        aria-hidden="true"
      />
    );
  }

  return (
    <div
      className={`shrink-0 self-stretch ${royal ? 'bg-[#2a2010]' : 'bg-black'}`}
      style={{ width: dividerWidth }}
      aria-hidden="true"
    />
  );
}

function ReelCard({
  item,
  highlight,
  offset,
  index,
  viewportSize,
  rolling,
  royal,
  dims,
  vertical,
  revealSkin,
  battleStyle,
  battleLandHighlight,
  showLeadGlow,
}: {
  item: FreeCaseReelResult['reel'][number];
  highlight?: boolean;
  offset: number;
  index: number;
  viewportSize: number;
  rolling?: boolean;
  royal?: boolean;
  dims: ReelDimensions;
  vertical?: boolean;
  revealSkin?: Skin | null;
  battleStyle?: boolean;
  battleLandHighlight?: boolean;
  showLeadGlow?: boolean;
}) {
  const itemStride = vertical
    ? dims.itemHeight + dims.dividerWidth
    : dims.itemWidth + dims.dividerWidth;
  const itemCenter = vertical ? dims.itemHeight / 2 : dims.itemWidth / 2;
  const displayItem = revealSkin
    ? { ...item, skin: revealSkin, isRoyal: false, isRoyalLoot: item.isRoyalLoot }
    : item;

  if (displayItem.isRoyal) {
    return (
      <BloxRoyalCard
        width={vertical ? undefined : dims.itemWidth}
        height={dims.itemHeight}
        highlight={highlight}
        fullWidth={vertical}
      />
    );
  }

  const r = RARITY[displayItem.skin.rarity];
  const isKnife = displayItem.skin.weapon === 'Knife' || displayItem.skin.weapon === 'Gloves';
  const accent = isKnife ? '#ffd700' : r.color;
  const { weapon, skin: skinName } = splitSkinName(displayItem.skin.name);
  const displayWeapon = isKnife && !weapon.startsWith('★') ? `★ ${weapon}` : weapon;
  const depth = rolling
    ? null
    : vertical
      ? reelCardDepthVertical(index, offset, viewportSize, itemStride, itemCenter)
      : reelCardDepth(index, offset, viewportSize, itemStride, itemCenter);

  if (battleStyle) {
    const landed = Boolean(battleLandHighlight);
    return (
      <motion.div
        className={`relative shrink-0 overflow-visible ${vertical ? 'w-full' : ''} ${highlight ? 'z-10' : ''}`}
        style={{
          width: vertical ? '100%' : dims.itemWidth,
          height: dims.itemHeight,
          background: 'transparent',
          transform: depth && !highlight ? `scale(${depth.scale})` : undefined,
          filter: depth && !highlight ? `brightness(${depth.brightness})` : undefined,
        }}
      >
        <div className="relative flex h-full w-full flex-col items-center justify-center overflow-visible pt-1">
          <div className="relative flex w-full flex-col items-center justify-center">
            <div className="relative flex h-[52%] w-full items-center justify-center">
              <BattleRarityDiamond
                skin={displayItem.skin}
                size="reel"
                leadDrop={showLeadGlow}
                className="z-0"
              />
              <SkinImage
                src={displayItem.skin.image}
                alt={displayItem.skin.name}
                className="relative z-10 h-[88%] w-[92%] object-contain"
                zoom={0.78}
              />
            </div>
            {landed && (
              <CoinPrice
                value={displayItem.skin.price}
                iconClassName={dims.viewportHeight && dims.viewportHeight <= 220 ? 'h-2 w-2' : 'h-3 w-3'}
                textClassName={`font-display font-black text-lime-300 ${dims.viewportHeight && dims.viewportHeight <= 220 ? 'text-[9px]' : 'text-xs'}`}
                className="relative z-20 -mt-0.5 justify-center"
              />
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`relative shrink-0 overflow-hidden transition-shadow ${vertical ? 'w-full' : ''} ${highlight ? 'z-10' : ''}`}
      style={{
        width: vertical ? '100%' : dims.itemWidth,
        height: dims.itemHeight,
        background: royal
          ? `linear-gradient(180deg, color-mix(in srgb, ${accent} 28%, #1a1408) 0%, color-mix(in srgb, ${accent} 42%, #120e08) 46%, #0a0806 100%)`
          : rarityCardBackground(accent, isKnife),
        boxShadow: highlight
          ? royal
            ? `inset 0 0 0 2px #d4a853, 0 0 30px ${r.glow}, 0 0 60px rgba(212,168,83,0.25)`
            : `inset 0 0 0 2px ${accent}, 0 0 24px ${r.glow}`
          : royal
            ? 'inset 0 0 0 1px rgba(212,168,83,0.22)'
            : undefined,
        transform: highlight
          ? vertical
            ? 'scale(1.04) translateX(-2px)'
            : 'scale(1.04) translateY(-4px)'
          : depth
            ? `scale(${depth.scale})`
            : undefined,
        filter: highlight
          ? 'brightness(1.15)'
          : depth
            ? `brightness(${depth.brightness})`
            : undefined,
      }}
      animate={highlight ? { scale: royal ? [1.04, 1.07, 1.04] : [1.04, 1.06, 1.04] } : undefined}
      transition={{ duration: royal ? 0.55 : 0.65, repeat: highlight ? Infinity : 0, ease: 'easeInOut' }}
    >
      {displayItem.isRoyalLoot && <RoyalCrownBadge />}
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          background: royal
            ? `radial-gradient(ellipse 90% 55% at 50% 18%, rgba(212,168,83,0.35), transparent 70%)`
            : `radial-gradient(ellipse 90% 55% at 50% 18%, ${accent}, transparent 70%)`,
        }}
      />

      <div className="relative flex h-full flex-col">
        {!vertical && (
          <div className="flex justify-center pt-1.5">
            <span
              className={`font-mono font-bold tracking-tighter text-white/25 ${dims.markerText}`}
              aria-hidden="true"
            >
              ////
            </span>
          </div>
        )}

        <div
          className={`relative mx-auto flex items-center justify-center ${
            vertical ? 'w-[94%] flex-1 pt-1' : 'w-[72%] px-1.5 pt-0.5'
          }`}
          style={vertical ? { minHeight: dims.imageHeight } : { height: dims.imageHeight }}
        >
          <SkinImage
            src={displayItem.skin.image}
            alt={displayItem.skin.name}
            zoom={vertical ? (dims.imageHeight >= 100 ? 1.2 : 1.14) : 0.96}
          />
        </div>

        <div className={`relative mt-auto text-center ${vertical ? 'px-1.5 pb-2 pt-0.5' : 'px-2 pb-2.5 pt-0.5'}`}>
          <p className={`truncate font-medium leading-tight text-white/80 ${dims.weaponText}`}>{displayWeapon}</p>
          {skinName && (
            <p className={`truncate font-bold leading-tight ${dims.skinText}`} style={{ color: accent }}>
              {skinName}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

interface Props {
  active: boolean;
  caseSlug: string;
  result: FreeCaseReelResult | null;
  grantedSkin: Skin | null;
  caseLabel: string;
  turbo: boolean;
  soundOn: boolean;
  size?: ReelSize;
  orientation?: 'horizontal' | 'vertical';
  embedded?: boolean;
  compact?: boolean;
  showHeader?: boolean;
  showRevealActions?: boolean;
  roundBestDrop?: boolean;
  onReveal: () => void;
  onSell: () => void;
  onUpgrade: () => void;
}

export function FreeCaseReelOpener({
  active,
  caseSlug,
  result,
  grantedSkin,
  caseLabel,
  turbo,
  soundOn,
  size = 'default',
  orientation = 'horizontal',
  embedded = false,
  compact = false,
  showHeader,
  showRevealActions,
  roundBestDrop = false,
  onReveal,
  onSell,
  onUpgrade,
}: Props) {
  const dims = REEL_DIMS[size];
  const isVertical = orientation === 'vertical';
  const isCompact = compact || size.startsWith('multi-') || size.startsWith('battle');
  const isBattleStyle = size.startsWith('battle');
  const headerVisible = showHeader ?? !isCompact;
  const revealActionsVisible = showRevealActions ?? !isCompact;
  const itemStride = isVertical
    ? dims.itemHeight + dims.dividerWidth
    : dims.itemWidth + dims.dividerWidth;
  const itemCenter = isVertical ? dims.itemHeight / 2 : dims.itemWidth / 2;
  const scrollAxis = isVertical ? 'y' : 'x';
  const [phase, setPhase] = useState<Phase>('intro');
  const [offset, setOffset] = useState(0);
  const [viewportSize, setViewportSize] = useState(isVertical ? dims.viewportHeight ?? 220 : 720);
  const [showConfetti, setShowConfetti] = useState(false);
  const [activeReel, setActiveReel] = useState<FreeCaseReelResult | null>(null);
  const [royalPass, setRoyalPass] = useState(false);
  const [rollKey, setRollKey] = useState(0);

  const viewportRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const onRevealRef = useRef(onReveal);
  const revealedRef = useRef(false);
  const rollTurboRef = useRef(turbo);
  const soundOnRef = useRef(soundOn);
  const rollSessionRef = useRef(0);
  const rollTweenRef = useRef<gsap.core.Tween | null>(null);
  const royalHoldTimerRef = useRef<number | null>(null);
  const revealHoldTimerRef = useRef<number | null>(null);
  const introTimerRef = useRef<number | null>(null);
  const baseResultRef = useRef<FreeCaseReelResult | null>(null);
  const frozenTargetRef = useRef(0);
  const phaseRef = useRef<Phase>('intro');
  const letRoyalRollFinishRef = useRef(false);

  onRevealRef.current = onReveal;
  phaseRef.current = phase;
  soundOnRef.current = soundOn;

  const clearIntroTimer = () => {
    if (introTimerRef.current) {
      window.clearTimeout(introTimerRef.current);
      introTimerRef.current = null;
    }
  };

  const clearRoyalHoldTimer = () => {
    if (royalHoldTimerRef.current) {
      window.clearTimeout(royalHoldTimerRef.current);
      royalHoldTimerRef.current = null;
    }
  };

  const clearRevealHoldTimer = () => {
    if (revealHoldTimerRef.current) {
      window.clearTimeout(revealHoldTimerRef.current);
      revealHoldTimerRef.current = null;
    }
  };

  const clearTimers = () => {
    clearIntroTimer();
    clearRoyalHoldTimer();
    clearRevealHoldTimer();
  };

  useEffect(() => {
    if (!active || !result) {
      rollSessionRef.current += 1;
      rollTweenRef.current?.kill();
      rollTweenRef.current = null;
      clearTimers();
      letRoyalRollFinishRef.current = false;
      if (soundOnRef.current) sfx.caseWheelLand();
      if (stripRef.current) gsap.set(stripRef.current, { x: 0, y: 0 });
      revealedRef.current = false;
      setPhase('intro');
      setOffset(0);
      setShowConfetti(false);
      setRoyalPass(false);
      setActiveReel(null);
      return;
    }

    rollTurboRef.current = turbo;
    rollSessionRef.current += 1;
    baseResultRef.current = result;
    revealedRef.current = false;
    letRoyalRollFinishRef.current = false;
    setRoyalPass(false);
    setPhase('intro');
    setOffset(0);
    setShowConfetti(false);
    setActiveReel(result);
    setRollKey(key => key + 1);
  }, [active, result?.rewardSkin.id, result?.winIndex]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const sync = () => {
      setViewportSize(isVertical ? el.clientHeight : el.clientWidth);
    };
    sync();

    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, [active, rollKey, isVertical]);

  useEffect(() => {
    if (!activeReel || viewportSize <= 0) return;
    const jitter = Math.random() * 16 - 8;
    const centerOffset = activeReel.winIndex * itemStride + itemCenter - viewportSize / 2;
    frozenTargetRef.current = Math.max(0, centerOffset + jitter);
  }, [activeReel, rollKey, viewportSize, itemStride, itemCenter]);

  const isBigWin = Boolean(
    result && (result.rewardSkin.price >= 10 || result.rewardSkin.rarity === 'classified'),
  );

  const finishReveal = (reel: FreeCaseReelResult, royalFinish: boolean) => {
    setOffset(frozenTargetRef.current);
    setPhase('reveal');
    if (!revealedRef.current) {
      revealedRef.current = true;
      clearRevealHoldTimer();
      if (isBattleStyle) {
        revealHoldTimerRef.current = window.setTimeout(() => {
          revealHoldTimerRef.current = null;
          onRevealRef.current();
        }, BATTLE_REVEAL_HOLD_MS);
      } else {
        onRevealRef.current();
      }
    }
    if (soundOnRef.current) {
      if (royalFinish) {
        // ROYAL ROLL already includes the landing — let it play out.
        letRoyalRollFinishRef.current = true;
      } else {
        playFreeCaseLandSound(caseSlug, reel.rewardSkin.id);
      }
    }
    if (isBigWin || royalFinish) setShowConfetti(true);
  };

  const startRoyalSecondPass = (base: FreeCaseReelResult) => {
    if (!base.royalReel || !stripRef.current) return;

    const royalReel = base.royalReel;
    const viewportEl = viewportRef.current;
    const measuredSize = viewportEl
      ? (isVertical ? viewportEl.clientHeight : viewportEl.clientWidth)
      : viewportSize;
    const jitter = Math.random() * 16 - 8;
    frozenTargetRef.current = Math.max(
      0,
      royalReel.winIndex * itemStride + itemCenter - measuredSize / 2 + jitter,
    );

    letRoyalRollFinishRef.current = false;
    setPhase('intro');
    setRoyalPass(true);
    setActiveReel(royalReel);
    setOffset(0);
    gsap.set(stripRef.current, { x: 0, y: 0 });
    setRollKey(key => key + 1);
  };

  useEffect(() => {
    if (!active || !result || !activeReel) return;

    const session = rollSessionRef.current;
    const useTurbo = rollTurboRef.current;
    const rollMs = useTurbo ? TURBO_ROLL_MS : ROLL_MS;
    const introMs = useTurbo ? TURBO_INTRO_MS : INTRO_MS;
    const reelSnapshot = activeReel;
    const isRoyalSpinPass = royalPass;

    const isStale = () => session !== rollSessionRef.current;

    if (!isRoyalSpinPass) {
      setOffset(0);
      if (stripRef.current) gsap.set(stripRef.current, { x: 0, y: 0 });
    }

    introTimerRef.current = window.setTimeout(() => {
      if (isStale() || !stripRef.current) return;
      const scrollTarget = frozenTargetRef.current;
      setPhase('rolling');
      if (soundOnRef.current) {
        if (isRoyalSpinPass) sfx.royalRollStart(useTurbo);
        else sfx.caseRollStart(useTurbo);
      }

      rollTweenRef.current?.kill();
      const onRollComplete = () => {
        if (isStale()) return;

        const pendingBase = baseResultRef.current;
        if (!isRoyalSpinPass && pendingBase?.isRoyalSpin && pendingBase.royalReel) {
          setOffset(scrollTarget);
          setPhase('royal-hold');
          if (soundOnRef.current) {
            sfx.caseWheelLand();
            sfx.royalLand();
          }
          clearRoyalHoldTimer();
          royalHoldTimerRef.current = window.setTimeout(() => {
            if (phaseRef.current !== 'royal-hold') return;
            const royalBase = baseResultRef.current;
            if (!royalBase?.isRoyalSpin || !royalBase.royalReel) return;
            clearRoyalHoldTimer();
            startRoyalSecondPass(royalBase);
          }, ROYAL_HOLD_MS);
          return;
        }

        finishReveal(reelSnapshot, isRoyalSpinPass);
      };

      rollTweenRef.current = runReelSmoothScroll({
        element: stripRef.current,
        from: 0,
        to: scrollTarget,
        durationMs: rollMs,
        turbo: useTurbo,
        axis: scrollAxis,
        onComplete: onRollComplete,
      });
    }, introMs);

    return () => {
      clearIntroTimer();
      rollTweenRef.current?.kill();
      rollTweenRef.current = null;
      if (soundOnRef.current && !letRoyalRollFinishRef.current) sfx.caseWheelLand();
    };
  }, [active, activeReel, royalPass, rollKey, caseSlug, scrollAxis]);

  const displayReel = activeReel ?? result;
  if (!active || !result || !displayReel) return null;

  const rewardSkin = grantedSkin ?? result.rewardSkin;
  const showRoyalChrome = royalPass || phase === 'royal-hold';
  const viewportStyle = isVertical
    ? {
        height: dims.viewportHeight ?? viewportSize,
        width:
          embedded && dims.columnWidth && !isBattleStyle
            ? dims.columnWidth
            : isBattleStyle
              ? '100%'
              : undefined,
      }
    : undefined;
  const columnStyle =
    embedded && isVertical && dims.columnWidth && !isBattleStyle
      ? { width: dims.columnWidth }
      : isBattleStyle
        ? { width: '100%' }
        : undefined;
  const statusText =
    phase === 'reveal'
      ? 'Skin obtained!'
      : phase === 'royal-hold'
        ? 'BloxRoyal!'
        : phase === 'rolling'
          ? royalPass
            ? 'BloxRoyal spinning…'
            : 'Girando…'
          : royalPass
            ? 'Activando BloxRoyal…'
            : 'Opening case…';

  const highlightIndex =
    phase === 'reveal'
      ? displayReel.winIndex
      : phase === 'royal-hold'
        ? result.winIndex
        : -1;

  return (
    <AnimatePresence>
      <motion.div
        className="relative w-full"
        style={columnStyle}
        initial={embedded ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={embedded ? undefined : { opacity: 0, y: -8 }}
        transition={{ duration: embedded ? 0 : 0.35 }}
      >
        {showConfetti && <Confetti />}

        {phase === 'royal-hold' && (
          <motion.div
            className="pointer-events-none absolute inset-0 z-20 rounded-2xl bg-[radial-gradient(ellipse_at_center,rgba(212,168,83,0.18),transparent_68%)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.55] }}
            transition={{ duration: 0.9 }}
          />
        )}

        {headerVisible && (
          <div className="mb-3 text-center">
            <p
              className={`font-display text-[10px] font-bold uppercase tracking-[0.22em] sm:text-[11px] ${
                showRoyalChrome ? 'text-[#e8c56d]/90' : 'text-violet-300/80'
              }`}
            >
              {showRoyalChrome ? 'BloxRoyal spin' : `${caseLabel} case`}
            </p>
            <h2
              className={`mt-1 font-display font-black uppercase tracking-[0.1em] ${dims.titleText} ${
                showRoyalChrome ? 'text-[#f0d48a]' : 'text-white'
              }`}
            >
              {statusText}
            </h2>
          </div>
        )}

        <div
          className={`relative overflow-visible ${embedded ? '' : 'rounded-2xl border shadow-[0_20px_56px_-14px_rgba(0,0,0,0.75)]'} ${dims.containerPadding} ${
            embedded ? '' : isCompact ? 'rounded-xl shadow-none' : ''
          } ${
            embedded
              ? ''
              : showRoyalChrome
                ? 'border-[#d4a853]/35 bg-[#120e08] shadow-[0_20px_56px_-14px_rgba(0,0,0,0.75),0_0_48px_rgba(212,168,83,0.12)]'
                : 'border-white/[0.08] bg-[#0c0a12]'
          }`}
        >
          <div
            ref={viewportRef}
            className={`relative overflow-hidden ${embedded ? '' : 'rounded-lg'} ${
              isBattleStyle ? 'bg-transparent' : showRoyalChrome ? 'bg-[#0a0806]' : 'bg-[#080610]'
            }`}
            style={viewportStyle}
          >
            {isVertical ? (
              <ReelSelectorVertical
                royal={showRoyalChrome}
                compact={dims.compactPins}
                transparent={isBattleStyle}
              />
            ) : (
              <ReelSelector royal={showRoyalChrome} compact={dims.compactPins} />
            )}

            <div
              ref={stripRef}
              className={`flex will-change-transform ${isVertical ? 'w-full flex-col' : ''}`}
              style={isVertical ? { width: '100%' } : { height: dims.itemHeight }}
            >
              {displayReel.reel.map((item, index) => (
                <div
                  key={`${item.skin.id}-${item.isRoyal ? 'royal' : 'skin'}-${index}-${rollKey}`}
                  className={`flex shrink-0 ${isVertical ? 'w-full flex-col' : ''}`}
                >
                  <ReelCard
                    item={item}
                    offset={offset}
                    index={index}
                    viewportSize={viewportSize}
                    rolling={phase === 'rolling'}
                    royal={showRoyalChrome}
                    highlight={index === highlightIndex}
                    dims={dims}
                    vertical={isVertical}
                    battleStyle={isBattleStyle}
                    battleLandHighlight={
                      isBattleStyle && phase === 'reveal' && index === highlightIndex
                    }
                    showLeadGlow={
                      isBattleStyle &&
                      roundBestDrop &&
                      index === highlightIndex &&
                      phase !== 'rolling' &&
                      phase !== 'intro'
                    }
                    revealSkin={
                      phase === 'reveal' && index === highlightIndex && item.isRoyal
                        ? rewardSkin
                        : undefined
                    }
                  />
                  {index < displayReel.reel.length - 1 && (
                    <ReelDivider
                      royal={showRoyalChrome}
                      dividerWidth={dims.dividerWidth}
                      vertical={isVertical}
                      transparent={isBattleStyle}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {phase === 'reveal' && !embedded ? (
              <motion.div
                key="reveal"
                className={isCompact ? 'mt-1.5 text-center' : 'mt-5 text-center'}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <p className={`font-display font-bold uppercase text-win ${dims.statusText}`}>
                  {rewardSkin.name}
                </p>
                <CoinPrice
                  value={rewardSkin.price}
                  iconClassName={`mx-auto mt-1 ${size === 'large' ? 'h-5 w-5' : isCompact ? 'h-3 w-3' : 'h-4 w-4'}`}
                  textClassName={`font-display font-black text-gold ${size === 'large' ? 'text-lg' : isCompact ? 'text-[10px]' : 'text-base'}`}
                  className={isCompact ? 'mt-0.5 justify-center' : 'mt-1.5 justify-center'}
                />

                {revealActionsVisible && (
                  <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={onSell}
                    className={SELL_BUTTON_CLASS}
                  >
                    Vender por{' '}
                    <CoinPrice
                      value={rewardSkin.price}
                      iconClassName="inline h-3 w-3"
                      textClassName="text-xs font-black text-white"
                      className="inline-flex align-middle"
                    />
                  </button>
                    <button
                      type="button"
                      onClick={onUpgrade}
                      className="rounded-xl bg-gradient-to-r from-[#9333ea] to-[#b56bff] px-6 py-2.5 font-display text-xs font-black uppercase tracking-[0.1em] text-white shadow-[0_0_20px_rgba(176,108,255,0.25)] transition hover:brightness-110"
                    >
                      Upgrade
                    </button>
                  </div>
                )}
              </motion.div>
            ) : (
              !isCompact && (
              <motion.p
                key="status"
                className={`mt-4 text-center text-[11px] uppercase tracking-[0.14em] ${
                  showRoyalChrome ? 'text-[#e8c56d]/55' : 'text-white/35'
                }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {phase === 'intro'
                  ? royalPass
                    ? 'Preparing BloxRoyal…'
                    : 'Preparing reel…'
                  : phase === 'royal-hold'
                    ? "You've activated BloxRoyal!"
                    : royalPass
                      ? 'Only the rarest skins drop…'
                      : 'The reel is spinning…'}
              </motion.p>
              )
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
