import type { FreeCaseTier } from '../../lib/freeCaseTiers';
import type { Skin } from '../../data/skins';
import type { FreeCaseLootItem } from '../../lib/freeCaseLoot';
import { CoinPrice } from '../ui/CoinPrice';
import { RoyalCrownBadge } from './RoyalCrownBadge';
import { PreviewSkinCard } from './PreviewSkinCard';

interface Props {
  tier: FreeCaseTier;
  title: string;
  leftSkins: Skin[];
  rightSkins: Skin[];
  loot: FreeCaseLootItem[];
  price?: number;
  hasRoyalLoot?: boolean;
  jokerMode?: boolean;
}

function chanceForSkin(loot: FreeCaseLootItem[], skinId: string): number | undefined {
  return loot.find(item => item.skin.id === skinId)?.chance;
}

function StageCenterCase({
  tier,
  title,
  price,
  hasRoyalLoot,
  jokerMode,
}: Omit<Props, 'leftSkins' | 'rightSkins' | 'loot'>) {
  if (tier.image) {
    return (
      <article className="relative w-[10.5rem] shrink-0 overflow-hidden rounded-xl bg-[#1a1d26] shadow-[0_16px_48px_-12px_rgba(0,0,0,0.75)] sm:w-[12.5rem] lg:w-[14rem]">
        <img
          src={tier.image}
          alt=""
          className="h-[16.5rem] w-full object-cover object-center sm:h-[18.5rem] lg:h-[20rem]"
          draggable={false}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0a0c12]/95 via-[#0a0c12]/20 to-transparent" />
        {hasRoyalLoot && <RoyalCrownBadge className="right-2 top-2" size="md" />}

        <div className="absolute inset-x-0 bottom-0 px-3 pb-3 pt-8 sm:px-4 sm:pb-3.5">
          <h3 className="text-center font-display text-sm font-black uppercase tracking-[0.08em] text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)] sm:text-base">
            {title}
          </h3>
          {price != null && (
            <div className="mt-2 flex flex-col items-center gap-1.5">
              <div className="inline-flex items-center justify-center rounded-md bg-white px-3.5 py-1.5">
                <CoinPrice
                  value={price}
                  iconClassName="h-3 w-3"
                  textClassName="font-display text-xs font-black text-black"
                />
              </div>
              {jokerMode && (
                <p className="font-display text-[9px] font-black uppercase tracking-[0.14em] text-[#b56bff] drop-shadow-[0_0_10px_rgba(181,107,255,0.45)] sm:text-[10px]">
                  MODO JOKER ACTIVADO
                </p>
              )}
            </div>
          )}
        </div>
      </article>
    );
  }

  return (
    <article
      className={`relative flex w-[10.5rem] shrink-0 flex-col overflow-hidden rounded-xl border-2 bg-gradient-to-b p-3 sm:w-[12.5rem] lg:w-[14rem] ${tier.gradient}`}
      style={{
        borderColor: `${tier.accent}bf`,
        boxShadow: `0 10px 28px -8px rgba(0,0,0,0.55), 0 0 32px -8px ${tier.glow}`,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{ background: `radial-gradient(ellipse at 50% 0%, ${tier.glow}, transparent 70%)` }}
      />
      {hasRoyalLoot && <RoyalCrownBadge className="right-2 top-2" size="md" />}
      <div className="relative flex min-h-[16rem] flex-1 flex-col justify-end sm:min-h-[18rem]">
        <h3 className="text-center font-display text-sm font-black uppercase tracking-[0.1em] text-white sm:text-base">
          {title}
        </h3>
        {price != null && (
          <div className="mt-2 flex flex-col items-center gap-1.5">
            <div className="inline-flex items-center justify-center rounded-md bg-white px-3.5 py-1.5">
              <CoinPrice
                value={price}
                iconClassName="h-3 w-3"
                textClassName="font-display text-xs font-black text-black"
              />
            </div>
            {jokerMode && (
              <p className="font-display text-[9px] font-black uppercase tracking-[0.14em] text-[#b56bff] drop-shadow-[0_0_10px_rgba(181,107,255,0.45)] sm:text-[10px]">
                MODO JOKER ACTIVADO
              </p>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

export function CaseOpenPreview({
  tier,
  title,
  leftSkins,
  rightSkins,
  loot,
  price,
  hasRoyalLoot,
  jokerMode,
}: Props) {
  return (
    <div className="relative w-full overflow-hidden">
      <div className="flex items-center justify-center gap-1.5 px-1 sm:gap-2.5 sm:px-2 lg:gap-3">
        <div className="flex items-center gap-1.5 sm:gap-2">
          {leftSkins.map((skin, index) => (
            <PreviewSkinCard
              key={skin.id}
              skin={skin}
              chance={chanceForSkin(loot, skin.id)}
              edge={index === 0}
            />
          ))}
        </div>

        <StageCenterCase
          tier={tier}
          title={title}
          price={price}
          hasRoyalLoot={hasRoyalLoot}
          jokerMode={jokerMode}
        />

        <div className="flex items-center gap-1.5 sm:gap-2">
          {rightSkins.map((skin, index) => (
            <PreviewSkinCard
              key={skin.id}
              skin={skin}
              chance={chanceForSkin(loot, skin.id)}
              edge={index === rightSkins.length - 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
