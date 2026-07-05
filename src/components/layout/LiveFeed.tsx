import { memo } from 'react';
import { findSkinImageByName, type FeedItem } from '../../data/skins';

interface Props {
  items: FeedItem[];
  className?: string;
}

function feedsEqual(a: FeedItem[], b: FeedItem[]): boolean {
  if (a.length !== b.length) return false;
  if (a.length === 0) return true;
  return a[0].id === b[0].id && a[a.length - 1].id === b[b.length - 1].id;
}

export const LiveFeed = memo(function LiveFeed({ items, className = '' }: Props) {
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
}, (prev, next) => feedsEqual(prev.items, next.items) && prev.className === next.className);

const FeedRow = memo(function FeedRow({ item }: { item: FeedItem }) {
  const inputImage = item.inputImage ?? findSkinImageByName(item.inputSkin);
  const targetImage = item.targetImage ?? findSkinImageByName(item.targetSkin);

  return (
    <div
      className={`mb-0 shrink-0 rounded-lg border p-2.5 xl:mb-2 xl:w-auto w-[240px] ${
        item.won ? 'border-win/20 bg-win/5' : 'border-risk/20 bg-risk/5'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-xs font-bold text-white">{item.username}</span>
        <span className={`shrink-0 text-[10px] font-display font-bold ${item.won ? 'text-win' : 'text-risk'}`}>
          {item.won ? 'WIN' : 'LOSE'}
        </span>
      </div>

      <div className="mt-2 flex items-center justify-center gap-1.5">
        <FeedSkinThumb
          src={inputImage}
          alt={item.inputSkin}
          emphasis={!item.won}
          tone={item.won ? 'muted' : 'lose'}
        />
        <span className="text-[11px] text-white/30">→</span>
        <FeedSkinThumb
          src={targetImage}
          alt={item.targetSkin}
          emphasis={item.won}
          tone={item.won ? 'win' : 'muted'}
        />
      </div>

      <div className="mt-1.5 truncate text-center text-[10px] text-white/50">{item.inputSkin}</div>
      <div className="truncate text-center text-[10px] text-gold/80">→ {item.targetSkin}</div>
      <div className="mt-1 text-center text-[10px] font-display text-white/40">{item.probability}% chance</div>
    </div>
  );
});

function FeedSkinThumb({
  src,
  alt,
  emphasis = false,
  tone = 'neutral',
}: {
  src?: string;
  alt: string;
  emphasis?: boolean;
  tone?: 'win' | 'lose' | 'muted' | 'neutral';
}) {
  const box = 'h-9 w-9';

  const ring =
    tone === 'win'
      ? 'ring-win/50'
      : tone === 'lose'
        ? 'ring-risk/50'
        : tone === 'muted'
          ? 'ring-white/10'
          : 'ring-white/15';

  const opacity = tone === 'muted' ? 'opacity-45' : emphasis ? 'opacity-100' : 'opacity-70';

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-md border border-white/10 bg-[#141820] ${box} ${
        emphasis ? `ring-1 ${ring}` : ''
      } ${opacity}`}
      title={alt}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          draggable={false}
          className="pointer-events-none h-full w-full object-contain p-0.5"
          onError={e => {
            (e.target as HTMLImageElement).style.opacity = '0.2';
          }}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-[8px] text-white/20">?</div>
      )}
    </div>
  );
}
