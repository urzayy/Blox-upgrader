import type { Skin } from '../../data/skins';
import { SkinCard } from './SkinCard';

interface Props {
  skins: Skin[];
  selected: Skin[];
  maxSelected: number;
  lockedSkinIds?: ReadonlySet<string>;
  onSelect: (s: Skin) => void;
  onSell: (s: Skin) => void;
}

export function InventoryPanel({ skins, selected, maxSelected, lockedSkinIds, onSelect, onSell }: Props) {
  const selectedIds = new Set(selected.map(s => s.id));
  const atMax = selected.length >= maxSelected;
  const lockedCount = lockedSkinIds?.size ?? 0;

  return (
    <section className="flex flex-col min-h-0 overflow-hidden rounded-xl border border-white/8 bg-panel/95">
      <div className="flex shrink-0 items-center justify-between border-b border-white/5 px-3 py-2">
        <h2 className="font-display text-[11px] font-bold tracking-[0.12em] text-white/70 uppercase">
          My Inventory
        </h2>
        <span className={`text-[10px] ${atMax ? 'text-gold/80' : 'text-white/35'}`}>
          {skins.length} skins · {selected.length}/{maxSelected} max
          {lockedCount > 0 && (
            <span className="text-gold/70"> · {lockedCount} locked</span>
          )}
        </span>
      </div>      <div className="grid flex-1 min-h-0 grid-cols-3 content-start items-start auto-rows-max sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 overflow-y-auto p-2">
        {skins.map(s => (
          <SkinCard
            key={s.id}
            skin={s}
            selected={selectedIds.has(s.id)}
            locked={lockedSkinIds?.has(s.id)}
            variant="inventory"
            layoutIdPrefix={selectedIds.has(s.id) && selected.length === 1 ? 'input' : undefined}
            onSelect={onSelect}
            onSell={onSell}
            compact
          />
        ))}
      </div>
    </section>
  );
}
