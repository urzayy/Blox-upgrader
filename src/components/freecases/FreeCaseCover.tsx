import { rankLabelForTier, type FreeCaseTier } from '../../lib/freeCaseTiers';
import { RoyalCrownBadge } from './RoyalCrownBadge';
import { CoinPrice } from '../ui/CoinPrice';

interface CoverProps {
  tier: FreeCaseTier;
  /** Larger chest for the case opener stage. */
  large?: boolean;
  /** Taller chest for catalog grid cards. */
  catalog?: boolean;
  /** No glow behind chest — flat catalog card art. */
  bare?: boolean;
}

export function TierIconBadge({ tier, ornate }: { tier: FreeCaseTier; ornate?: boolean }) {
  return (
    <div className="relative z-20 -mt-6 flex justify-center sm:-mt-7">
      <img
        src={tier.iconUrl}
        alt=""
        className={`h-12 w-12 object-contain drop-shadow-[0_6px_14px_rgba(0,0,0,0.55)] sm:h-14 sm:w-14 ${ornate ? 'sm:h-[3.75rem] sm:w-[3.75rem]' : ''}`}
        draggable={false}
      />
    </div>
  );
}

export function CaseChest({ tier, large, catalog, bare }: CoverProps) {
  const hasImage = Boolean(tier.image);

  return (
    <div className={`relative flex w-full items-end justify-center ${
      hasImage ? (catalog ? 'h-44 px-0 sm:h-52' : large ? 'h-40 px-0 sm:h-48' : 'h-36 px-0 sm:h-44') : catalog ? 'h-[11.8rem] sm:h-[14.4rem]' : large ? 'h-32 sm:h-36' : 'h-28 sm:h-32'
    }`}
    >
      {tier.image ? (
        <img
          src={tier.image}
          alt=""
          className="relative w-full object-contain object-bottom"
          style={{
            height: catalog ? 'clamp(12rem, 38vw, 16rem)' : large ? 'clamp(11rem, 44vw, 15rem)' : 'clamp(10.5rem, 42vw, 14rem)',
            mixBlendMode: tier.imageBlend,
            transform: tier.imageScale ? `scale(${tier.imageScale})` : undefined,
            transformOrigin: 'bottom center',
          }}
          draggable={false}
        />
      ) : (
        <>
          {!bare && (
            <div
              className={`pointer-events-none absolute bottom-2 rounded-full blur-2xl ${catalog ? 'h-24 w-32 sm:h-28 sm:w-36' : 'h-20 w-28 sm:h-24 sm:w-32'}`}
              style={{ backgroundColor: tier.glow }}
            />
          )}
          <svg
            viewBox="0 0 120 100"
            className={`relative ${catalog ? 'h-[10.5rem] w-[11.25rem] sm:h-[11.8rem] sm:w-[12.75rem]' : large ? 'h-28 w-32 sm:h-32 sm:w-36' : 'h-24 w-28 sm:h-28 sm:w-32'}`}
            aria-hidden="true"
          >
            <ellipse cx="60" cy="88" rx="42" ry="8" fill="rgba(0,0,0,0.45)" />
            <path d="M22 42 L60 18 L98 42 L98 78 Q60 86 22 78 Z" fill={tier.chest} opacity="0.95" />
            <path d="M22 42 L60 18 L98 42 L98 52 L22 52 Z" fill="rgba(255,255,255,0.18)" />
            <rect x="22" y="52" width="76" height="26" rx="2" fill={tier.chest} />
            <rect x="52" y="58" width="16" height="14" rx="2" fill="rgba(0,0,0,0.25)" />
            <path d="M34 52 Q60 58 86 52" stroke="rgba(255,255,255,0.2)" strokeWidth="2" fill="none" />
          </svg>
        </>
      )}
    </div>
  );
}

interface PortadaProps {
  tier: FreeCaseTier;
  large?: boolean;
  showFreeBadge?: boolean;
  /** Rank/star badge on the divider — daily free cases only. */
  showTierIcon?: boolean;
  /** Catalog grid card — taller, name + price pill, no tier labels. */
  catalogGrid?: boolean;
  /** Open price shown on catalog grid cards. */
  price?: number;
  title?: string;
  className?: string;
  hasRoyalLoot?: boolean;
}

/** Shared case cover — same look on grid cards and opener stage. */
export function FreeCasePortada({
  tier,
  large = false,
  showFreeBadge = false,
  showTierIcon = true,
  catalogGrid = false,
  price,
  title,
  className = '',
  hasRoyalLoot = false,
}: PortadaProps) {
  const ornate = tier.level >= 50;
  const label = title ?? rankLabelForTier(tier);

  if (catalogGrid) {
    const hasImage = Boolean(tier.image);

    if (hasImage) {
      return (
        <article
          className={`relative min-h-[21rem] overflow-hidden rounded-xl bg-[#1a1d26] sm:min-h-[23.625rem] ${className}`}
        >
          <img
            src={tier.image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-center"
            draggable={false}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0a0c12]/95 via-[#0a0c12]/35 to-transparent" />

          <div className="relative flex h-full min-h-[21rem] flex-col justify-end px-3 pb-3 sm:min-h-[23.625rem] sm:px-4 sm:pb-3.5">
            <h3 className="text-center font-display text-[15px] font-black uppercase tracking-[0.08em] text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)] sm:text-base">
              {title ?? tier.name}
            </h3>

            {price != null && (
              <div className="mt-2 flex justify-center">
                <div className="inline-flex items-center justify-center rounded-md bg-white px-3.5 py-1.5 transition group-hover:bg-white/95">
                  <CoinPrice
                    value={price}
                    iconClassName="h-3 w-3"
                    textClassName="font-display text-xs font-black text-black"
                  />
                </div>
              </div>
            )}
          </div>
        </article>
      );
    }

    return (
      <article
        className={`relative flex min-h-[21rem] flex-col overflow-hidden rounded-xl bg-[#1a1d26] sm:min-h-[23.625rem] ${className}`}
      >
        <div className="relative flex min-h-[13.9rem] flex-1 items-center justify-center px-5 pb-2 pt-6 sm:min-h-[16.5rem] sm:px-6 sm:pt-7">
          <CaseChest tier={tier} catalog bare />
        </div>

        <h3 className="px-4 py-2.5 text-center font-display text-[15px] font-black uppercase tracking-[0.08em] text-white sm:text-base">
          {title ?? tier.name}
        </h3>

        {price != null && (
          <div className="flex justify-center px-4 pb-3.5 sm:pb-4">
            <div className="inline-flex items-center justify-center rounded-md bg-white px-3.5 py-1.5 transition group-hover:bg-white/95">
              <CoinPrice
                value={price}
                iconClassName="h-3 w-3"
                textClassName="font-display text-xs font-black text-black"
              />
            </div>
          </div>
        )}
      </article>
    );
  }

  return (
    <article
      className={`relative flex flex-col overflow-visible rounded-xl border-2 bg-gradient-to-b p-3 pb-3.5 sm:p-4 ${tier.gradient} ${className}`}
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

      {showTierIcon && <TierIconBadge tier={tier} ornate={ornate} />}

      <div className="relative mt-1 flex flex-1 flex-col">
        {showFreeBadge ? (
          <>
            <h2 className="text-center font-display text-base font-black uppercase tracking-[0.14em] text-white sm:text-lg">
              {label}
            </h2>
            <div className="relative mt-2 flex justify-center">
              <span className="rounded-md bg-white px-2.5 py-0.5 font-display text-[10px] font-black uppercase tracking-wider text-black">
                Free
              </span>
            </div>
            <div className="mt-2">
              <CaseChest tier={tier} large={large} />
            </div>
          </>
        ) : (
          <>
            <CaseChest tier={tier} large={large} />
            <h3 className="mt-1 text-center font-display text-base font-black uppercase tracking-[0.12em] text-white sm:text-lg">
              {title ?? tier.name}
            </h3>
            {tier.level > 0 && (
              <p className="mt-0.5 text-center text-[10px] leading-snug text-black sm:text-[11px]">
                You will need level {tier.level} to open this case
              </p>
            )}
          </>
        )}
      </div>
    </article>
  );
}
