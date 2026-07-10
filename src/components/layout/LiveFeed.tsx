import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { findSkinByName, RARITY, type FeedItem, type RarityKey } from '../../data/skins';
import { LEGACY_FEED_NAME_ALIASES, resolveFeedSkinImage } from '../../lib/feedImages';

interface Props {
  items: FeedItem[];
  className?: string;
  variant?: 'sidebar' | 'top';
}

function feedsEqual(a: FeedItem[], b: FeedItem[]): boolean {
  if (a.length !== b.length) return false;
  if (a.length === 0) return true;
  return a[0].id === b[0].id && a[a.length - 1].id === b[b.length - 1].id;
}

function hexToRgba(hex: string, alpha: number): string {
  const raw = hex.replace('#', '');
  const full = raw.length === 3 ? raw.split('').map(c => c + c).join('') : raw;
  const num = Number.parseInt(full, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

function rarityCardTheme(rarityKey: RarityKey) {
  const { color, glow } = RARITY[rarityKey];
  return {
    color,
    glow,
    gradient: `linear-gradient(165deg, ${hexToRgba(color, 0.42)} 0%, ${hexToRgba(color, 0.16)} 30%, #100d1a 58%, #0a0814 100%)`,
    radial: `radial-gradient(ellipse 95% 75% at 50% 36%, ${glow} 0%, transparent 72%)`,
    ring: hexToRgba(color, 0.45),
  };
}

export const LiveFeed = memo(function LiveFeed({ items, className = '', variant = 'sidebar' }: Props) {
  if (variant === 'top') {
    return <LiveFeedTopBar items={items} className={className} />;
  }

  const visible = items.slice(0, 12);

  return (
    <aside className={`flex flex-col border-white/5 bg-panel/80 ${className}`}>
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
        <span className="font-display text-[11px] font-semibold tracking-[0.2em] text-white/50 uppercase">Live Feed</span>
        <span className="flex items-center gap-1.5 text-[10px] font-bold text-win">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-win" />
          LIVE
        </span>
      </div>
      <div className="flex flex-1 gap-2 overflow-x-auto overflow-y-hidden p-2 xl:max-h-[calc(100vh-80px)] xl:flex-col xl:overflow-y-auto">
        {visible.map(item => (
          <FeedRow key={item.id} item={item} />
        ))}
      </div>
    </aside>
  );
}, (prev, next) => feedsEqual(prev.items, next.items) && prev.className === next.className && prev.variant === next.variant);

function LiveFeedTopBar({ items, className }: { items: FeedItem[]; className?: string }) {
  const wins = useMemo(
    () => items.filter(item => item.won).slice(0, 40),
    [items],
  );

  const prevFirstIdRef = useRef<string | null>(null);
  const [pulseId, setPulseId] = useState<string | null>(null);

  useEffect(() => {
    const firstId = wins[0]?.id ?? null;
    if (prevFirstIdRef.current && firstId && firstId !== prevFirstIdRef.current) {
      setPulseId(firstId);
      const timer = setTimeout(() => setPulseId(null), 1500);
      prevFirstIdRef.current = firstId;
      return () => clearTimeout(timer);
    }
    prevFirstIdRef.current = firstId;
  }, [wins]);

  return (
    <div className={`shrink-0 border-b border-white/[0.06] bg-[#0b0d14] ${className}`}>
      <div className="flex min-h-[100px] items-stretch gap-1.5 overflow-x-auto px-2.5 py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex shrink-0 items-center gap-1.5 self-center pr-1">
          <span className="h-2 w-2 animate-pulse rounded-full bg-win shadow-[0_0_8px_rgba(0,230,118,0.7)]" />
          <span className="font-display text-[10px] font-bold tracking-[0.16em] text-white/35 uppercase">Live</span>
        </div>

        {wins.length === 0 ? (
          <div className="flex items-center text-[11px] text-white/25">Esperando upgrades…</div>
        ) : (
          <AnimatePresence initial={false} mode="popLayout">
            {wins.map(item => (
              <FeedTopCard
                key={item.id}
                item={item}
                isNew={item.id === pulseId}
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

const FeedTopCard = memo(function FeedTopCard({
  item,
  isNew,
}: {
  item: FeedItem;
  isNew?: boolean;
}) {
  const resolvedName = LEGACY_FEED_NAME_ALIASES[item.targetSkin] ?? item.targetSkin;
  const skin = findSkinByName(resolvedName) ?? findSkinByName(item.targetSkin);
  const theme = rarityCardTheme(skin?.rarity ?? 'consumer');
  const image = resolveFeedSkinImage(item.targetSkin, item.targetImage);
  const shortName = item.targetSkin.split('|').pop()?.trim() ?? item.targetSkin;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -36, scale: 0.82 }}
      animate={{
        opacity: 1,
        x: 0,
        scale: isNew ? [0.82, 1.08, 1] : 1,
      }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{
        type: 'spring',
        stiffness: 460,
        damping: 30,
        mass: 0.75,
      }}
      className="group relative h-[96px] w-[74px] shrink-0 overflow-hidden rounded-[6px] border border-white/[0.06] shadow-[0_4px_16px_rgba(0,0,0,0.45)]"
      style={{ background: theme.gradient }}
      title={`${item.username} ganó ${item.targetSkin}`}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 z-20 block h-0 w-0"
        style={{
          borderTop: `16px solid ${theme.color}`,
          borderRight: '16px solid transparent',
          filter: `drop-shadow(0 0 6px ${theme.glow})`,
        }}
      />

      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: theme.radial }}
      />

      <img
        src="/logo.png"
        alt=""
        aria-hidden
        draggable={false}
        className="pointer-events-none absolute left-1/2 top-[38%] z-[5] h-11 w-11 -translate-x-1/2 -translate-y-1/2 object-contain opacity-[0.12]"
      />

      <div className="absolute inset-x-0 top-[14px] z-10 flex justify-center px-1">
        {image ? (
          <motion.img
            src={image}
            alt={item.targetSkin}
            loading="lazy"
            draggable={false}
            animate={isNew ? { y: [4, 0], scale: [0.9, 1.05, 1] } : { y: 0, scale: 1 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="pointer-events-none h-[52px] w-[52px] object-contain drop-shadow-[0_6px_14px_rgba(0,0,0,0.65)]"
            onError={e => {
              (e.target as HTMLImageElement).style.opacity = '0.2';
            }}
          />
        ) : (
          <div className="flex h-[52px] w-[52px] items-center justify-center text-[9px] text-white/20">?</div>
        )}
      </div>

      <p className="absolute inset-x-0 bottom-[7px] z-10 truncate px-1.5 text-center text-[9px] font-bold leading-tight text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
        {shortName}
      </p>

      {isNew && (
        <>
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-0 z-30"
            initial={{ opacity: 0.85, x: '-120%' }}
            animate={{ opacity: 0, x: '120%' }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            style={{
              background: `linear-gradient(105deg, transparent 35%, ${hexToRgba(theme.color, 0.55)} 50%, transparent 65%)`,
            }}
          />
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-0 z-10 rounded-[6px]"
            initial={{ opacity: 0.7, boxShadow: `0 0 0 0 ${theme.ring}` }}
            animate={{ opacity: 0, boxShadow: `0 0 22px 6px ${theme.ring}` }}
            transition={{ duration: 1.1, ease: 'easeOut' }}
          />
        </>
      )}
    </motion.div>
  );
});

const FeedRow = memo(function FeedRow({ item }: { item: FeedItem }) {
  const skin = item.won ? findSkinByName(item.targetSkin) : findSkinByName(item.inputSkin);
  const theme = rarityCardTheme(skin?.rarity ?? 'consumer');
  const label = item.won ? item.targetSkin : item.inputSkin;
  const image = resolveFeedSkinImage(label, item.won ? item.targetImage : item.inputImage);

  return (
    <div
      className="mb-0 w-[240px] shrink-0 rounded-lg border p-2.5 xl:mb-2 xl:w-auto"
      style={{
        borderColor: hexToRgba(theme.color, 0.28),
        background: theme.gradient,
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-xs font-bold text-white">{item.username}</span>
        <span className="shrink-0 text-[10px] font-display font-bold" style={{ color: theme.color }}>
          {item.probability}%
        </span>
      </div>

      <div className="mt-2 flex justify-center">
        <FeedSkinImage src={image} alt={label} theme={theme} />
      </div>

      <p className="mt-2 truncate text-center text-[11px] font-semibold text-white">
        {label}
      </p>

      <div className="mt-1 truncate text-center text-[10px] text-white/40">
        {item.inputSkin} → {item.targetSkin}
      </div>
    </div>
  );
});

function FeedSkinImage({
  src,
  alt,
  theme,
}: {
  src?: string;
  alt: string;
  theme: ReturnType<typeof rarityCardTheme>;
}) {
  return (
    <div
      className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border bg-[#141024]"
      style={{ borderColor: hexToRgba(theme.color, 0.4), boxShadow: `0 0 12px ${theme.glow}` }}
      title={alt}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          draggable={false}
          className="pointer-events-none h-full w-full object-contain p-1"
          onError={e => {
            (e.target as HTMLImageElement).style.opacity = '0.2';
          }}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-[9px] text-white/25">?</div>
      )}
    </div>
  );
}
