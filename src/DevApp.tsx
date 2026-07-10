import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { LayoutGroup } from 'framer-motion';
import { Header } from './components/layout/Header';
import { LiveFeed } from './components/layout/LiveFeed';
import { UpgradePage } from './pages/UpgradePage';
import { ParticleField } from './components/effects/ParticleField';
import { LoginModal } from './components/auth/LoginModal';
import { TARGET_POOL, sortSkinsByPriceDesc, type Skin, type FeedItem } from './data/skins';
import { useActivityLog } from './hooks/useActivityLog';
import { syncPlayerState, fetchPendingAccountReset, fetchPlayerState } from './lib/playerStateApi';
import {
  applyPlayerStateSnapshot,
  setLocalPlayerStateUpdatedAt,
  shouldHydrateFromServer,
  touchLocalPlayerStateUpdatedAt,
} from './lib/playerStateHydration';
import { logUpgradeResult } from './lib/userActivityLog';
import { calcProbability, formatUSD, type RollResult } from './lib/wheelMath';
import { applyUpgradeWin, commitUpgradeStake, createConsolationGrantedSkin, grantSkinToInventory, inventoryTotal, MAX_INPUT_SKINS, purchaseSkinCopies, sellSkinFromInventory, withdrawSkinsFromInventory } from './lib/inventory';
import { loadInventory, saveInventory, clearInventoryForUserId, getInventoryStorageKey } from './lib/inventoryStorage';
import { loadBalance, saveBalance, clearBalanceForUserId, getBalanceStorageKey } from './lib/balanceStorage';
import { clearPendingUpgrade, getPendingUpgradeStakedSkinIds, getPendingUpgradeStorageKey, loadPendingUpgrade, lockPendingUpgradeRoll, savePendingUpgrade } from './lib/upgradePendingStorage';
import {
  clearPendingLossConsolation,
  loadPendingLossConsolation,
  savePendingLossConsolation,
} from './lib/lossConsolationPendingStorage';
import { normalizeGrantEmail } from './lib/inventoryGrants';
import { BASE_TOTAL_UPGRADES } from './lib/feed';
import { applySiteState, fetchSiteState, publishFeedEvent } from './lib/siteStateApi';
import { findTargetForPreset } from './lib/upgradePresets';
import { sfx, preloadRollSound } from './lib/audio';
import { useWheelSize } from './hooks/useWheelSize';
import { useDocumentVisible } from './hooks/useDocumentVisible';
import { getDisplayName, getProfileLabel, isAdmin } from './lib/auth';
import { useAuth } from './context/AuthContext';
import { createWithdrawTicket, createDepositTicket, createRobuxDepositTicket, fetchUserWithdrawTickets, getDepositCreditAmount, getPendingWithdrawSkinIds, getTicketType, isRobuxDeposit, openOrCreateHelpTicket, type WithdrawTicket } from './lib/withdrawChat';
import type { AppliedDepositBonus } from './lib/depositBonusCode';
import { validateDepositTotal } from './lib/deposit';
import { validateRobuxDepositAmount } from './lib/robuxDeposit';
import {
  acknowledgeInventoryGrants,
  fetchPendingInventoryGrants,
} from './lib/inventoryGrants';
import {
  acknowledgeBalanceGrants,
  fetchPendingBalanceGrants,
} from './lib/balanceGrants';
import { loadAppliedGrantIds, markAppliedGrantIds } from './lib/appliedGrantStorage';
import {
  loadAppliedBalanceGrantIds,
  markAppliedBalanceGrantIds,
} from './lib/appliedBalanceGrantStorage';
import {
  markWithdrawTicketProcessed,
  loadProcessedWithdrawTickets,
} from './lib/processedWithdrawStorage';
import { ThanksToast } from './components/ui/ThanksToast';
import type { ShopPurchaseItem } from './components/shop/ShopPanel';
import type { DepositItem } from './components/deposit/DepositModal';
import { fetchAccountBanStatus } from './lib/accountBanApi';
import { qualifiesForLossConsolationCase } from './lib/devLossConsolation';
import { DEV_MOBILE_LAYOUT } from './lib/devMobileLayout';
import { DEV_CLEAN_HEADER_LAYOUT } from './lib/devCleanHeaderLayout';
import { DEV_FEED_CLIENT_POLL_MS } from './lib/devLiveFeed';
import { buildLossConsolationCase, type LossConsolationResult } from './lib/lossConsolationCase';
import { LossConsolationCaseModal } from './components/upgrade/LossConsolationCaseModal';
import { useAppRoute, useCaseSlug, useFreeCaseSlug, useGiveawayPeriod } from './hooks/useAppRoute';
import { recordGiveawayDeposit, ackGiveawayWin, fetchPendingGiveawayWins, type GiveawayPendingWin } from './lib/giveawayApi';
import { resolveAvatarId } from './lib/profileAvatars';
import { navigateApp } from './lib/appRoute';
import { XP_PER_WAGERED_COIN } from './lib/playerLevel';
import { clearXpForUserId, addWagerXp } from './lib/xpStorage';
import { clearFreeCaseCooldowns } from './lib/freeCaseCooldown';
import { registerSellSkinHandler, registerSyncPlayerHandler, registerUpgradeWithSkinHandler } from './lib/uiActions';
import { archiveInventorySkins } from './lib/inventoryArchiveStorage';
import { ProfilePage } from './pages/ProfilePage';
import { MainPage } from './pages/MainPage';
import { CaseDetailPage } from './pages/CaseDetailPage';
import { FreeCasesPage } from './pages/FreeCasesPage';
import { FreeCaseDetailPage } from './pages/FreeCaseDetailPage';
import { GiveawaysPage } from './pages/GiveawaysPage';
import { GiveawayDetailPage } from './pages/GiveawayDetailPage';
import { GiveawayWinModal } from './components/giveaways/GiveawayWinModal';
import { AdminPage } from './pages/AdminPage';

export default function DevApp() {
  const { user, logout: authLogout, openLogin } = useAuth();
  const { log, logUser } = useActivityLog();
  const userId = user?.userId ?? null;

  const [inventory, setInventory] = useState<Skin[]>(() => loadInventory(userId));
  const [balance, setBalance] = useState(() => loadBalance(userId));
  const [inputSkins, setInputSkins] = useState<Skin[]>([]);
  const [targetSkin, setTargetSkin] = useState<Skin | null>(null);
  const [multiplier, setMultiplier] = useState<number | null>(null);
  const [cap, setCap] = useState<number | null>(null);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [totalUpgrades, setTotalUpgrades] = useState(BASE_TOTAL_UPGRADES);
  const [playersOnline, setPlayersOnline] = useState(650);
  const [turbo, setTurbo] = useState(false);
  const [lockedSkinIds, setLockedSkinIds] = useState<Set<string>>(() => new Set());
  const [playerStateHydrated, setPlayerStateHydrated] = useState(() => !user);
  const [localPlayerStateRevision, setLocalPlayerStateRevision] = useState(0);
  const [isUpgradeRolling, setIsUpgradeRolling] = useState(false);
  const isUpgradeRollingRef = useRef(false);
  const rollingInputIdsRef = useRef<string[]>([]);
  const rollingInputsRef = useRef<Skin[]>([]);
  const [thanksToastVisible, setThanksToastVisible] = useState(false);
  const [giveawayWinOpen, setGiveawayWinOpen] = useState(false);
  const [giveawayWinData, setGiveawayWinData] = useState<GiveawayPendingWin | null>(null);
  const shownGiveawayWinIdRef = useRef<string | null>(null);
  const inventoryRef = useRef(inventory);
  const balanceRef = useRef(balance);
  const userIdRef = useRef(userId);
  const openSupportChatRef = useRef<(ticketId: string) => void>(() => {});
  const [liveHelpLoading, setLiveHelpLoading] = useState(false);
  const [liveHelpError, setLiveHelpError] = useState('');
  const initialWithdrawSyncRef = useRef(true);
  const giftSyncInFlightRef = useRef(false);
  const balanceGiftSyncInFlightRef = useRef(false);
  const playerStateSyncInFlightRef = useRef(false);
  const playerStateSyncTimerRef = useRef<number | null>(null);
  const lastResetAckRef = useRef<number | null>(null);
  const pendingUpgradeRecoveredRef = useRef<string | null>(null);
  const pendingConsolationRecoveredRef = useRef<string | null>(null);
  const upgradeSessionKeyRef = useRef<string | null>(null);
  const [lossCase, setLossCase] = useState<{
    lostValue: number;
    inputLabel: string;
    result: LossConsolationResult;
    turbo: boolean;
    grantedSkin: Skin;
    pending: {
      won: boolean;
      roll: RollResult;
      inputLabel: string;
      inputImage: string;
      inputTotal: number;
      targetSkin: Skin;
      probability: number;
    };
  } | null>(null);
  const lossCaseCollectingRef = useRef(false);
  inventoryRef.current = inventory;
  balanceRef.current = balance;

  const inputTotal = useMemo(() => inventoryTotal(inputSkins), [inputSkins]);

  /** Sorted view for the inventory panel; hides consolation skin until the case finishes. */
  const inventoryPanelSkins = useMemo(() => {
    const sorted = sortSkinsByPriceDesc(inventory);
    const hiddenId = lossCase?.grantedSkin.id;
    if (!hiddenId) return sorted;
    return sorted.filter(s => s.id !== hiddenId);
  }, [inventory, lossCase?.grantedSkin.id]);

  const probability = useMemo(
    () => calcProbability(inputTotal, targetSkin?.price ?? 0),
    [inputTotal, targetSkin],
  );

  const dismissThanksToast = useCallback(() => setThanksToastVisible(false), []);
  const wheelSize = useWheelSize();
  const documentVisible = useDocumentVisible();
  const route = useAppRoute();
  const freeCaseSlug = useFreeCaseSlug();
  const caseSlug = useCaseSlug();
  const giveawayPeriod = useGiveawayPeriod();
  const isMainPage = route === 'main';
  const isUpgradePage = route === 'upgrade';
  const isProfilePage = route === 'profile';
  const isFreeCasesPage = route === 'free-cases';
  const isGiveawaysPage = route === 'giveaways';
  const isAdminPage = route === 'admin';
  const isScrollablePage = isMainPage || isProfilePage || isUpgradePage || isFreeCasesPage || isGiveawaysPage || isAdminPage;
  const canUpgrade = probability > 0;

  useEffect(() => {
    preloadRollSound();
  }, []);

  useEffect(() => {
    if (!import.meta.env.DEV || !user || !isProfilePage) return;
    const flag = `blox-upgrader/dev-profile-gift-10k/${user.userId}`;
    if (sessionStorage.getItem(flag)) return;
    sessionStorage.setItem(flag, '1');
    setBalance(prev => {
      const next = prev + 10_000;
      saveBalance(next, user.userId);
      balanceRef.current = next;
      return next;
    });
  }, [user, isProfilePage]);

  useEffect(() => {
    if (isProfilePage && !user) {
      navigateApp('main');
      openLogin();
    }
  }, [isProfilePage, user, openLogin]);

  const wipeLocalPlayerProgress = useCallback((targetUserId: string) => {
    clearInventoryForUserId(targetUserId);
    clearBalanceForUserId(targetUserId);
    clearXpForUserId(targetUserId);
    clearFreeCaseCooldowns(targetUserId);
    clearPendingUpgrade(targetUserId);
    clearPendingLossConsolation(targetUserId);
    inventoryRef.current = [];
    balanceRef.current = 0;
    setInventory([]);
    setBalance(0);
    setInputSkins([]);
    setTargetSkin(null);
    setMultiplier(null);
    setCap(null);
  }, []);

  const handleAccountCleared = useCallback((email: string) => {
    if (!user) return;
    if (normalizeGrantEmail(user.email) !== normalizeGrantEmail(email)) return;
    lastResetAckRef.current = Date.now();
    wipeLocalPlayerProgress(user.userId);
  }, [user, wipeLocalPlayerProgress]);

  const pushPlayerStateSync = useCallback(async (
    nextInventory: Skin[],
    nextBalance: number,
    resetAck?: number,
  ) => {
    if (!user) return;
    const result = await syncPlayerState({
      userId: user.userId,
      email: user.email,
      balance: nextBalance,
      inventory: nextInventory,
      resetAck,
    });
    if (result.forceReset && result.resetAt) {
      lastResetAckRef.current = result.resetAt;
      wipeLocalPlayerProgress(user.userId);
      await syncPlayerState({
        userId: user.userId,
        email: user.email,
        balance: 0,
        inventory: [],
        resetAck: result.resetAt,
      });
    } else if (result.state) {
      if (result.skippedEmptyOverwrite) {
        const next = applyPlayerStateSnapshot(user.userId, result.state);
        inventoryRef.current = next.inventory;
        balanceRef.current = next.balance;
        setInventory(next.inventory);
        setBalance(next.balance);
      } else if (result.state.updatedAt) {
        setLocalPlayerStateUpdatedAt(user.userId, result.state.updatedAt);
      }
    }
  }, [user, wipeLocalPlayerProgress]);

  const applyPendingAccountReset = useCallback(async (resetAt: number) => {
    if (!user) return;
    if (lastResetAckRef.current === resetAt) return;
    lastResetAckRef.current = resetAt;
    wipeLocalPlayerProgress(user.userId);
    await syncPlayerState({
      userId: user.userId,
      email: user.email,
      balance: 0,
      inventory: [],
      resetAck: resetAt,
    });
  }, [user, wipeLocalPlayerProgress]);

  const applyPresetTarget = useCallback((inputs: Skin[], mult: number | null, capVal: number | null) => {
    const total = inventoryTotal(inputs);
    if (total <= 0 || (!mult && !capVal)) return;
    const target = findTargetForPreset(TARGET_POOL, total, mult, capVal);
    if (target) setTargetSkin(target);
  }, []);

  const handleMultiplier = useCallback((m: number) => {
    const nextMult = multiplier === m ? null : m;
    log('CLICK.multiplier', { value: `x${m}`, active: nextMult !== null });
    setMultiplier(nextMult);
    setCap(null);
    applyPresetTarget(inputSkins, nextMult, null);
    if (inputSkins.length && nextMult) sfx.select();
  }, [multiplier, inputSkins, applyPresetTarget, log]);

  const handleCap = useCallback((p: number) => {
    const nextCap = cap === p ? null : p;
    log('CLICK.cap', { value: `${p}%`, active: nextCap !== null });
    setMultiplier(null);
    setCap(nextCap);
    applyPresetTarget(inputSkins, null, nextCap);
    if (inputSkins.length && nextCap) sfx.select();
  }, [cap, inputSkins, applyPresetTarget, log]);

  const upgradeRollingIds = useMemo(
    () => (isUpgradeRolling ? new Set(inputSkins.map(s => s.id)) : new Set<string>()),
    [isUpgradeRolling, inputSkins],
  );

  const pendingUpgradeStakeIds = useMemo(() => {
    void localPlayerStateRevision;
    return getPendingUpgradeStakedSkinIds(userId);
  }, [userId, localPlayerStateRevision]);

  const refreshLocalPlayerState = useCallback(() => {
    if (!userId) return;
    const nextInventory = loadInventory(userId);
    const nextBalance = loadBalance(userId);
    inventoryRef.current = nextInventory;
    balanceRef.current = nextBalance;
    setInventory(nextInventory);
    setBalance(nextBalance);
    if (!isUpgradeRollingRef.current) {
      setInputSkins(prev => prev.filter(s => nextInventory.some(i => i.id === s.id)));
    }
    setLocalPlayerStateRevision(rev => rev + 1);
  }, [userId]);

  const isSkinLocked = useCallback((skinId: string) => {
    if (lockedSkinIds.has(skinId)) return true;
    if (pendingUpgradeStakeIds.has(skinId)) return true;
    if (isUpgradeRollingRef.current && rollingInputIdsRef.current.includes(skinId)) return true;
    return upgradeRollingIds.has(skinId);
  }, [lockedSkinIds, pendingUpgradeStakeIds, upgradeRollingIds]);

  const effectiveLockedSkinIds = useMemo(() => {
    if (upgradeRollingIds.size === 0 && pendingUpgradeStakeIds.size === 0) return lockedSkinIds;
    return new Set([...lockedSkinIds, ...upgradeRollingIds, ...pendingUpgradeStakeIds]);
  }, [lockedSkinIds, upgradeRollingIds, pendingUpgradeStakeIds]);

  const handleInputSelect = useCallback((s: Skin) => {
    if (isSkinLocked(s.id)) return;
    setInputSkins(prev => {
      if (prev.some(x => x.id === s.id)) {
        log('CLICK.deselect_input', { skin: s.name, price: formatUSD(s.price) });
        sfx.select();
        return prev.filter(x => x.id !== s.id);
      }
      if (prev.length >= MAX_INPUT_SKINS) return prev;
      log('CLICK.select_input', { skin: s.name, price: formatUSD(s.price) });
      sfx.select();
      return [...prev, s];
    });
  }, [log, isSkinLocked]);

  const handleClearInput = useCallback(() => {
    if (isUpgradeRolling) return;
    log('CLICK.clear_input', { count: inputSkins.length });
    setInputSkins([]);
  }, [isUpgradeRolling, inputSkins.length, log]);

  const handleClearTarget = useCallback(() => {
    log('CLICK.clear_target', { skin: targetSkin?.name ?? '' });
    setTargetSkin(null);
  }, [targetSkin, log]);

  const handleRandomInput = useCallback(() => {
    if (isUpgradeRolling) return;
    const available = inventoryPanelSkins.filter(s => !isSkinLocked(s.id));
    if (!available.length) return;
    const pick = available[Math.floor(Math.random() * available.length)];
    log('CLICK.random_input', { skin: pick.name });
    sfx.select();
    setInputSkins([pick]);
    applyPresetTarget([pick], multiplier, cap);
  }, [isUpgradeRolling, inventoryPanelSkins, isSkinLocked, log, multiplier, cap, applyPresetTarget]);

  const handleSelectAllInput = useCallback(() => {
    if (isUpgradeRolling) return;
    const available = inventoryPanelSkins
      .filter(s => !isSkinLocked(s.id))
      .slice(0, MAX_INPUT_SKINS);
    if (!available.length) return;
    log('CLICK.select_all_input', { count: available.length });
    sfx.select();
    setInputSkins(available);
    applyPresetTarget(available, multiplier, cap);
  }, [isUpgradeRolling, inventoryPanelSkins, isSkinLocked, log, multiplier, cap, applyPresetTarget]);

  const handleTargetSelect = useCallback((s: Skin) => {
    if (targetSkin?.id === s.id) {
      log('CLICK.deselect_target', { skin: s.name, price: formatUSD(s.price) });
      sfx.select();
      setTargetSkin(null);
      return;
    }
    log('CLICK.select_target', { skin: s.name, price: formatUSD(s.price) });
    sfx.select();
    setTargetSkin(s);
  }, [targetSkin, log]);

  const handleSellSkin = useCallback((skin: Skin): boolean => {
    if (!userId) return false;
    if (isSkinLocked(skin.id)) return false;

    const freshInventory = loadInventory(userId);
    const owned = freshInventory.find(s => s.id === skin.id);
    if (!owned) return false;

    const nextInventory = sellSkinFromInventory(freshInventory, owned.id);
    const nextBalance = loadBalance(userId) + owned.price;

    saveInventory(nextInventory, userId);
    saveBalance(nextBalance, userId);
    inventoryRef.current = nextInventory;
    balanceRef.current = nextBalance;
    setInventory(nextInventory);
    setBalance(nextBalance);
    setInputSkins(prev => prev.filter(s => s.id !== owned.id));
    archiveInventorySkins(userId, [owned], 'sold');
    log('INVENTORY.sell', { skin: owned.name, price: formatUSD(owned.price), weapon: owned.weapon });
    sfx.select();
    void pushPlayerStateSync(nextInventory, nextBalance);
    return true;
  }, [isSkinLocked, log, userId, pushPlayerStateSync]);

  useEffect(() => {
    registerUpgradeWithSkinHandler(skin => {
      if (isSkinLocked(skin.id)) return;
      navigateApp('upgrade');
      setInputSkins([skin]);
      setTargetSkin(null);
      setMultiplier(null);
      setCap(null);
      log('PROFILE.upgrade_skin', { skin: skin.name, price: formatUSD(skin.price) });
      sfx.select();
    });
    registerSellSkinHandler(handleSellSkin);
    registerSyncPlayerHandler(refreshLocalPlayerState);
    return () => {
      registerUpgradeWithSkinHandler(null);
      registerSellSkinHandler(null);
      registerSyncPlayerHandler(null);
    };
  }, [handleSellSkin, isSkinLocked, log, refreshLocalPlayerState]);

  const handleShopPurchase = useCallback((items: ShopPurchaseItem[]): boolean => {
    if (!user) return false;
    const total = items.reduce((sum, item) => sum + item.skin.price * item.quantity, 0);
    if (total <= 0) return false;
    if (balanceRef.current < total) return false;

    setBalance(prev => (prev < total ? prev : prev - total));
    setInventory(prev => {
      let next = prev;
      for (const item of items) {
        next = purchaseSkinCopies(next, item.skin, item.quantity);
      }
      return next;
    });
    log('SHOP.purchase', {
      count: items.reduce((sum, item) => sum + item.quantity, 0),
      total: formatUSD(total),
      skins: items.map(item => `${item.quantity}× ${item.skin.name}`).join(' · '),
    });
    return true;
  }, [user, log]);

  const handleCatalogCasePurchase = useCallback((price: number): boolean => {
    if (!user) return false;
    if (price <= 0) return false;
    if (balanceRef.current < price) return false;

    setBalance(prev => (prev < price ? prev : prev - price));
    log('CASE.open_purchase', { price: formatUSD(price) });
    return true;
  }, [user, log]);

  const handleAdminGrantSkin = useCallback((skin: Skin) => {
    if (!isAdmin(user)) return;
    log('DEPOSIT.admin', { skin: skin.name, price: formatUSD(skin.price), weapon: skin.weapon });
    setInventory(prev => grantSkinToInventory(prev, skin));
    sfx.win();
  }, [user, log]);

  const handleWithdrawRequest = useCallback(async (skins: Skin[]): Promise<string | null> => {
    if (!user || !skins.length) return null;

    const freshInventory = loadInventory(user.userId);
    const stakedIds = getPendingUpgradeStakedSkinIds(user.userId);
    const validSkins = skins.filter(skin => (
      freshInventory.some(item => item.id === skin.id)
      && !stakedIds.has(skin.id)
      && !lockedSkinIds.has(skin.id)
    ));
    if (validSkins.length !== skins.length) return null;

    try {
      const bundle = await createWithdrawTicket(user, validSkins, getProfileLabel(user));
      log('WITHDRAW.request', {
        ticketId: bundle.ticket.id,
        count: validSkins.length,
        total: formatUSD(inventoryTotal(validSkins)),
        skins: validSkins.map(s => s.name).join(' · '),
      });
      setLockedSkinIds(prev => {
        const next = new Set(prev);
        for (const skin of validSkins) next.add(skin.id);
        return next;
      });
      setInputSkins(prev => prev.filter(s => !validSkins.some(w => w.id === s.id)));
      sfx.select();
      return bundle.ticket.id;
    } catch {
      log('WITHDRAW.request_failed', { count: validSkins.length });
      return null;
    }
  }, [user, log, lockedSkinIds]);

  const applyWithdrawCompletion = useCallback((ticket: WithdrawTicket, showThanks: boolean) => {
    if (!user) return;
    const processed = loadProcessedWithdrawTickets(user.userId);
    if (processed.has(ticket.id)) return;

    markWithdrawTicketProcessed(user.userId, ticket.id);
    const ids = ticket.skins.map(s => s.id);
    log('WITHDRAW.complete', {
      ticketId: ticket.id,
      count: ticket.skins.length,
      total: formatUSD(ticket.total),
      skins: ticket.skins.map(s => s.name).join(' · '),
    });
    setInventory(prev => {
      const removed = prev.filter(s => ids.includes(s.id));
      archiveInventorySkins(user.userId, removed, 'withdrawn');
      return withdrawSkinsFromInventory(prev, ids);
    });
    setInputSkins(prev => prev.filter(s => !ids.includes(s.id)));
    setLockedSkinIds(prev => {
      const next = new Set(prev);
      for (const id of ids) next.delete(id);
      return next;
    });
    if (showThanks) {
      setThanksToastVisible(true);
      sfx.win();
    }
  }, [user, log]);

  const applyDepositCompletion = useCallback((ticket: WithdrawTicket) => {
    if (!user) return;
    const processed = loadProcessedWithdrawTickets(user.userId);
    if (processed.has(ticket.id)) return;

    markWithdrawTicketProcessed(user.userId, ticket.id);
    const amount = getDepositCreditAmount(ticket);
    if (isRobuxDeposit(ticket)) {
      log('DEPOSIT.robux_complete', {
        ticketId: ticket.id,
        robuxAmount: ticket.robuxAmount,
        creditTotal: formatUSD(amount),
        bonusCode: ticket.bonusCode,
        bonusPercent: ticket.bonusPercent,
      });
    } else {
      log('DEPOSIT.complete', {
        ticketId: ticket.id,
        count: ticket.skins.length,
        total: formatUSD(amount),
        skins: ticket.skins.map(s => s.name).join(' · '),
      });
    }
    setBalance(prev => prev + amount);
    void recordGiveawayDeposit({
      userId: user.userId,
      amount,
      email: user.email,
      nickname: user.nickname,
      avatarId: resolveAvatarId(user.avatarId, user.email),
    }).then(ok => {
      if (ok) window.dispatchEvent(new CustomEvent('giveaway-deposit-recorded'));
    });
  }, [user, log]);

  const handleWithdrawTicketCompleted = useCallback((ticket: WithdrawTicket) => {
    applyWithdrawCompletion(ticket, true);
  }, [applyWithdrawCompletion]);

  const handleDepositRequest = useCallback(async (
    items: DepositItem[],
    bonus?: AppliedDepositBonus,
  ): Promise<string | null> => {
    if (!user || !items.length) return null;
    const total = items.reduce((sum, item) => sum + item.skin.price * item.quantity, 0);
    const validation = validateDepositTotal(total);
    if (!validation.ok) return null;
    try {
      const bundle = await createDepositTicket(user, getProfileLabel(user), items, bonus);
      log('DEPOSIT.request', {
        ticketId: bundle.ticket.id,
        count: items.reduce((sum, item) => sum + item.quantity, 0),
        total: formatUSD(total),
        creditTotal: formatUSD(getDepositCreditAmount(bundle.ticket)),
        bonusCode: bonus?.code,
        bonusPercent: bonus?.percent,
        skins: items.map(item => `${item.quantity}× ${item.skin.name}`).join(' · '),
      });
      sfx.select();
      return bundle.ticket.id;
    } catch {
      log('DEPOSIT.request_failed', { total: formatUSD(total) });
      return null;
    }
  }, [user, log]);

  const handleRobuxDepositRequest = useCallback(async (
    robuxAmount: number,
    bonus?: AppliedDepositBonus,
  ): Promise<string | null> => {
    if (!user) return null;
    const validation = validateRobuxDepositAmount(robuxAmount);
    if (!validation.ok) return null;
    try {
      const bundle = await createRobuxDepositTicket(user, getProfileLabel(user), robuxAmount, bonus);
      log('DEPOSIT.robux_request', {
        ticketId: bundle.ticket.id,
        robuxAmount,
        creditTotal: formatUSD(getDepositCreditAmount(bundle.ticket)),
        bonusCode: bonus?.code,
        bonusPercent: bonus?.percent,
      });
      sfx.select();
      return bundle.ticket.id;
    } catch {
      log('DEPOSIT.robux_request_failed', { robuxAmount });
      return null;
    }
  }, [user, log]);

  const handleSupportTicketCompleted = useCallback((ticket: WithdrawTicket) => {
    if (getTicketType(ticket) === 'help') return;
    if (getTicketType(ticket) === 'deposit') {
      applyDepositCompletion(ticket);
      return;
    }
    handleWithdrawTicketCompleted(ticket);
  }, [applyDepositCompletion, handleWithdrawTicketCompleted]);

  const handleLiveHelp = useCallback(async () => {
    if (!user) {
      openLogin();
      return;
    }
    setLiveHelpLoading(true);
    setLiveHelpError('');
    try {
      const ticketId = await openOrCreateHelpTicket(user, getProfileLabel(user) ?? user.email);
      if (!openSupportChatRef.current) {
        setLiveHelpError('No se pudo abrir el chat. Recarga la página.');
        return;
      }
      openSupportChatRef.current(ticketId);
    } catch {
      setLiveHelpError('No se pudo conectar con soporte. Inténtalo de nuevo.');
      log('HELP.request_failed');
    } finally {
      setLiveHelpLoading(false);
    }
  }, [user, openLogin, log]);

  useEffect(() => {
    if (!user || !documentVisible) {
      setLockedSkinIds(new Set());
      initialWithdrawSyncRef.current = true;
      return;
    }

    const syncWithdrawState = async () => {
      try {
        const tickets = await fetchUserWithdrawTickets(user.userId);
        setLockedSkinIds(new Set(getPendingWithdrawSkinIds(tickets)));

        const isInitial = initialWithdrawSyncRef.current;
        initialWithdrawSyncRef.current = false;

        for (const ticket of tickets) {
          if (ticket.status !== 'completed') continue;
          if (getTicketType(ticket) === 'help') continue;
          if (getTicketType(ticket) === 'deposit') {
            applyDepositCompletion(ticket);
          } else {
            applyWithdrawCompletion(ticket, !isInitial);
          }
        }
      } catch {
        /* dev API offline */
      }
    };

    void syncWithdrawState();
    const id = setInterval(() => { void syncWithdrawState(); }, 10000);
    return () => clearInterval(id);
  }, [user, documentVisible, applyWithdrawCompletion, applyDepositCompletion]);

  useEffect(() => {
    setInputSkins(prev => {
      const next = prev.filter(s => !lockedSkinIds.has(s.id));
      return next.length === prev.length ? prev : next;
    });
  }, [lockedSkinIds]);

  useEffect(() => {
    if (!user || !documentVisible) return;

    const syncPendingGifts = async () => {
      if (giftSyncInFlightRef.current) return;
      giftSyncInFlightRef.current = true;

      try {
        const pending = await fetchPendingInventoryGrants(user.email);
        if (!pending.length) return;

        const applied = loadAppliedGrantIds(user.userId);
        const alreadyApplied = pending.filter(g => applied.has(g.id));
        const toApply = pending.filter(g => !applied.has(g.id));

        if (alreadyApplied.length) {
          await acknowledgeInventoryGrants(user.email, alreadyApplied.map(g => g.id));
        }

        if (!toApply.length) return;

        markAppliedGrantIds(user.userId, toApply.map(g => g.id));

        setInventory(prev => {
          let next = prev;
          for (const grant of toApply) {
            next = grantSkinToInventory(next, grant.skin);
          }
          return next;
        });

        await acknowledgeInventoryGrants(user.email, toApply.map(g => g.id));
        log('DEPOSIT.received_gifts', {
          count: toApply.length,
          skins: toApply.map(g => g.skin.name).join(' · '),
        });
        sfx.win();
      } catch {
        /* dev API offline */
      } finally {
        giftSyncInFlightRef.current = false;
      }
    };

    void syncPendingGifts();
    const id = setInterval(() => { void syncPendingGifts(); }, 15000);
    return () => clearInterval(id);
  }, [user, documentVisible, log]);

  useEffect(() => {
    if (!user || !documentVisible) return;

    const syncPendingBalanceGifts = async () => {
      if (balanceGiftSyncInFlightRef.current) return;
      balanceGiftSyncInFlightRef.current = true;

      try {
        const pending = await fetchPendingBalanceGrants(user.email);
        if (!pending.length) return;

        const applied = loadAppliedBalanceGrantIds(user.userId);
        const alreadyApplied = pending.filter(g => applied.has(g.id));
        const toApply = pending.filter(g => !applied.has(g.id));

        if (alreadyApplied.length) {
          await acknowledgeBalanceGrants(user.email, alreadyApplied.map(g => g.id));
        }

        if (!toApply.length) return;

        markAppliedBalanceGrantIds(user.userId, toApply.map(g => g.id));

        const totalGranted = toApply.reduce((sum, grant) => sum + grant.amount, 0);
        setBalance(prev => prev + totalGranted);

        await acknowledgeBalanceGrants(user.email, toApply.map(g => g.id));
        log('DEPOSIT.received_balance_gifts', {
          count: toApply.length,
          total: formatUSD(totalGranted),
        });
        sfx.win();
      } catch {
        /* API offline */
      } finally {
        balanceGiftSyncInFlightRef.current = false;
      }
    };

    void syncPendingBalanceGifts();
    const id = setInterval(() => { void syncPendingBalanceGifts(); }, 15000);
    return () => clearInterval(id);
  }, [user, documentVisible, log]);

  const dismissGiveawayWin = useCallback(async () => {
    if (user && giveawayWinData) {
      await ackGiveawayWin(user.userId, giveawayWinData.id);
    }
    setGiveawayWinOpen(false);
  }, [user, giveawayWinData]);

  useEffect(() => {
    if (!user || !documentVisible) {
      if (!user) {
        setGiveawayWinOpen(false);
        setGiveawayWinData(null);
        shownGiveawayWinIdRef.current = null;
      }
      return;
    }

    const syncGiveawayWins = async () => {
      try {
        const pendingWins = await fetchPendingGiveawayWins(user.userId);
        const nextWin = pendingWins[0];
        if (!nextWin || shownGiveawayWinIdRef.current === nextWin.id) return;

        const pendingGrants = await fetchPendingInventoryGrants(user.email);
        const applied = loadAppliedGrantIds(user.userId);
        const toApply = pendingGrants.filter(g => !applied.has(g.id));
        if (toApply.length) {
          markAppliedGrantIds(user.userId, toApply.map(g => g.id));
          setInventory(prev => {
            let next = prev;
            for (const grant of toApply) {
              next = grantSkinToInventory(next, grant.skin);
            }
            return next;
          });
          await acknowledgeInventoryGrants(user.email, toApply.map(g => g.id));
        }

        shownGiveawayWinIdRef.current = nextWin.id;
        setGiveawayWinData(nextWin);
        setGiveawayWinOpen(true);
        sfx.win();
      } catch {
        /* API offline */
      }
    };

    void syncGiveawayWins();
    const id = setInterval(() => { void syncGiveawayWins(); }, 12000);
    return () => clearInterval(id);
  }, [user, documentVisible]);

  useEffect(() => {
    if (inputSkins.length && (multiplier || cap)) {
      applyPresetTarget(inputSkins, multiplier, cap);
    }
  }, [inputSkins, multiplier, cap, applyPresetTarget]);

  useEffect(() => {
    if (userIdRef.current === userId) return;
    saveInventory(inventoryRef.current, userIdRef.current);
    saveBalance(balanceRef.current, userIdRef.current);
    userIdRef.current = userId;
    setInventory(loadInventory(userId));
    setBalance(loadBalance(userId));
    setInputSkins([]);
    setTargetSkin(null);
    setMultiplier(null);
    setCap(null);
  }, [userId]);

  useEffect(() => {
    saveInventory(inventory, userId);
    if (userId && playerStateHydrated) touchLocalPlayerStateUpdatedAt(userId);
  }, [inventory, userId, playerStateHydrated]);

  useEffect(() => {
    saveBalance(balance, userId);
    if (userId && playerStateHydrated) touchLocalPlayerStateUpdatedAt(userId);
  }, [balance, userId, playerStateHydrated]);

  useEffect(() => {
    if (!userId) return;

    const inventoryKey = getInventoryStorageKey(userId);
    const balanceKey = getBalanceStorageKey(userId);
    const pendingKey = getPendingUpgradeStorageKey(userId);

    const onStorage = (event: StorageEvent) => {
      if (event.storageArea !== localStorage || !event.key) return;
      if (event.key === inventoryKey || event.key === balanceKey || event.key === pendingKey) {
        refreshLocalPlayerState();
      }
    };

    const onVisible = () => {
      if (!document.hidden) refreshLocalPlayerState();
    };

    window.addEventListener('storage', onStorage);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener('storage', onStorage);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [userId, refreshLocalPlayerState]);

  useEffect(() => {
    if (!user) {
      setPlayerStateHydrated(true);
      return;
    }

    let cancelled = false;
    setPlayerStateHydrated(false);

    void (async () => {
      const state = await fetchPlayerState(user.email);
      if (cancelled) return;

      if (shouldHydrateFromServer(user.userId, state)) {
        const next = applyPlayerStateSnapshot(user.userId, state!);
        inventoryRef.current = next.inventory;
        balanceRef.current = next.balance;
        setInventory(next.inventory);
        setBalance(next.balance);
        setInputSkins([]);
        setTargetSkin(null);
        setMultiplier(null);
        setCap(null);
      }

      setPlayerStateHydrated(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.userId, user?.email]);

  useEffect(() => {
    if (!user || !playerStateHydrated) return;

    if (playerStateSyncTimerRef.current) {
      window.clearTimeout(playerStateSyncTimerRef.current);
    }

    playerStateSyncTimerRef.current = window.setTimeout(() => {
      if (playerStateSyncInFlightRef.current) return;
      playerStateSyncInFlightRef.current = true;
      void pushPlayerStateSync(inventoryRef.current, balanceRef.current).finally(() => {
        playerStateSyncInFlightRef.current = false;
      });
    }, 2000);

    return () => {
      if (playerStateSyncTimerRef.current) {
        window.clearTimeout(playerStateSyncTimerRef.current);
        playerStateSyncTimerRef.current = null;
      }
    };
  }, [user, inventory, balance, playerStateHydrated, pushPlayerStateSync]);

  useEffect(() => {
    if (!user || !documentVisible) return;

    const pollReset = async () => {
      const resetAt = await fetchPendingAccountReset(user.email);
      if (!resetAt || lastResetAckRef.current === resetAt) return;
      await applyPendingAccountReset(resetAt);
    };

    const pollBan = async () => {
      const banStatus = await fetchAccountBanStatus(user.email);
      if (!banStatus.banned) return;
      authLogout();
      openLogin();
    };

    void pollReset();
    void pollBan();
    const id = setInterval(() => {
      void pollReset();
      void pollBan();
    }, 12000);
    return () => clearInterval(id);
  }, [user, documentVisible, applyPendingAccountReset, authLogout, openLogin]);

  useEffect(() => {
    if (!documentVisible) return;

    let cancelled = false;

    const syncSiteState = async () => {
      try {
        const state = await fetchSiteState();
        if (cancelled) return;
        applySiteState(state, { setFeed, setTotalUpgrades, setPlayersOnline });
      } catch {
        /* dev API offline */
      }
    };

    void syncSiteState();
    const pollMs = DEV_CLEAN_HEADER_LAYOUT ? DEV_FEED_CLIENT_POLL_MS : 5000;
    const id = setInterval(() => { void syncSiteState(); }, pollMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [documentVisible]);

  useEffect(() => {
    if (user) return;
    pendingUpgradeRecoveredRef.current = null;
    pendingConsolationRecoveredRef.current = null;
  }, [user]);

  useEffect(() => {
    if (isUpgradeRolling) return;
    setInputSkins(prev => prev.filter(s => inventory.some(i => i.id === s.id)));
  }, [inventory, isUpgradeRolling]);

  const finalizeUpgrade = useCallback((data: {
    won: boolean;
    roll: RollResult;
    inputLabel: string;
    inputImage: string;
    inputTotal: number;
    targetSkin: Skin;
    probability: number;
  }) => {
    if (!user) return;

    logUpgradeResult(logUser, {
      won: data.won,
      probability: data.probability,
      inputLabel: data.inputLabel,
      targetName: data.targetSkin.name,
      inputTotal: data.inputTotal,
      targetPrice: data.targetSkin.price,
      roll: data.roll,
    });

    const feedItem: FeedItem = {
      id: `f_${user.userId}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      username: getDisplayName(user),
      inputSkin: data.inputLabel,
      targetSkin: data.targetSkin.name,
      inputImage: data.inputImage,
      targetImage: data.targetSkin.image,
      probability: data.probability,
      won: data.won,
      timestamp: Date.now(),
    };

    void publishFeedEvent(feedItem)
      .then(state => applySiteState(state, { setFeed, setTotalUpgrades, setPlayersOnline }))
      .catch(() => { /* polling will catch up */ });
  }, [user, logUser]);

  useEffect(() => {
    if (!user) return;
    if (pendingUpgradeRecoveredRef.current === user.userId) return;

    const pending = loadPendingUpgrade(user.userId);
    pendingUpgradeRecoveredRef.current = user.userId;
    if (!pending?.roll) return;

    clearPendingUpgrade(user.userId);

    if (pending.won) {
      const current = loadInventory(user.userId);
      const next = applyUpgradeWin(current, pending.targetSkin, String(pending.timestamp));
      inventoryRef.current = next;
      saveInventory(next, user.userId);
      setInventory(next);
      void pushPlayerStateSync(next, balanceRef.current);
    }

    finalizeUpgrade({
      won: Boolean(pending.won),
      roll: pending.roll,
      inputLabel: pending.inputLabel,
      inputImage: pending.inputImage ?? pending.targetSkin.image,
      inputTotal: pending.inputTotal,
      targetSkin: pending.targetSkin,
      probability: pending.probability,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps -- recover interrupted upgrade once per login
  }, [user?.userId]);

  useEffect(() => {
    if (!user) return;
    if (pendingConsolationRecoveredRef.current === user.userId) return;
    pendingConsolationRecoveredRef.current = user.userId;

    const pending = loadPendingLossConsolation(user.userId);
    if (!pending || pending.uiSettled) return;

    const stored = loadInventory(user.userId);
    const hasSkin = stored.some(s => s.id === pending.grantedSkin.id);
    const nextInventory = hasSkin ? stored : [...stored, pending.grantedSkin];
    setInventory(nextInventory);
    inventoryRef.current = nextInventory;
    saveInventory(nextInventory, user.userId);
    void pushPlayerStateSync(nextInventory, balanceRef.current);

    clearPendingLossConsolation(user.userId);
    finalizeUpgrade(pending.pending);
    log('UPGRADE.consolation_collect', {
      skin: pending.grantedSkin.name,
      value: formatUSD(pending.grantedSkin.price),
      percent: pending.percent,
      recovered: true,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps -- recover interrupted consolation once per login
  }, [user?.userId]);

  const onUpgradeComplete = useCallback((won: boolean, roll: RollResult) => {
    if (!user || !targetSkin) return;
    const inputs = rollingInputsRef.current;
    if (!inputs.length) return;

    isUpgradeRollingRef.current = false;
    rollingInputIdsRef.current = [];
    rollingInputsRef.current = [];
    setIsUpgradeRolling(false);

    const inputLabel = inputs.length === 1
      ? inputs[0].name
      : `${inputs.length} skins · ${formatUSD(inventoryTotal(inputs))}`;
    const inputImage = inputs.reduce(
      (best, skin) => (skin.price > best.price ? skin : best),
      inputs[0],
    ).image;
    const inputTotal = inventoryTotal(inputs);

    const pendingBeforeClear = loadPendingUpgrade(user.userId);
    const sessionKey = upgradeSessionKeyRef.current
      ?? (pendingBeforeClear?.timestamp != null ? String(pendingBeforeClear.timestamp) : undefined);

    clearPendingUpgrade(user.userId);
    setLocalPlayerStateRevision(rev => rev + 1);
    upgradeSessionKeyRef.current = null;

    const finalizePayload = {
      won,
      roll,
      inputLabel,
      inputImage,
      inputTotal,
      targetSkin,
      probability,
    };

    const clearSelections = () => {
      setInputSkins([]);
      setTargetSkin(null);
      setMultiplier(null);
      setCap(null);
    };

    if (won) {
      const current = loadInventory(user.userId);
      const next = applyUpgradeWin(current, targetSkin, sessionKey);
      inventoryRef.current = next;
      saveInventory(next, user.userId);
      flushSync(() => setInventory(next));
      void pushPlayerStateSync(next, balanceRef.current);
      finalizeUpgrade(finalizePayload);
      clearSelections();
      return;
    }

    if (qualifiesForLossConsolationCase(inputTotal)) {
      lossCaseCollectingRef.current = false;
      const result = buildLossConsolationCase(inputTotal);
      const grantedSkin = createConsolationGrantedSkin(result.rewardSkin);

      const current = loadInventory(user.userId);
      const hasConsolation = current.some(s => s.id === grantedSkin.id);
      const next = hasConsolation ? current : [...current, grantedSkin];
      inventoryRef.current = next;
      saveInventory(next, user.userId);
      flushSync(() => setInventory(next));
      void pushPlayerStateSync(next, balanceRef.current);

      savePendingLossConsolation(user.userId, {
        grantedSkin,
        lostValue: inputTotal,
        inputLabel,
        turbo,
        percent: result.percent,
        rewardSkin: result.rewardSkin,
        pending: finalizePayload,
        uiSettled: false,
        timestamp: Date.now(),
      });

      setLossCase({
        lostValue: inputTotal,
        inputLabel,
        result,
        turbo,
        pending: finalizePayload,
        grantedSkin,
      });
      log('UPGRADE.consolation_case', {
        lost: formatUSD(inputTotal),
        percent: result.percent,
        reward: result.rewardSkin.name,
        rewardValue: formatUSD(result.rewardSkin.price),
      });
      clearSelections();
      return;
    }

    finalizeUpgrade(finalizePayload);
    clearSelections();
  }, [user, targetSkin, probability, turbo, finalizeUpgrade, log, pushPlayerStateSync]);

  const handleLossCaseComplete = useCallback(() => {
    if (!user || !lossCase || lossCaseCollectingRef.current) return;
    lossCaseCollectingRef.current = true;

    const snapshot = lossCase;
    setLossCase(null);
    clearPendingLossConsolation(user.userId);
    void pushPlayerStateSync(inventoryRef.current, balanceRef.current);

    finalizeUpgrade(snapshot.pending);
    log('UPGRADE.consolation_collect', {
      skin: snapshot.grantedSkin.name,
      value: formatUSD(snapshot.grantedSkin.price),
      percent: snapshot.result.percent,
    });
  }, [user, lossCase, finalizeUpgrade, log, pushPlayerStateSync]);

  const handleUpgradeStart = useCallback((): boolean => {
    if (!user || !inputSkins.length || !targetSkin) return false;

    const freshInventory = loadInventory(user.userId);
    const inputs = inputSkins.filter(s => freshInventory.some(item => item.id === s.id));
    if (!inputs.length || inputs.length !== inputSkins.length) {
      log('UPGRADE.start_blocked', {
        reason: 'missing_inputs',
        requested: inputSkins.length,
        available: inputs.length,
      });
      setInputSkins(inputs);
      return false;
    }

    const ids = inputs.map(s => s.id);
    rollingInputsRef.current = inputs;
    rollingInputIdsRef.current = ids;
    isUpgradeRollingRef.current = true;

    const stakeTotal = inventoryTotal(inputs);
    const inputLabel = inputs.length === 1
      ? inputs[0].name
      : `${inputs.length} skins · ${formatUSD(stakeTotal)}`;
    const inputImage = inputs.reduce(
      (best, skin) => (skin.price > best.price ? skin : best),
      inputs[0],
    ).image;

    const sessionTimestamp = Date.now();
    upgradeSessionKeyRef.current = String(sessionTimestamp);

    flushSync(() => {
      setIsUpgradeRolling(true);
      archiveInventorySkins(user.userId, inputs, 'upgraded');
      const current = loadInventory(user.userId);
      const next = commitUpgradeStake(current, inputs);
      inventoryRef.current = next;
      saveInventory(next, user.userId);
      setInventory(next);
    });

    void pushPlayerStateSync(inventoryRef.current, balanceRef.current);

    const xpState = addWagerXp(user.userId, stakeTotal);
    log('XP.wager', {
      wagered: formatUSD(stakeTotal),
      gained: stakeTotal * XP_PER_WAGERED_COIN,
      totalXp: xpState.totalXp,
      level: xpState.level,
    });

    savePendingUpgrade(user.userId, {
      inputSkinIds: ids,
      targetSkin,
      inputImage,
      inputLabel,
      inputTotal: stakeTotal,
      targetPrice: targetSkin.price,
      probability,
      timestamp: sessionTimestamp,
    });
    setLocalPlayerStateRevision(rev => rev + 1);

    log('UPGRADE.start', {
      input: inputLabel,
      inputValue: formatUSD(stakeTotal),
      target: targetSkin.name,
      targetValue: formatUSD(targetSkin.price),
      probability: `${probability}%`,
      turbo,
    });
    return true;
  }, [user, inputSkins, targetSkin, probability, turbo, log, pushPlayerStateSync]);

  const handleUpgradeRollLocked = useCallback((roll: RollResult) => {
    if (!user) return;
    lockPendingUpgradeRoll(user.userId, roll);
  }, [user]);

  return (
    <LayoutGroup>
      <div className={`relative flex flex-col ${
        isScrollablePage
          ? 'h-[100dvh] max-h-[100dvh] overflow-y-auto overscroll-y-contain'
          : DEV_MOBILE_LAYOUT
            ? 'min-h-[100dvh] lg:h-screen lg:overflow-hidden'
            : 'h-screen overflow-hidden'
      }`}
      >
        <ParticleField />
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(176,108,255,0.06),transparent)]" />

        <LoginModal />

        <ThanksToast
          show={thanksToastVisible}
          onDismiss={dismissThanksToast}
          durationMs={5000}
        />

        <GiveawayWinModal
          open={giveawayWinOpen}
          skin={giveawayWinData?.skin ?? null}
          period={giveawayWinData?.period ?? null}
          onClose={() => { void dismissGiveawayWin(); }}
        />

        <ThanksToast
          show={!!liveHelpError}
          title="Error de ayuda"
          subtitle={liveHelpError}
          variant="error"
          onDismiss={() => setLiveHelpError('')}
          durationMs={6000}
        />

        {lossCase && (
          <LossConsolationCaseModal
            open
            lostValue={lossCase.lostValue}
            inputLabel={lossCase.inputLabel}
            result={lossCase.result}
            turbo={lossCase.turbo}
            onComplete={handleLossCaseComplete}
          />
        )}

        {DEV_CLEAN_HEADER_LAYOUT && (
          <LiveFeed items={feed} variant="top" className="w-full" />
        )}

        <Header
          inventory={inventory}
          balance={balance}
          lockedSkinIds={effectiveLockedSkinIds}
          totalUpgrades={totalUpgrades}
          playersOnline={playersOnline}
          onAdminGrantSkin={handleAdminGrantSkin}
          onWithdrawRequest={handleWithdrawRequest}
          onDepositRequest={handleDepositRequest}
          onRobuxDepositRequest={handleRobuxDepositRequest}
          onSupportTicketCompleted={handleSupportTicketCompleted}
          onRegisterOpenSupportChat={openChat => {
            openSupportChatRef.current = openChat;
          }}
          onAccountCleared={handleAccountCleared}
        />

        <div className={`mx-auto flex w-full max-w-[1920px] flex-col gap-2 px-2 pb-2 lg:px-4 ${
          !isScrollablePage && DEV_MOBILE_LAYOUT ? 'min-h-0 flex-1 overflow-x-hidden lg:overflow-hidden' : ''
        }`}
        >
          {!DEV_CLEAN_HEADER_LAYOUT && (
            <LiveFeed items={feed} className="hidden w-[220px] shrink-0 border-r border-white/5 xl:flex" />
          )}

          <div className={`flex flex-col gap-2 ${
            isScrollablePage ? 'w-full' : `min-h-0 flex-1 ${DEV_MOBILE_LAYOUT ? 'lg:overflow-hidden' : ''}`
          }`}
          >
            {isProfilePage ? (
              <ProfilePage
                inventory={inventory}
                balance={balance}
                lockedSkinIds={effectiveLockedSkinIds}
                onSellSkin={handleSellSkin}
              />
            ) : isFreeCasesPage ? (
              freeCaseSlug ? (
                <FreeCaseDetailPage slug={freeCaseSlug} />
              ) : (
                <FreeCasesPage />
              )
            ) : isGiveawaysPage ? (
              giveawayPeriod ? (
                <GiveawayDetailPage period={giveawayPeriod} />
              ) : (
                <GiveawaysPage />
              )
            ) : isAdminPage ? (
              <AdminPage />
            ) : isMainPage ? (
              caseSlug ? (
                <CaseDetailPage
                  slug={caseSlug}
                  balance={balance}
                  onPurchase={handleCatalogCasePurchase}
                />
              ) : (
                <MainPage balance={balance} />
              )
            ) : (
              <UpgradePage
                inventory={inventoryPanelSkins}
                inputSkins={inputSkins}
                targetSkin={targetSkin}
                targetPool={TARGET_POOL}
                probability={probability}
                wheelSize={wheelSize}
                multiplier={multiplier}
                cap={cap}
                canUpgrade={canUpgrade}
                isUpgradeRolling={isUpgradeRolling}
                requiresLogin={!user}
                turbo={turbo}
                lockedSkinIds={effectiveLockedSkinIds}
                upgradeRollingIds={upgradeRollingIds}
                balance={balance}
                liveHelpLoading={liveHelpLoading}
                onLoginRequired={openLogin}
                onMultiplier={handleMultiplier}
                onCap={handleCap}
                onUpgradeStart={handleUpgradeStart}
                onUpgradeRollLocked={handleUpgradeRollLocked}
                onUpgradeComplete={onUpgradeComplete}
                onInputSelect={handleInputSelect}
                onSellSkin={handleSellSkin}
                onPurchase={handleShopPurchase}
                onTargetSelect={handleTargetSelect}
                onClearInput={handleClearInput}
                onClearTarget={handleClearTarget}
                onRandomInput={handleRandomInput}
                onSelectAllInput={handleSelectAllInput}
                onTurboToggle={() => {
                  log('CLICK.turbo', { active: !turbo });
                  setTurbo(t => !t);
                }}
                onLiveHelp={() => { void handleLiveHelp(); }}
              />
            )}
          </div>
        </div>

      </div>
    </LayoutGroup>
  );
}
