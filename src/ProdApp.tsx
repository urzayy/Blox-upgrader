import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { LayoutGroup } from 'framer-motion';
import { Header } from './components/prod/ProdHeader';
import { LiveFeed } from './components/layout/LiveFeed';
import { UpgradeEngine } from './components/upgrade/UpgradeEngine';
import { InventoryShopPanel } from './components/skins/InventoryShopPanel';
import { TargetPanel } from './components/prod/ProdTargetPanel';
import { SelectedSkinSlot } from './components/skins/SelectedSkinSlot';
import { ParticleField } from './components/effects/ParticleField';
import { LoginModal } from './components/auth/LoginModal';
import { TARGET_POOL, sortSkinsByPriceDesc, type Skin, type FeedItem } from './data/skins';
import { useActivityLog } from './hooks/useActivityLog';
import { syncPlayerState, fetchPendingAccountReset } from './lib/playerStateApi';
import { logUpgradeResult } from './lib/userActivityLog';
import { calcProbability, formatUSD, type RollResult } from './lib/wheelMath';
import { applyUpgradeWin, commitUpgradeStake, createConsolationGrantedSkin, grantSkinToInventory, inventoryTotal, MAX_INPUT_SKINS, purchaseSkinCopies, sellSkinFromInventory, withdrawSkinsFromInventory } from './lib/inventory';
import { loadInventory, saveInventory, clearInventoryForUserId } from './lib/inventoryStorage';
import { loadBalance, saveBalance, clearBalanceForUserId } from './lib/balanceStorage';
import { clearPendingUpgrade, loadPendingUpgrade, lockPendingUpgradeRoll, savePendingUpgrade } from './lib/prodUpgradePendingStorage';
import {
  clearPendingLossConsolation,
  loadPendingLossConsolation,
  savePendingLossConsolation,
} from './lib/lossConsolationPendingStorage';
import { normalizeGrantEmail } from './lib/inventoryGrants';
import { BASE_TOTAL_UPGRADES } from './lib/feed';
import { applySiteState, fetchSiteState, publishFeedEvent } from './lib/siteStateApi';
import { findTargetForPreset } from './lib/upgradePresets';
import { sfx } from './lib/audio';
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
import { ADMIN_PROMO_CODES_ENABLED } from './lib/devAdminPromoCodes';
import { DEV_DEPOSIT_WITHDRAW_HISTORY } from './lib/devDepositWithdrawHistory';
import { ADMIN_BAN_ENABLED } from './lib/devAdminBan';
import { fetchAccountBanStatus } from './lib/accountBanApi';
import { qualifiesForLossConsolationCase } from './lib/devLossConsolation';
import { DEV_MOBILE_LAYOUT } from './lib/devMobileLayout';
import { buildLossConsolationCase, type LossConsolationResult } from './lib/lossConsolationCase';
import { LossConsolationCaseModal } from './components/upgrade/LossConsolationCaseModal';
import { PlayerAnnouncementModal } from './components/announcements/PlayerAnnouncementModal';
import { usePlayerAnnouncement } from './hooks/usePlayerAnnouncement';
import { clearXpForUserId } from './lib/xpStorage';
import { clearFreeCaseCooldowns } from './lib/freeCaseCooldown';

export default function ProdApp() {
  const { user, logout: authLogout, openLogin } = useAuth();
  const {
    announcement: playerAnnouncement,
    open: playerAnnouncementOpen,
    dismiss: dismissPlayerAnnouncement,
  } = usePlayerAnnouncement({ userId: user?.userId });
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
  const [isUpgradeRolling, setIsUpgradeRolling] = useState(false);
  const isUpgradeRollingRef = useRef(false);
  const rollingInputIdsRef = useRef<string[]>([]);
  const rollingInputsRef = useRef<Skin[]>([]);
  const [thanksToastVisible, setThanksToastVisible] = useState(false);
  const inventoryRef = useRef(inventory);
  const balanceRef = useRef(balance);
  const userIdRef = useRef(userId);
  const openSupportChatRef = useRef<(ticketId: string) => void>(() => {});
  const [liveHelpLoading, setLiveHelpLoading] = useState(false);
  const [liveHelpError, setLiveHelpError] = useState('');
  const initialWithdrawSyncRef = useRef(true);
  const giftSyncInFlightRef = useRef(false);
  const balanceGiftSyncInFlightRef = useRef(false);
  const lastResetAckRef = useRef<number | null>(null);
  const pendingUpgradeRecoveredRef = useRef<string | null>(null);
  const pendingConsolationRecoveredRef = useRef<string | null>(null);
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
  const canUpgrade = probability > 0;

  const handleLogout = useCallback(() => {
    saveInventory(inventory, userId);
    authLogout();
  }, [inventory, userId, authLogout]);

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

  const isSkinLocked = useCallback((skinId: string) => {
    if (lockedSkinIds.has(skinId)) return true;
    if (isUpgradeRollingRef.current && rollingInputIdsRef.current.includes(skinId)) return true;
    return upgradeRollingIds.has(skinId);
  }, [lockedSkinIds, upgradeRollingIds]);

  const effectiveLockedSkinIds = useMemo(() => {
    if (upgradeRollingIds.size === 0) return lockedSkinIds;
    return new Set([...lockedSkinIds, ...upgradeRollingIds]);
  }, [lockedSkinIds, upgradeRollingIds]);

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

  const handleSellSkin = useCallback((skin: Skin) => {
    if (isSkinLocked(skin.id)) return;
    setInventory(prev => sellSkinFromInventory(prev, skin.id));
    setBalance(prev => prev + skin.price);
    setInputSkins(prev => prev.filter(s => s.id !== skin.id));
    log('INVENTORY.sell', { skin: skin.name, price: formatUSD(skin.price), weapon: skin.weapon });
    sfx.select();
  }, [isSkinLocked, log]);

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

  const handleAdminGrantSkin = useCallback((skin: Skin) => {
    if (!isAdmin(user)) return;
    log('DEPOSIT.admin', { skin: skin.name, price: formatUSD(skin.price), weapon: skin.weapon });
    setInventory(prev => grantSkinToInventory(prev, skin));
    sfx.win();
  }, [user, log]);

  const handleWithdrawRequest = useCallback(async (skins: Skin[]): Promise<string | null> => {
    if (!user || !skins.length) return null;
    try {
      const bundle = await createWithdrawTicket(user, skins, getProfileLabel(user));
      log('WITHDRAW.request', {
        ticketId: bundle.ticket.id,
        count: skins.length,
        total: formatUSD(inventoryTotal(skins)),
        skins: skins.map(s => s.name).join(' · '),
      });
      setLockedSkinIds(prev => {
        const next = new Set(prev);
        for (const skin of skins) next.add(skin.id);
        return next;
      });
      setInputSkins(prev => prev.filter(s => !skins.some(w => w.id === s.id)));
      sfx.select();
      return bundle.ticket.id;
    } catch {
      log('WITHDRAW.request_failed', { count: skins.length });
      return null;
    }
  }, [user, log]);

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
    setInventory(prev => withdrawSkinsFromInventory(prev, ids));
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
        setLiveHelpError('Could not open chat. Reload the page.');
        return;
      }
      openSupportChatRef.current(ticketId);
    } catch {
      setLiveHelpError('Could not connect to support. Please try again.');
      log('HELP.request_failed');
    } finally {
      setLiveHelpLoading(false);
    }
  }, [user, openLogin, log]);

  useEffect(() => {
    if (!user) {
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
    const id = setInterval(() => { void syncWithdrawState(); }, 3000);
    return () => clearInterval(id);
  }, [user, applyWithdrawCompletion, applyDepositCompletion]);

  useEffect(() => {
    setInputSkins(prev => {
      const next = prev.filter(s => !lockedSkinIds.has(s.id));
      return next.length === prev.length ? prev : next;
    });
  }, [lockedSkinIds]);

  useEffect(() => {
    if (!user) return;

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
    const id = setInterval(() => { void syncPendingGifts(); }, 8000);
    return () => clearInterval(id);
  }, [user, log]);

  useEffect(() => {
    if (!user) return;

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
    const id = setInterval(() => { void syncPendingBalanceGifts(); }, 8000);
    return () => clearInterval(id);
  }, [user, log]);

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
  }, [inventory, userId]);

  useEffect(() => {
    saveBalance(balance, userId);
  }, [balance, userId]);

  useEffect(() => {
    if (!user) return;
    void pushPlayerStateSync(inventory, balance);
  }, [user?.userId, pushPlayerStateSync]);

  useEffect(() => {
    if (!user) return;
    const timer = setTimeout(() => {
      void pushPlayerStateSync(inventory, balance);
    }, 800);
    return () => clearTimeout(timer);
  }, [user, inventory, balance, pushPlayerStateSync]);

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
    }, 500);
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
    const id = setInterval(() => { void syncSiteState(); }, 5000);
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
      setInventory(prev => {
        const next = applyUpgradeWin(prev, pending.targetSkin);
        inventoryRef.current = next;
        saveInventory(next, user.userId);
        return next;
      });
      void pushPlayerStateSync(inventoryRef.current, balanceRef.current);
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

    clearPendingUpgrade(user.userId);

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
      setInventory(prev => applyUpgradeWin(prev, targetSkin));
      finalizeUpgrade(finalizePayload);
      clearSelections();
      return;
    }

    if (qualifiesForLossConsolationCase(inputTotal)) {
      lossCaseCollectingRef.current = false;
      const result = buildLossConsolationCase(inputTotal);
      const grantedSkin = createConsolationGrantedSkin(result.rewardSkin);

      flushSync(() => {
        setInventory(prev => {
          const next = [...prev, grantedSkin];
          inventoryRef.current = next;
          saveInventory(next, user.userId);
          return next;
        });
      });
      void pushPlayerStateSync(inventoryRef.current, balanceRef.current);

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

  const handleUpgradeStart = useCallback(() => {
    if (!user || !inputSkins.length || !targetSkin) return;

    const inputs = inputSkins.slice();
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

    flushSync(() => {
      setIsUpgradeRolling(true);
      setInventory(prev => {
        const next = commitUpgradeStake(prev, inputs);
        inventoryRef.current = next;
        saveInventory(next, user.userId);
        return next;
      });
    });

    void pushPlayerStateSync(inventoryRef.current, balanceRef.current);

    savePendingUpgrade(user.userId, {
      targetSkin,
      inputImage,
      inputLabel,
      inputTotal: stakeTotal,
      targetPrice: targetSkin.price,
      probability,
      timestamp: Date.now(),
    });

    log('UPGRADE.start', {
      input: inputLabel,
      inputValue: formatUSD(stakeTotal),
      target: targetSkin.name,
      targetValue: formatUSD(targetSkin.price),
      probability: `${probability}%`,
      turbo,
    });
  }, [user, inputSkins, targetSkin, probability, turbo, log, pushPlayerStateSync]);

  const handleUpgradeRollLocked = useCallback((roll: RollResult) => {
    if (!user) return;
    lockPendingUpgradeRoll(user.userId, roll);
  }, [user]);

  return (
    <LayoutGroup>
      <div className={`relative flex flex-col ${
        DEV_MOBILE_LAYOUT ? 'min-h-[100dvh] lg:h-screen lg:overflow-hidden' : 'h-screen overflow-hidden'
      }`}
      >
        <ParticleField />
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(255,215,0,0.06),transparent)]" />

        <LoginModal />

        <PlayerAnnouncementModal
          open={playerAnnouncementOpen}
          announcement={playerAnnouncement}
          onClose={dismissPlayerAnnouncement}
        />

        <ThanksToast
          show={thanksToastVisible}
          onDismiss={dismissThanksToast}
          durationMs={5000}
        />

        <ThanksToast
          show={!!liveHelpError}
          title="Help error"
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

        <Header
          inventory={inventory}
          balance={balance}
          lockedSkinIds={effectiveLockedSkinIds}
          totalUpgrades={totalUpgrades}
          playersOnline={playersOnline}
          turbo={turbo}
          onTurboToggle={() => {
            log('CLICK.turbo', { active: !turbo });
            setTurbo(t => !t);
          }}
          onLogout={handleLogout}
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

        <div className={`mx-auto flex min-h-0 w-full max-w-[1920px] flex-1 gap-2 px-2 pb-2 lg:px-4 ${
          DEV_MOBILE_LAYOUT ? 'overflow-x-hidden lg:overflow-hidden' : ''
        }`}
        >
          <LiveFeed items={feed} className="hidden w-[220px] shrink-0 border-r border-white/5 xl:flex" />

          <div className={`flex min-h-0 flex-1 flex-col gap-2 ${
            DEV_MOBILE_LAYOUT ? 'lg:overflow-hidden' : ''
          }`}
          >
            {DEV_MOBILE_LAYOUT ? (
              <>
                <div className="flex shrink-0 justify-center lg:hidden">
                  <UpgradeEngine
                    probability={probability}
                    wheelSize={wheelSize}
                    multiplier={multiplier}
                    cap={cap}
                    canUpgrade={canUpgrade}
                    requiresLogin={!user}
                    onLoginRequired={openLogin}
                    turbo={turbo}
                    onMultiplier={handleMultiplier}
                    onCap={handleCap}
                    onUpgradeStart={handleUpgradeStart}
                    onUpgradeRollLocked={handleUpgradeRollLocked}
                    onComplete={onUpgradeComplete}
                  />
                </div>
                <div className="grid shrink-0 grid-cols-2 gap-2 lg:hidden">
                  <SelectedSkinSlot
                    skins={inputSkins}
                    variant="input"
                    inputRolling={isUpgradeRolling}
                    onClear={() => {
                      if (isUpgradeRolling) return;
                      log('CLICK.clear_input', { count: inputSkins.length });
                      setInputSkins([]);
                    }}
                  />
                  <SelectedSkinSlot
                    skin={targetSkin}
                    variant="target"
                    onClear={() => {
                      log('CLICK.clear_target', { skin: targetSkin?.name ?? '' });
                      setTargetSkin(null);
                    }}
                  />
                </div>
                <div className="hidden shrink-0 flex-col gap-2 lg:flex lg:flex-row lg:gap-3">
                  <SelectedSkinSlot
                    skins={inputSkins}
                    variant="input"
                    inputRolling={isUpgradeRolling}
                    onClear={() => {
                      if (isUpgradeRolling) return;
                      log('CLICK.clear_input', { count: inputSkins.length });
                      setInputSkins([]);
                    }}
                  />
                  <UpgradeEngine
                    probability={probability}
                    wheelSize={wheelSize}
                    multiplier={multiplier}
                    cap={cap}
                    canUpgrade={canUpgrade}
                    requiresLogin={!user}
                    onLoginRequired={openLogin}
                    turbo={turbo}
                    onMultiplier={handleMultiplier}
                    onCap={handleCap}
                    onUpgradeStart={handleUpgradeStart}
                    onUpgradeRollLocked={handleUpgradeRollLocked}
                    onComplete={onUpgradeComplete}
                  />
                  <SelectedSkinSlot
                    skin={targetSkin}
                    variant="target"
                    onClear={() => {
                      log('CLICK.clear_target', { skin: targetSkin?.name ?? '' });
                      setTargetSkin(null);
                    }}
                  />
                </div>
              </>
            ) : (
            <div className="flex shrink-0 gap-2 lg:gap-3">
              <SelectedSkinSlot
                skins={inputSkins}
                variant="input"
                inputRolling={isUpgradeRolling}
                onClear={() => {
                  if (isUpgradeRolling) return;
                  log('CLICK.clear_input', { count: inputSkins.length });
                  setInputSkins([]);
                }}
              />

              <UpgradeEngine
                probability={probability}
                wheelSize={wheelSize}
                multiplier={multiplier}
                cap={cap}
                canUpgrade={canUpgrade}
                requiresLogin={!user}
                onLoginRequired={openLogin}
                turbo={turbo}
                onMultiplier={handleMultiplier}
                onCap={handleCap}
                onUpgradeStart={handleUpgradeStart}
                onUpgradeRollLocked={handleUpgradeRollLocked}
                onComplete={onUpgradeComplete}
              />

              <SelectedSkinSlot
                skin={targetSkin}
                variant="target"
                onClear={() => {
                  log('CLICK.clear_target', { skin: targetSkin?.name ?? '' });
                  setTargetSkin(null);
                }}
              />
            </div>
            )}

            <div className={`grid min-h-0 flex-1 grid-cols-1 gap-2 lg:grid-cols-2 ${
              DEV_MOBILE_LAYOUT ? 'lg:[&>section]:min-h-0' : ''
            }`}
            >
              <InventoryShopPanel
                skins={inventoryPanelSkins}
                selected={inputSkins}
                maxSelected={MAX_INPUT_SKINS}
                lockedSkinIds={lockedSkinIds}
                upgradeRollingIds={upgradeRollingIds}
                balance={balance}
                requiresLogin={!user}
                onLoginRequired={openLogin}
                onSelect={handleInputSelect}
                onSell={handleSellSkin}
                onPurchase={handleShopPurchase}
              />
              <TargetPanel
                skins={TARGET_POOL}
                selected={targetSkin}
                onLiveHelp={() => { void handleLiveHelp(); }}
                liveHelpLoading={liveHelpLoading}
                showAdminPromoCodes={ADMIN_PROMO_CODES_ENABLED && isAdmin(user)}
                showTransactionHistory={DEV_DEPOSIT_WITHDRAW_HISTORY && isAdmin(user)}
                showAdminBan={ADMIN_BAN_ENABLED && isAdmin(user)}
                adminEmail={user?.email}
                onSelect={s => {
                  if (targetSkin?.id === s.id) {
                    log('CLICK.deselect_target', { skin: s.name, price: formatUSD(s.price) });
                    sfx.select();
                    setTargetSkin(null);
                    return;
                  }
                  log('CLICK.select_target', { skin: s.name, price: formatUSD(s.price) });
                  sfx.select();
                  setTargetSkin(s);
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </LayoutGroup>
  );
}
