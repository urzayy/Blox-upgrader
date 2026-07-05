import { motion, AnimatePresence } from 'framer-motion';
import { SkinImage } from './SkinImage';
import { RARITY, type Skin } from '../../data/skins';
import { CoinPrice } from '../ui/CoinPrice';
import { inventoryTotal } from '../../lib/inventory';

interface Props {
  variant: 'input' | 'target';
  skin?: Skin | null;
  skins?: Skin[];
  onClear?: () => void;
}

export function SelectedSkinSlot({ variant, skin = null, skins = [], onClear }: Props) {
  const isInput = variant === 'input';
  const inputList = isInput ? skins : skin ? [skin] : [];
  const hasSelection = inputList.length > 0;
  const total = inventoryTotal(inputList);

  return (
    <div
      className={`relative flex flex-1 min-w-0 flex-col rounded-xl border bg-gradient-to-b from-[#1a1d26] to-panel p-3 ${
        isInput ? 'border-white/10' : 'border-gold/20 shadow-[inset_0_0_40px_rgba(255,215,0,0.04)]'
      }`}
    >
      {!(isInput && !hasSelection) && (
        <p className="mb-2 shrink-0 text-[10px] font-medium text-white/45 leading-snug">
          {isInput
            ? 'Selecciona hasta 5 skins de tu inventario abajo'
            : 'Selecciona la skin objetivo abajo'}
        </p>
      )}

      <div className="relative flex flex-1 min-h-[140px] flex-col overflow-hidden rounded-lg bg-[#12151c]/80">
        {!hasSelection ? (
          <EmptySlot isInput={isInput} />
        ) : isInput && inputList.length > 1 ? (
          <MultiInputDisplay skins={inputList} total={total} onClear={onClear} />
        ) : (
          <SingleSkinDisplay
            skin={inputList[0]}
            variant={variant}
            onClear={onClear}
          />
        )}

        <div
          className={`pointer-events-none absolute inset-0 rounded-lg opacity-40 ${
            isInput ? 'bg-gradient-to-t from-white/5 to-transparent' : 'bg-gradient-to-t from-gold/10 to-transparent'
          }`}
        />
      </div>

      {!hasSelection && (
        <div className="mt-2 flex justify-center gap-0.5 opacity-30">
          {[0, 1, 2].map(i => (
            <span key={i} className={`text-gold text-[10px] ${isInput ? '' : 'rotate-180'}`}>▼</span>
          ))}
        </div>
      )}
    </div>
  );
}

function SingleSkinDisplay({
  skin,
  variant,
  onClear,
}: {
  skin: Skin;
  variant: 'input' | 'target';
  onClear?: () => void;
}) {
  return (
    <motion.div
      key={skin.id}
      initial={{ opacity: 0, scale: 0.85, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      className="flex h-full w-full flex-col items-center justify-center p-3"
    >
      {onClear && <ClearSlotButton onClick={onClear} className="right-2 top-2" />}
      <div className="relative h-[110px] w-full max-w-[200px]">
        <SkinImage
          layoutId={variant === 'target' ? `skin-target-${skin.id}` : `skin-input-${skin.id}`}
          src={skin.image}
          alt={skin.name}
          zoom={1.18}
        />
      </div>
      <div className="mt-2 w-full text-center">
        <span
          className="text-[9px] font-bold uppercase tracking-wider"
          style={{ color: RARITY[skin.rarity].color }}
        >
          {RARITY[skin.rarity].label}
        </span>
        <p className="mt-0.5 truncate text-xs font-semibold text-white">{skin.name}</p>
        <p className="text-[9px] text-white/35">{skin.wear}</p>
        <CoinPrice value={skin.price} iconClassName="h-4 w-4" textClassName="font-display text-sm font-bold text-gold" className="mt-1 justify-center" />
      </div>
    </motion.div>
  );
}

function MultiInputDisplay({
  skins,
  total,
  onClear,
}: {
  skins: Skin[];
  total: number;
  onClear?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative flex h-full w-full flex-col p-2"
    >
      {onClear && <ClearSlotButton onClick={onClear} className="right-1.5 top-1.5" />}
      <div className="mb-2 flex items-center justify-between gap-2 px-1">
        <span className="text-[10px] font-semibold text-white/60">
          {skins.length} skins seleccionadas
        </span>
        <CoinPrice value={total} iconClassName="h-3 w-3" textClassName="font-display text-xs font-bold text-gold" />
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-2 gap-1.5 overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {skins.map(s => (
            <motion.div
              key={s.id}
              layout
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              className="flex flex-col items-center rounded-md border border-white/10 bg-black/20 p-1.5"
            >
              <div className="relative h-12 w-full">
                <SkinImage src={s.image} alt={s.name} zoom={1.13} />
              </div>
              <p className="mt-1 w-full truncate text-center text-[8px] text-white/70">{s.name}</p>
              <CoinPrice value={s.price} iconClassName="h-2.5 w-2.5" textClassName="text-[8px] font-bold text-gold" className="justify-center" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function EmptySlot({ isInput }: { isInput: boolean }) {
  if (isInput) {
    return (
      <div className="relative flex h-full w-full flex-col px-3 py-3">
        <p className="text-center text-[11px] font-semibold leading-snug text-white/90">
          Selecciona skins o skins y saldo para usar
        </p>
        <p className="mt-1 text-center text-[10px] text-white/40">
          Puedes seleccionar varias skins
        </p>

        <div className="relative mt-2 flex min-h-[100px] flex-1 items-center justify-center">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_55%,rgba(255,204,0,0.14)_0%,transparent_62%)]" />
          <img
            src="https://raw.githubusercontent.com/ByMykel/counter-strike-items/master/public/images/skins/weapon_ak47_cu_ak47_vulcan.png"
            alt=""
            className="pointer-events-none absolute max-h-[72%] max-w-[88%] -rotate-12 object-contain opacity-[0.14] grayscale"
          />
          <ChevronStack direction="down" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-full w-full flex-col px-3 py-3">
      <p className="text-center text-[11px] font-semibold leading-snug text-white/90">
        Selecciona la skin objetivo
      </p>
      <p className="mt-1 text-center text-[10px] text-white/40">
        Elige una skin del panel de abajo
      </p>

      <div className="relative mt-2 flex min-h-[100px] flex-1 items-center justify-center">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_55%,rgba(255,204,0,0.1)_0%,transparent_62%)]" />
        <img
          src="https://raw.githubusercontent.com/ByMykel/counter-strike-items/master/public/images/skins/weapon_awp_cu_awp_dragon_lore.png"
          alt=""
          className="pointer-events-none absolute max-h-[72%] max-w-[88%] -rotate-6 object-contain opacity-[0.12] grayscale"
        />
        <ChevronStack direction="down" />
      </div>
    </div>
  );
}

function ClearSlotButton({ onClick, className = '' }: { onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Quitar selección"
      className={`absolute z-10 flex h-8 w-8 items-center justify-center rounded-lg border border-gold/50 bg-gold/15 text-base font-bold text-gold shadow-[0_0_12px_rgba(255,215,0,0.25)] transition hover:border-gold hover:bg-gold/25 hover:text-[#FFE566] ${className}`}
    >
      ✕
    </button>
  );
}

function ChevronStack({ direction }: { direction: 'down' | 'up' }) {
  const flip = direction === 'up' ? 'rotate-180' : '';

  return (
    <div className={`relative z-10 flex flex-col items-center gap-[3px] ${flip}`}>
      <svg width="42" height="14" viewBox="0 0 42 14" className="opacity-45" aria-hidden="true">
        <path d="M6 4 L21 11 L36 4" fill="none" stroke="#B8860B" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <svg width="42" height="14" viewBox="0 0 42 14" className="drop-shadow-[0_0_10px_rgba(255,215,0,0.55)]" aria-hidden="true">
        <path d="M6 4 L21 11 L36 4" fill="none" stroke="#FFD700" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <svg width="42" height="14" viewBox="0 0 42 14" className="opacity-45" aria-hidden="true">
        <path d="M6 4 L21 11 L36 4" fill="none" stroke="#B8860B" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
