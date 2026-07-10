import { RARITY, type RarityKey } from '../../data/skins';
import { CoinPrice } from '../ui/CoinPrice';
import { SkinImage } from '../skins/SkinImage';
import { formatGiveawayWinnerAgo, useGiveawayWinners } from '../../hooks/useGiveawayWinners';
import { splitSkinDisplayName } from '../../lib/giveaways';

function wearShort(wear: string): string {
  const map: Record<string, string> = {
    'Factory New': 'FN',
    'Minimal Wear': 'MW',
    'Field-Tested': 'FT',
    'Well-Worn': 'WW',
    'Battle-Scarred': 'BS',
  };
  return map[wear] ?? wear.slice(0, 2).toUpperCase();
}

export function LastGiveawayWinners() {
  const winners = useGiveawayWinners(20);

  if (!winners.length) return null;

  return (
    <section className="relative mt-8 overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0b0a12]/90 p-3 sm:p-4">
      <div className="flex gap-3 sm:gap-4">
        <div className="flex shrink-0 items-center justify-center px-1 sm:px-2">
          <p className="font-display text-[10px] font-black uppercase tracking-[0.2em] text-white/35 [writing-mode:vertical-rl] rotate-180">
            Últimos ganadores
          </p>
        </div>

        <div className="min-w-0 flex-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex gap-2.5 pb-1">
            {winners.map(winner => {
              const { weaponLabel, skinName } = splitSkinDisplayName(winner.skin.name);
              const rarity = RARITY[winner.skin.rarity as RarityKey] ?? RARITY.classified;
              return (
                <article
                  key={winner.id}
                  className="relative w-[148px] shrink-0 overflow-hidden rounded-xl border border-white/[0.08] sm:w-[164px]"
                  style={{
                    background: `linear-gradient(180deg, ${rarity.color}22 0%, #12101c 55%, #0a0812 100%)`,
                    boxShadow: `inset 0 0 24px ${rarity.glow}`,
                  }}
                >
                  <span className="absolute right-2 top-2 z-10 font-display text-[9px] font-bold uppercase tracking-wide text-white/35">
                    {formatGiveawayWinnerAgo(winner.wonAt)}
                  </span>
                  <div className="flex h-24 items-center justify-center px-2 pt-5 sm:h-28">
                    <SkinImage src={winner.skin.image} alt={winner.skin.name} zoom={1.05} />
                  </div>
                  <div className="border-t border-white/[0.06] bg-black/25 px-2.5 py-2">
                    <p className="truncate font-display text-[9px] font-bold uppercase tracking-wide text-white/45">
                      {weaponLabel} | {wearShort(winner.skin.wear)}
                    </p>
                    <p className="truncate font-display text-[11px] font-black uppercase tracking-wide text-white">
                      {skinName}
                    </p>
                    <div className="mt-1.5 inline-flex rounded-md border border-white/10 bg-black/30 px-2 py-0.5">
                      <CoinPrice
                        value={winner.skin.price}
                        iconClassName="h-3 w-3"
                        textClassName="font-display text-[10px] font-bold text-amber-300"
                      />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
