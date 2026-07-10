import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { navigateApp } from '../lib/appRoute';
import {
  catalogCaseToTier,
  getCatalogCaseBySlug,
} from '../lib/catalogCaseUi';
import { getFreeCaseLoot, getJokerCasePrice, toEqualChanceLoot } from '../lib/freeCaseLoot';
import { useAuth } from '../context/AuthContext';
import { pickFreeCaseReward } from '../lib/freeCaseOpen';
import { createGrantedCatalogCaseSkin } from '../lib/caseOpen';
import { appendSkinsToInventory } from '../lib/inventoryStorage';
import type { Skin } from '../data/skins';
import { CoinPrice } from '../components/ui/CoinPrice';
import { CaseOpenPreview } from '../components/freecases/CaseOpenPreview';
import {
  CaseOpenQuantitySelector,
  type CaseOpenQuantity,
} from '../components/freecases/CaseOpenQuantitySelector';
import { FreeCaseLootSection } from '../components/freecases/FreeCaseLootSection';
import { buildCasePreviewSkins } from '../lib/casePreviewStrip';
import { FreeCaseReelOpener } from '../components/freecases/FreeCaseReelOpener';
import {
  MultiCaseReelBoard,
  type CaseOpenSession,
} from '../components/freecases/MultiCaseReelBoard';
import { buildFreeCaseReel } from '../lib/freeCaseReel';
import { requestSellSkin, requestSyncPlayerState, requestUpgradeWithSkin } from '../lib/uiActions';

interface Props {
  slug: string;
  balance: number;
  onPurchase: (price: number) => boolean;
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

export function CaseDetailPage({ slug, balance, onPurchase }: Props) {
  const catalogCase = getCatalogCaseBySlug(slug);
  const { user, openLogin } = useAuth();
  const [turbo, setTurbo] = useState(false);
  const [jokerMode, setJokerMode] = useState(false);
  const [rollTurbo, setRollTurbo] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [opening, setOpening] = useState(false);
  const [openingSlug, setOpeningSlug] = useState<string | null>(null);
  const [openSessions, setOpenSessions] = useState<CaseOpenSession[]>([]);
  const [openQuantity, setOpenQuantity] = useState<CaseOpenQuantity>(1);
  const openedAtRef = useRef(0);
  const { loot } = useMemo(() => getFreeCaseLoot(slug), [slug]);
  const displayLoot = useMemo(
    () => (jokerMode ? toEqualChanceLoot(loot) : loot),
    [loot, jokerMode],
  );
  const previewSkins = useMemo(() => buildCasePreviewSkins(slug, loot), [slug, loot]);
  const previewLeft = previewSkins.slice(0, 3);
  const previewRight = previewSkins.slice(3, 6);

  useEffect(() => {
    if (!catalogCase) navigateApp('main');
  }, [catalogCase]);

  const closeReel = useCallback(() => {
    setOpenSessions([]);
    setOpening(false);
    setOpeningSlug(null);
  }, []);

  useEffect(() => {
    closeReel();
    setOpenQuantity(1);
  }, [slug, closeReel]);

  if (!catalogCase) return null;

  const tier = catalogCaseToTier(catalogCase);
  const caseLabel = tier.rankLabel ?? tier.name;
  const casePrice = catalogCase.price;
  const unitPrice = jokerMode ? getJokerCasePrice(slug) : casePrice;
  const totalCost = unitPrice * openQuantity;
  const canAfford = balance >= totalCost;
  const isMultiOpen = openSessions.length > 1;
  const singleSession = openSessions.length === 1 ? openSessions[0] : null;

  const handleOpenCase = () => {
    if (!user || opening || !canAfford) return;

    const rewards: Skin[] = [];
    for (let i = 0; i < openQuantity; i += 1) {
      const reward = pickFreeCaseReward(slug, { joker: jokerMode });
      if (!reward) return;
      rewards.push(reward);
    }

    if (!onPurchase(totalCost)) return;

    openedAtRef.current = Date.now();
    const sessions: CaseOpenSession[] = rewards.map((reward, index) => ({
      id: `${openedAtRef.current}-${index}`,
      result: buildFreeCaseReel(slug, reward, previewSkins, { joker: jokerMode }),
      grantedSkin: createGrantedCatalogCaseSkin(reward, openedAtRef.current),
      revealed: false,
    }));

    void appendSkinsToInventory(
      user.userId,
      sessions.map(session => session.grantedSkin!),
    ).then(() => {
      requestSyncPlayerState();
    });

    setRollTurbo(turbo);
    setOpeningSlug(slug);
    setOpenSessions(sessions);
    setOpening(true);
  };

  const handleSessionReveal = (sessionId: string) => {
    if (!user || openingSlug !== slug) return;

    setOpenSessions(prev => {
      const current = prev.find(session => session.id === sessionId);
      if (!current || current.revealed) return prev;

      return prev.map(session =>
        session.id === sessionId ? { ...session, revealed: true } : session,
      );
    });
  };

  const handleSellReward = () => {
    if (!singleSession?.grantedSkin) return;
    requestSellSkin(singleSession.grantedSkin);
    requestSyncPlayerState();
    closeReel();
  };

  const handleUpgradeReward = () => {
    if (!singleSession?.grantedSkin) return;
    requestUpgradeWithSkin(singleSession.grantedSkin);
    closeReel();
  };

  const handleSellAllRewards = () => {
    for (const session of openSessions) {
      if (session.grantedSkin && !session.sold) requestSellSkin(session.grantedSkin);
    }
    requestSyncPlayerState();
    closeReel();
  };

  const handleSellSession = (sessionId: string) => {
    const session = openSessions.find(item => item.id === sessionId);
    if (!session?.grantedSkin || session.sold) return;

    const soldOk = requestSellSkin(session.grantedSkin);
    if (!soldOk) return;

    const updated = openSessions.map(item =>
      item.id === sessionId ? { ...item, sold: true } : item,
    );
    setOpenSessions(updated);

    if (updated.every(item => item.sold)) {
      closeReel();
    }
  };

  const showReel = opening && openSessions.length > 0 && openingSlug === slug;

  return (
    <div className="relative w-full overflow-hidden px-2 py-4 pb-8 sm:px-4 lg:px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_0%,rgba(124,58,237,0.14),transparent)]" />
      <div className="pointer-events-none absolute -left-20 top-10 h-64 w-64 rounded-full bg-violet-600/15 blur-[90px]" />
      <div className="pointer-events-none absolute -right-16 top-24 h-72 w-72 rounded-full bg-fuchsia-600/10 blur-[100px]" />

      <section className="relative mx-auto max-w-6xl lg:max-w-7xl">
        <div className="mb-4 flex items-center gap-3">
          <IconButton label="Volver a cases" onClick={() => navigateApp('main')}>
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden="true">
              <path d="M11.78 3.22a.75.75 0 0 1 0 1.06L7.06 9l4.72 4.72a.75.75 0 1 1-1.06 1.06l-5.25-5.25a.75.75 0 0 1 0-1.06l5.25-5.25a.75.75 0 0 1 1.06 0z" />
            </svg>
          </IconButton>
        </div>

        <div
          className={`relative mx-auto max-w-7xl lg:max-w-[90rem] ${
            showReel && isMultiOpen ? 'min-h-0' : 'min-h-[22rem] sm:min-h-[26rem]'
          }`}
        >
          <AnimatePresence mode="wait">
            {showReel ? (
              <motion.div
                key="reel"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
              >
                {isMultiOpen ? (
                  <MultiCaseReelBoard
                    active
                    caseSlug={slug}
                    caseLabel={caseLabel}
                    sessions={openSessions}
                    turbo={rollTurbo}
                    soundOn={soundOn}
                    onReveal={handleSessionReveal}
                    onSellSession={handleSellSession}
                    onSellAll={handleSellAllRewards}
                    onClose={closeReel}
                  />
                ) : singleSession ? (
                  <FreeCaseReelOpener
                    key={singleSession.id}
                    active
                    caseSlug={slug}
                    result={singleSession.result}
                    grantedSkin={singleSession.grantedSkin}
                    caseLabel={caseLabel}
                    turbo={rollTurbo}
                    soundOn={soundOn}
                    size="large"
                    onReveal={() => handleSessionReveal(singleSession.id)}
                    onSell={handleSellReward}
                    onUpgrade={handleUpgradeReward}
                  />
                ) : null}
              </motion.div>
            ) : (
              <motion.div
                key="preview"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="flex min-h-[22rem] items-center justify-center sm:min-h-[26rem]"
              >
                {previewSkins.length >= 6 ? (
                  <CaseOpenPreview
                    tier={tier}
                    title={caseLabel}
                    leftSkins={previewLeft}
                    rightSkins={previewRight}
                    loot={displayLoot}
                    price={unitPrice}
                    hasRoyalLoot={!jokerMode && loot.some(item => item.chance <= 1)}
                    jokerMode={jokerMode}
                  />
                ) : null}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mx-auto mt-2 w-full max-w-7xl rounded-xl border border-white/[0.06] bg-[#12101c]/90 px-3 py-4 sm:px-5 sm:py-5 lg:max-w-[90rem] lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
            {user ? (
              <CaseOpenQuantitySelector
                value={openQuantity}
                onChange={setOpenQuantity}
                disabled={opening}
              />
            ) : (
              <div className="hidden lg:block lg:w-[15.5rem]" aria-hidden="true" />
            )}

            <div className="flex min-w-0 flex-1 flex-col items-center gap-3">
              {user ? (
                <button
                  type="button"
                  onClick={handleOpenCase}
                  disabled={opening || !canAfford}
                  className="inline-flex w-full max-w-none items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-[#9333ea] to-[#b56bff] px-6 py-3 font-display text-sm font-black uppercase tracking-[0.12em] text-white shadow-[0_0_24px_rgba(176,108,255,0.25)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 sm:px-10 sm:text-base lg:w-full lg:py-3.5"
                >
                  <span>
                    {opening
                      ? isMultiOpen
                        ? `Abriendo ${openSessions.length} cajas…`
                        : 'Abriendo…'
                      : jokerMode
                        ? openQuantity > 1
                          ? `Abrir ${openQuantity} cajas · joker`
                          : 'Abrir caja · joker'
                        : turbo
                        ? openQuantity > 1
                          ? `Abrir ${openQuantity} cajas · rápido`
                          : 'Abrir caja · rápido'
                        : openQuantity > 1
                          ? `Abrir ${openQuantity} cajas`
                          : 'Abrir caja'}
                  </span>
                  {!opening && (
                    <span className="inline-flex items-center rounded-md bg-white/15 px-2 py-0.5">
                      <CoinPrice
                        value={totalCost}
                        iconClassName="h-3.5 w-3.5"
                        textClassName="font-display text-sm font-black text-white sm:text-base"
                      />
                    </span>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={openLogin}
                  className="w-full rounded-xl bg-gradient-to-r from-[#9333ea] to-[#b56bff] px-8 py-3 font-display text-sm font-black uppercase tracking-[0.12em] text-white shadow-[0_0_24px_rgba(176,108,255,0.25)] transition hover:brightness-110 sm:text-base lg:py-3.5"
                >
                  Inicia sesión para abrir
                </button>
              )}

              {user && !canAfford && !opening && (
                <p className="text-center text-xs font-semibold text-red-300/80">
                  Saldo insuficiente · necesitas{' '}
                  <CoinPrice
                    value={totalCost}
                    iconClassName="inline h-3 w-3"
                    textClassName="text-xs font-bold text-red-200"
                    className="inline-flex align-middle"
                  />
                </p>
              )}

              <p className="text-center text-[10px] uppercase tracking-[0.14em] text-white/30 sm:text-[11px]">
                {loot.length} skins en esta caja
              </p>
            </div>

            <div className="flex shrink-0 items-center justify-end gap-2 lg:w-[15.5rem]">
              <button
                type="button"
                aria-label={jokerMode ? 'Desactivar modo joker' : 'Activar modo joker'}
                disabled={opening}
                onClick={() => setJokerMode(v => !v)}
                className={`flex h-10 w-10 items-center justify-center rounded-lg border transition sm:h-11 sm:w-11 ${
                  jokerMode
                    ? 'border-[#9333ea]/70 bg-[#9333ea]/45 text-[#e9d5ff] shadow-[0_0_18px_rgba(147,51,234,0.35)]'
                    : 'border-white/10 bg-[#141024]/80 text-white/55 hover:border-violet-500/30 hover:text-violet-200'
                } disabled:cursor-not-allowed disabled:opacity-35`}
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                  <path
                    d="M6.5 9.2 C6.5 7.2 8 5.7 10 5.7 C11.1 5.7 12 6.1 12.7 6.8 L14.2 5.3 L15.6 6.7 L14.1 8.2 C14.8 8.9 15.2 9.8 15.2 10.8 C15.2 12.8 13.7 14.3 11.7 14.3 C10.9 14.3 10.2 14.1 9.6 13.6 L8.1 15.1 L6.7 13.7 L8.2 12.2 C7.7 11.5 6.5 10.4 6.5 9.2 Z"
                    fill="currentColor"
                  />
                  <path
                    d="M8.2 7.1 C8.2 6.4 8.7 5.9 9.4 5.9 C10.1 5.9 10.6 6.4 10.6 7.1 C10.6 7.8 10.1 8.3 9.4 8.3 C8.7 8.3 8.2 7.8 8.2 7.1 Z M11.4 6.5 C11.4 5.8 11.9 5.3 12.6 5.3 C13.3 5.3 13.8 5.8 13.8 6.5 C13.8 7.2 13.3 7.7 12.6 7.7 C11.9 7.7 11.4 7.2 11.4 6.5 Z M14.6 7.1 C14.6 6.4 15.1 5.9 15.8 5.9 C16.5 5.9 17 6.4 17 7.1 C17 7.8 16.5 8.3 15.8 8.3 C15.1 8.3 14.6 7.8 14.6 7.1 Z"
                    fill={jokerMode ? '#9333ea' : '#141024'}
                  />
                  <path
                    d="M9.5 15.2 H14.5 L14.9 17.8 H9.1 Z M10.2 14 H13.8 V15.2 H10.2 Z"
                    fill="currentColor"
                  />
                </svg>
              </button>

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
                label={soundOn ? 'Silenciar sonidos' : 'Activar sonidos'}
                disabled={opening}
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
        </div>

        <FreeCaseLootSection loot={displayLoot} large />
      </section>
    </div>
  );
}
