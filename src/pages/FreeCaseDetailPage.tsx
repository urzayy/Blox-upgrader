import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { navigateApp, navigateFreeCase } from '../lib/appRoute';
import {
  FREE_CASE_TIERS,
  getAdjacentCaseSlugs,
  getFreeCaseBySlug,
  rankLabelForTier,
} from '../lib/freeCaseTiers';
import { getFreeCaseLoot } from '../lib/freeCaseLoot';
import { useFreeCaseCooldown } from '../hooks/useFreeCaseCooldown';
import { usePlayerLevel } from '../hooks/usePlayerLevel';
import { useAuth } from '../context/AuthContext';
import { recordFreeCaseOpen } from '../lib/freeCaseCooldown';
import { createGrantedFreeCaseSkin, pickFreeCaseReward } from '../lib/freeCaseOpen';
import { loadInventory, saveInventory } from '../lib/inventoryStorage';
import type { Skin } from '../data/skins';
import { FreeCasePortada } from '../components/freecases/FreeCaseCover';
import { FreeCaseLootSection } from '../components/freecases/FreeCaseLootSection';
import { FreeCaseReelOpener } from '../components/freecases/FreeCaseReelOpener';
import { buildFreeCaseReel, type FreeCaseReelResult } from '../lib/freeCaseReel';
import { isFreeCaseUnlockedForPlayer } from '../lib/devFreeCaseBypass';
import { caseHasRoyalLoot } from '../lib/freeCaseRoyal';
import { requestSellSkin, requestSyncPlayerState, requestUpgradeWithSkin } from '../lib/uiActions';

interface Props {
  slug: string;
}

function IconButton({
  label,
  onClick,
  disabled,
  active,
  children,
}: {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`flex h-10 w-10 items-center justify-center rounded-lg border transition sm:h-11 sm:w-11 ${
        active
          ? 'border-gold/50 bg-gold/15 text-gold shadow-[0_0_16px_rgba(176,108,255,0.2)]'
          : 'border-white/10 bg-[#141024]/80 text-white/55 hover:border-violet-500/30 hover:text-violet-200'
      } disabled:cursor-not-allowed disabled:opacity-35`}
    >
      {children}
    </button>
  );
}

export function FreeCaseDetailPage({ slug }: Props) {
  const tier = getFreeCaseBySlug(slug);
  const { user, openLogin } = useAuth();
  const { level: playerLevel } = usePlayerLevel();
  const { ready, timer } = useFreeCaseCooldown(slug);
  const [turbo, setTurbo] = useState(false);
  const [rollTurbo, setRollTurbo] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [opening, setOpening] = useState(false);
  const [openingSlug, setOpeningSlug] = useState<string | null>(null);
  const [reelResult, setReelResult] = useState<FreeCaseReelResult | null>(null);
  const [grantedSkin, setGrantedSkin] = useState<Skin | null>(null);
  const [lastReward, setLastReward] = useState<Skin | null>(null);
  const openedAtRef = useRef(0);
  const grantedRef = useRef(false);
  const { loot } = getFreeCaseLoot(slug);
  const { prev, next } = getAdjacentCaseSlugs(slug);

  useEffect(() => {
    if (!tier) navigateApp('free-cases');
  }, [tier]);

  const closeReel = useCallback(() => {
    setReelResult(null);
    setGrantedSkin(null);
    setOpening(false);
    setOpeningSlug(null);
    grantedRef.current = false;
  }, []);

  useEffect(() => {
    closeReel();
  }, [slug, closeReel]);

  if (!tier) return null;

  const unlocked = isFreeCaseUnlockedForPlayer(tier.level, playerLevel, slug);
  const tierIndex = FREE_CASE_TIERS.findIndex(t => t.level === tier.level);

  const handleOpenCase = () => {
    if (!user || !unlocked || !ready || opening) return;

    const rewardBase = pickFreeCaseReward(slug);
    if (!rewardBase) return;

    openedAtRef.current = Date.now();
    grantedRef.current = false;
    setGrantedSkin(null);
    setRollTurbo(turbo);
    setOpeningSlug(slug);
    setReelResult(buildFreeCaseReel(slug, rewardBase));
    setOpening(true);
  };

  const handleReelReveal = () => {
    if (!user || !reelResult || grantedRef.current || openingSlug !== slug) return;

    grantedRef.current = true;
    const granted = createGrantedFreeCaseSkin(reelResult.rewardSkin, openedAtRef.current);
    const inventory = loadInventory(user.userId);
    saveInventory([...inventory, granted], user.userId);
    recordFreeCaseOpen(user.userId, slug);
    setGrantedSkin(granted);
    setLastReward(granted);
    requestSyncPlayerState();
  };

  const handleSellReward = () => {
    if (!grantedSkin) return;
    requestSellSkin(grantedSkin);
    requestSyncPlayerState();
    closeReel();
  };

  const handleUpgradeReward = () => {
    if (!grantedSkin) return;
    requestUpgradeWithSkin(grantedSkin);
    closeReel();
  };

  const showReel = opening && reelResult && openingSlug === slug;

  return (
    <div className="relative w-full overflow-hidden px-2 py-4 pb-8 sm:px-4 lg:px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_0%,rgba(124,58,237,0.14),transparent)]" />
      <div className="pointer-events-none absolute -left-20 top-10 h-64 w-64 rounded-full bg-violet-600/15 blur-[90px]" />
      <div className="pointer-events-none absolute -right-16 top-24 h-72 w-72 rounded-full bg-fuchsia-600/10 blur-[100px]" />

      <section className="relative mx-auto max-w-5xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <IconButton label="Back to all cases" disabled={opening} onClick={() => navigateApp('free-cases')}>
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden="true">
              <path d="M11.78 3.22a.75.75 0 0 1 0 1.06L7.06 9l4.72 4.72a.75.75 0 1 1-1.06 1.06l-5.25-5.25a.75.75 0 0 1 0-1.06l5.25-5.25a.75.75 0 0 1 1.06 0z" />
            </svg>
          </IconButton>

          <div className="flex items-center gap-2">
            <IconButton
              label="Previous case"
              disabled={!prev || opening}
              onClick={() => prev && !opening && navigateFreeCase(prev)}
            >
              <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                <path d="M11.78 3.22a.75.75 0 0 1 0 1.06L7.06 9l4.72 4.72a.75.75 0 1 1-1.06 1.06l-5.25-5.25a.75.75 0 0 1 0-1.06l5.25-5.25a.75.75 0 0 1 1.06 0z" />
              </svg>
            </IconButton>

            <span className="hidden min-w-[5rem] text-center font-display text-[10px] font-bold uppercase tracking-[0.16em] text-white/40 sm:inline">
              {tierIndex + 1} / {FREE_CASE_TIERS.length}
            </span>

            <IconButton
              label="Next case"
              disabled={!next || opening}
              onClick={() => next && !opening && navigateFreeCase(next)}
            >
              <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                <path d="M8.22 3.22a.75.75 0 0 1 1.06 0l5.25 5.25a.75.75 0 0 1 0 1.06l-5.25 5.25a.75.75 0 0 1-1.06-1.06L12.94 10 8.22 5.28a.75.75 0 0 1 0-1.06z" />
              </svg>
            </IconButton>
          </div>

          <div className="flex items-center gap-2">
            <IconButton
              label={turbo ? 'Desactivar apertura rápida' : 'Activar apertura rápida'}
              active={turbo}
              disabled={opening}
              onClick={() => setTurbo(v => !v)}
            >
              <svg
                viewBox="0 0 24 24"
                className={`h-5 w-5 transition ${turbo ? 'drop-shadow-[0_0_6px_rgba(176,108,255,0.8)]' : 'opacity-70'}`}
                aria-hidden="true"
              >
                <path
                  d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"
                  fill={turbo ? '#B56BFF' : 'currentColor'}
                  stroke="#0a0a0a"
                  strokeWidth="1.25"
                  strokeLinejoin="round"
                />
              </svg>
            </IconButton>

            <IconButton
              label={soundOn ? 'Mute sounds' : 'Enable sounds'}
              onClick={() => setSoundOn(v => !v)}
            >
              {soundOn ? (
                <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                  <path d="M8.5 4.5A.5.5 0 0 0 8 5v10a.5.5 0 0 0 .8.4L13 12h2.5a1.5 1.5 0 0 0 1.5-1.5v-1A1.5 1.5 0 0 0 15.5 8H13L8.8 4.6a.5.5 0 0 0-.3-.1zM6 6.7V13.3A2 2 0 0 1 4 15H3.5A.5.5 0 0 1 3 14.5v-9A.5.5 0 0 1 3.5 5H4a2 2 0 0 1 2 1.7z" />
                </svg>
              ) : (
                <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                  <path d="M8.5 4.5A.5.5 0 0 0 8 5v10a.5.5 0 0 0 .8.4L13 12h2.5a1.5 1.5 0 0 0 1.5-1.5v-1A1.5 1.5 0 0 0 15.5 8H13L8.8 4.6a.5.5 0 0 0-.3-.1zM4.3 6.3a.5.5 0 0 1 .7 0L7 8.3l1.9-1.9a.5.5 0 1 1 .7.7L7.7 9l1.9 1.9a.5.5 0 1 1-.7.7L7 9.7l-1.9 1.9a.5.5 0 0 1-.7-.7L6.3 9 4.4 7.1a.5.5 0 0 1 0-.7z" />
                </svg>
              )}
            </IconButton>
          </div>
        </div>

        <div className="relative mx-auto min-h-[18rem] max-w-5xl sm:min-h-[20rem] lg:max-w-6xl">
          {showReel ? (
            <FreeCaseReelOpener
              key={`${openingSlug}-${openedAtRef.current}`}
              active
              caseSlug={slug}
              result={reelResult}
              grantedSkin={grantedSkin}
              caseLabel={rankLabelForTier(tier)}
              turbo={rollTurbo}
              soundOn={soundOn}
              onReveal={handleReelReveal}
              onSell={handleSellReward}
              onUpgrade={handleUpgradeReward}
            />
          ) : (
            <div className="flex min-h-[18rem] items-center justify-center sm:min-h-[20rem]">
              <FreeCasePortada
                tier={tier}
                large
                showFreeBadge
                title={rankLabelForTier(tier)}
                hasRoyalLoot={caseHasRoyalLoot(slug)}
              />
            </div>
          )}
        </div>

        <div className="mx-auto mt-2 max-w-3xl rounded-xl border border-white/[0.06] bg-[#12101c]/90 px-4 py-4 sm:px-6">
          {unlocked ? (
            <div className="flex flex-col items-center gap-3">
              {ready ? (
                user ? (
                  <button
                    type="button"
                    onClick={handleOpenCase}
                    disabled={opening}
                    className="rounded-xl bg-gradient-to-r from-[#9333ea] to-[#b56bff] px-8 py-3 font-display text-sm font-black uppercase tracking-[0.12em] text-white shadow-[0_0_24px_rgba(176,108,255,0.25)] transition hover:brightness-110 disabled:opacity-60"
                  >
                    {opening ? 'Abriendo…' : turbo ? 'Abrir caja · rápido' : 'Abrir caja gratis'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={openLogin}
                    className="rounded-xl bg-gradient-to-r from-[#9333ea] to-[#b56bff] px-8 py-3 font-display text-sm font-black uppercase tracking-[0.12em] text-white shadow-[0_0_24px_rgba(176,108,255,0.25)] transition hover:brightness-110"
                  >
                    Inicia sesión para probar
                  </button>
                )
              ) : (
                <div className="flex items-center gap-3 rounded-lg border border-rose-500/45 bg-[#0a0812]/80 px-5 py-2.5">
                  <svg viewBox="0 0 20 20" className="h-4 w-4 text-rose-400/80" fill="currentColor" aria-hidden="true">
                    <path d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 2a6 6 0 1 1 0 12 6 6 0 0 1 0-12zm-.75 2.5a.75.75 0 0 1 1.5 0V10l2.2 1.3a.75.75 0 1 1-.75 1.3l-2.5-1.5A.75.75 0 0 1 9.25 10V6.5z" />
                  </svg>
                  <span className="font-display text-lg font-black tabular-nums tracking-wider text-white/80 sm:text-xl">
                    {timer}
                  </span>
                </div>
              )}
              <p className="text-center text-[10px] uppercase tracking-[0.14em] text-white/30">
                {ready
                  ? 'Puedes abrir esta caja ahora · cooldown de 24h tras abrirla'
                  : `Próxima apertura en · ${turbo ? 'Modo rápido' : 'Modo normal'}`}
              </p>
              {lastReward && !opening && (
                <p className="text-center text-xs text-win">
                  Última recompensa: {lastReward.name}
                </p>
              )}
            </div>
          ) : (
            <div className="text-center">
              <p className="font-display text-xs font-bold uppercase tracking-[0.14em] text-white/45">
                Locked — reach level {tier.level}
              </p>
              <p className="mt-1 text-sm text-white/35">
                Your level: {playerLevel} / {tier.level}
              </p>
            </div>
          )}
        </div>

        <FreeCaseLootSection loot={loot} />
      </section>
    </div>
  );
}
