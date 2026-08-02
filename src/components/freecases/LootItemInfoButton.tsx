import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { LootRollRange } from '../../lib/lootRollRange';
import { formatLootOddsDisplay, formatLootRollRange } from '../../lib/lootRollRange';
import { CoinPrice } from '../ui/CoinPrice';
import { RoyalCrownBadge } from './RoyalCrownBadge';

function HexInfoIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
      <path
        d="M10 1.5 17.2 5.75V14.25L10 18.5 2.8 14.25V5.75L10 1.5Z"
        fill="rgba(255,255,255,0.92)"
        stroke="rgba(0,0,0,0.35)"
        strokeWidth="0.6"
      />
      <text
        x="10"
        y="12.5"
        textAnchor="middle"
        fontSize="9"
        fontWeight="700"
        fill="#111"
        fontFamily="system-ui, sans-serif"
      >
        i
      </text>
    </svg>
  );
}

interface InfoPopupProps {
  price: number;
  chance: number;
  rollRange: LootRollRange;
  anchorRect: DOMRect;
  onClose: () => void;
}

function InfoPopup({ price, chance, rollRange, anchorRect, onClose }: InfoPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (popupRef.current?.contains(target)) return;
      onClose();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  const left = Math.min(Math.max(anchorRect.left + anchorRect.width / 2 - 90, 8), window.innerWidth - 188);
  const top = anchorRect.bottom + 6;

  return createPortal(
    <div
      ref={popupRef}
      className="fixed z-[200] w-[180px] overflow-hidden rounded-md border border-white/10 bg-[#1a1a1a]/95 shadow-[0_8px_32px_rgba(0,0,0,0.65)] backdrop-blur-sm"
      style={{ left, top }}
    >
      <div className="divide-y divide-white/10 px-3 py-1.5">
        <div className="flex items-center justify-between gap-2 py-1.5">
          <span className="text-[9px] font-bold uppercase tracking-wide text-white/45">Price</span>
          <CoinPrice
            value={price}
            iconClassName="h-3 w-3"
            textClassName="text-[10px] font-bold text-gold"
          />
        </div>
        <div className="flex items-center justify-between gap-2 py-1.5">
          <span className="text-[9px] font-bold uppercase tracking-wide text-white/45">Range</span>
          <span className="font-mono text-[10px] font-semibold tabular-nums text-white/85">
            {formatLootRollRange(rollRange)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 py-1.5">
          <span className="text-[9px] font-bold uppercase tracking-wide text-white/45">Odds</span>
          <span className="font-mono text-[10px] font-semibold tabular-nums text-white/85">
            {formatLootOddsDisplay(chance)}
          </span>
        </div>
      </div>
    </div>,
    document.body,
  );
}

interface Props {
  price: number;
  chance: number;
  rollRange: LootRollRange;
  isRoyal?: boolean;
  className?: string;
}

export function LootItemInfoButton({ price, chance, rollRange, isRoyal, className = '' }: Props) {
  const [open, setOpen] = useState(false);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleToggle = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    if (open) {
      setOpen(false);
      return;
    }
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    setAnchorRect(rect);
    setOpen(true);
  };

  return (
    <>
      <div className={`absolute right-1.5 top-1.5 z-20 flex flex-col items-center gap-0.5 ${className}`}>
        {isRoyal && <RoyalCrownBadge inline />}
        <button
          ref={buttonRef}
          type="button"
          aria-label="Item odds info"
          onClick={handleToggle}
          className="inline-flex h-4 w-4 shrink-0 items-center justify-center transition hover:scale-110"
        >
          <HexInfoIcon />
        </button>
      </div>
      {open && anchorRect && (
        <InfoPopup
          price={price}
          chance={chance}
          rollRange={rollRange}
          anchorRect={anchorRect}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
