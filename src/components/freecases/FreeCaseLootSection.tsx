import { CoinPrice } from '../ui/CoinPrice';
import { RARITY } from '../../data/skins';
import { formatLootChance, type FreeCaseLootItem } from '../../lib/freeCaseLoot';
import { isRoyalLootChance } from '../../lib/freeCaseRoyal';
import { RoyalCrownBadge } from './RoyalCrownBadge';
import { SkinImage } from '../skins/SkinImage';

function splitSkinName(name: string): { weapon: string; skin: string } {
  const parts = name.split('|').map(part => part.trim());
  if (parts.length >= 2) {
    return { weapon: parts[0], skin: parts.slice(1).join(' | ') };
  }
  return { weapon: name, skin: '' };
}

function DiagonalLines() {
  return (
    <span className="font-mono text-[10px] font-bold tracking-tighter text-white/20" aria-hidden="true">
      //////////////////////
    </span>
  );
}

function LootChanceCard({ item, large }: { item: FreeCaseLootItem; large?: boolean }) {
  const r = RARITY[item.skin.rarity];
  const { weapon, skin: skinName } = splitSkinName(item.skin.name);
  const isRoyal = isRoyalLootChance(item.chance);

  return (
    <article
      className={`relative flex flex-col overflow-hidden rounded-lg border border-violet-500/20 bg-[#141024]/95 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.55)] ${
        large ? 'rounded-xl' : ''
      }`}
      style={{ boxShadow: `inset 0 0 0 1px rgba(124,58,237,0.08), 0 8px 24px -8px rgba(0,0,0,0.55)` }}
    >
      {isRoyal && <RoyalCrownBadge />}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{ background: `radial-gradient(circle at 50% 30%, ${r.color}, transparent 70%)` }}
      />

      <div className={`relative px-3 pb-2 ${large ? 'pt-4 sm:px-4' : 'pt-3'}`}>
        <p className={`truncate font-semibold text-white/70 ${large ? 'text-xs sm:text-sm' : 'text-[11px]'}`}>
          {weapon}
        </p>
        {skinName && (
          <p className={`truncate font-bold ${large ? 'text-sm sm:text-base' : 'text-sm'}`} style={{ color: r.color }}>
            {skinName}
          </p>
        )}
      </div>

      <div className={`relative mx-auto w-full px-3 ${large ? 'h-28 sm:h-32 sm:px-4' : 'h-24 sm:h-28'}`}>
        <SkinImage src={item.skin.image} alt={item.skin.name} zoom={1.1} />
      </div>

      <div className={`relative mt-auto border-t border-violet-500/15 bg-[#0c0a14]/80 px-3 py-2.5 ${large ? 'sm:px-4 sm:py-3' : ''}`}>
        <CoinPrice
          value={item.skin.price}
          iconClassName={large ? 'h-3 w-3' : 'h-2.5 w-2.5'}
          textClassName={`font-bold text-gold/80 font-display ${large ? 'text-xs' : 'text-[10px]'}`}
        />
        <p className={`mt-1 font-bold uppercase tracking-[0.14em] text-white/35 ${large ? 'text-[10px]' : 'text-[9px]'}`}>
          Chance
        </p>
        <p className={`font-display font-black tabular-nums text-white/90 ${large ? 'text-base' : 'text-sm'}`}>
          {formatLootChance(item.chance)}
        </p>
      </div>
    </article>
  );
}

interface Props {
  loot: FreeCaseLootItem[];
  large?: boolean;
}

export function FreeCaseLootSection({ loot, large }: Props) {
  if (!loot.length) return null;

  const compactCentered = loot.length <= 6;
  const cardWrapClass = large
    ? loot.length <= 4
      ? 'w-[calc(50%-0.375rem)] max-w-[13rem] sm:w-52'
      : 'w-[calc(50%-0.375rem)] max-w-[12.5rem] sm:w-[calc(33.333%-0.75rem)] sm:max-w-[13rem] md:w-48 lg:w-52'
    : loot.length <= 4
      ? 'w-[calc(50%-0.375rem)] max-w-[11rem] sm:w-44'
      : 'w-[calc(50%-0.375rem)] max-w-[10.5rem] sm:w-[calc(33.333%-0.75rem)] sm:max-w-[11rem] md:w-40 lg:w-44';

  return (
    <section className={`mx-auto mt-8 ${compactCentered ? (large ? 'max-w-7xl' : 'max-w-6xl') : large ? 'max-w-6xl' : 'max-w-5xl'}`}>
      <div className="mb-4 flex items-center justify-center gap-3 sm:gap-4">
        <DiagonalLines />
        <h2
          className={`shrink-0 font-display font-black uppercase tracking-[0.2em] text-white/80 ${
            large ? 'text-sm sm:text-base' : 'text-xs sm:text-sm'
          }`}
        >
          Skins in this case
        </h2>
        <DiagonalLines />
      </div>

      {compactCentered ? (
        <div className={`flex flex-wrap justify-center ${large ? 'gap-4 sm:gap-5' : 'gap-3 sm:gap-4'}`}>
          {loot.map(item => (
            <div key={item.skin.id} className={cardWrapClass}>
              <LootChanceCard item={item} large={large} />
            </div>
          ))}
        </div>
      ) : (
        <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 ${large ? 'gap-4 sm:gap-5' : 'gap-3 sm:gap-4'}`}>
          {loot.map(item => (
            <LootChanceCard key={item.skin.id} item={item} large={large} />
          ))}
        </div>
      )}
    </section>
  );
}
