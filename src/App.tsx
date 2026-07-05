import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LayoutGroup } from 'framer-motion';
import { Header } from './components/layout/Header';
import { LiveFeed } from './components/layout/LiveFeed';
import { UpgradeEngine } from './components/upgrade/UpgradeEngine';
import { InventoryShopPanel } from './components/skins/InventoryShopPanel';
import { TargetPanel } from './components/skins/TargetPanel';
import { SelectedSkinSlot } from './components/skins/SelectedSkinSlot';
import { ParticleField } from './components/effects/ParticleField';
import { LoginModal } from './components/auth/LoginModal';
import { TARGET_POOL, sortSkinsByPriceDesc, type Skin, type FeedItem } from './data/skins';
import { useActivityLog } from './hooks/useActivityLog';
import { logUpgradeResult } from './lib/userActivityLog';
import { calcProbability, formatUSD, type RollResult } from './lib/wheelMath';
import { applyUpgradeToInventory, grantSkinToInventory, inventoryTotal, MAX_INPUT_SKINS, purchaseSkinCopies, sellSkinFromInventory, withdrawSkinsFromInventory } from './lib/inventory';
import { loadInventory, saveInventory } from './lib/inventoryStorage';
import { loadBalance, saveBalance } from './lib/balanceStorage';
import { BASE_TOTAL_UPGRADES } from './lib/feed';
import { applySiteState, fetchSiteState, publishFeedEvent } from './lib/siteStateApi';
import { findTargetForPreset } from './lib/upgradePresets';
import { sfx } from './lib/audio';
import { useWheelSize } from './hooks/useWheelSize';
import { useDocumentVisible } from './hooks/useDocumentVisible';
import { getDisplayName, getProfileLabel, isAdmin } from './lib/auth';
import { useAuth } from './context/AuthContext';
import { createWithdrawTicket, createDepositTicket, fetchUserWithdrawTickets, getDepositCreditAmount, getPendingWithdrawSkinIds, getTicketType, type WithdrawTicket } from './lib/withdrawChat';
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

export default function App() {
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
  const [thanksToastVisible, setThanksToastVisible] = useState(false);
  const [upgradeLocked, setUpgradeLocked] = useState(false);
  const inventoryRef = useRef(inventory);
  const balanceRef = useRef(balance);
  const userIdRef = useRef(userId);
  const upgradeLockedRef = useRef(false);
  const initialWithdrawSyncRef = useRef(true);
  const giftSyncInFlightRef = useRef(false);
  const balanceGiftSyncInFlightRef = useRef(false);
  inventoryRef.current = inventory;
  balanceRef.current = balance;

  const inputTotal = useMemo(() => inventoryTotal(inputSkins), [inputSkins]);

  /** Sorted view for the inventory panel only (shop / withdraw keep storage order). */
  const inventoryPanelSkins = useMemo(
    () => sortSkinsByPriceDesc(inventory),
    [inventory],
  );

  const probability = useMemo(
    () => calcProbability(inputTotal, targetSkin?.price ?? 0),
    [inputTotal, targetSkin],
  );

  const dismissThanksToast = useCallback(() => setThanksToastVisible(false), []);
  const handleUpgradeLockedChange = useCallback((locked: boolean) => {
    upgradeLockedRef.current = locked;
    setUpgradeLocked(locked);
  }, []);
  const wheelSize = useWheelSize();
  const documentVisible = useDocumentVisible();
  const canUpgrade = probability > 0;

  const handleLogout = useCallback(() => {
    saveInventory(inventory, userId);
    authLogout();
  }, [inventory, userId, authLogout]);

  const applyPresetTarget = useCallback((inputs: Skin[], mult: number | null, capVal: number | null) => {
    const total = inventoryTotal(inputs);
    if (total <= 0 || (!mult && !capVal)) return;
    const target = findTargetForPreset(TARGET_POOL, total, mult, capVal);
    if (target) setTargetSkin(target);
  }, []);

  const handleMultiplier = useCallback((m: number) => {
    if (upgradeLockedRef.current) return;
    const nextMult = multiplier === m ? null : m;
    log('CLICK.multiplier', { value: `x${m}`, active: nextMult !== null });
    setMultiplier(nextMult);
    setCap(null);
    applyPresetTarget(inputSkins, nextMult, null);
    if (inputSkins.length && nextMult) sfx.select();
  }, [multiplier, inputSkins, applyPresetTarget, log]);

  const handleCap = useCallback((p: number) => {
    if (upgradeLockedRef.current) return;
    const nextCap = cap === p ? null : p;
    log('CLICK.cap', { value: `${p}%`, active: nextCap !== null });
    setMultiplier(null);
    setCap(nextCap);
    applyPresetTarget(inputSkins, null, nextCap);
    if (inputSkins.length && nextCap) sfx.select();
  }, [cap, inputSkins, applyPresetTarget, log]);

  const handleInputSelect = useCallback((s: Skin) => {
    if (upgradeLockedRef.current || lockedSkinIds.has(s.id)) return;
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
  }, [log, lockedSkinIds]);

  const handleSellSkin = useCallback((skin: Skin) => {
    if (upgradeLockedRef.current || lockedSkinIds.has(skin.id)) return;
    setInventory(prev => sellSkinFromInventory(prev, skin.id));
    setBalance(prev => prev + skin.price);
    setInputSkins(prev => prev.filter(s => s.id !== skin.id));
    log('INVENTORY.sell', { skin: skin.name, price: formatUSD(skin.price), weapon: skin.weapon });
    sfx.select();
  }, [lockedSkinIds, log]);

  const handleShopPurchase = useCallback((items: ShopPurchaseItem[]): boolean => {
    if (upgradeLockedRef.current || !user) return false;
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
    log('DEPOSIT.complete', {
      ticketId: ticket.id,
      count: ticket.skins.length,
      total: formatUSD(amount),
      skins: ticket.skins.map(s => s.name).join(' · '),
    });
    setBalance(prev => prev + amount);
  }, [user, log]);

  const handleWithdrawTicketCompleted = useCallback((ticket: WithdrawTicket) => {
    applyWithdrawCompletion(ticket, true);
  }, [applyWithdrawCompletion]);

  const handleDepositRequest = useCallback(async (items: DepositItem[]): Promise<string | null> => {
    if (!user || !items.length) return null;
    const total = items.reduce((sum, item) => sum + item.skin.price * item.quantity, 0);
    if (total <= 0) return null;
    try {
      const bundle = await createDepositTicket(user, getProfileLabel(user), items);
      log('DEPOSIT.request', {
        ticketId: bundle.ticket.id,
        count: items.reduce((sum, item) => sum + item.quantity, 0),
        total: formatUSD(total),
        skins: items.map(item => `${item.quantity}× ${item.skin.name}`).join(' · '),
      });
      sfx.select();
      return bundle.ticket.id;
    } catch {
      log('DEPOSIT.request_failed', { total: formatUSD(total) });
      return null;
    }
  }, [user, log]);

  const handleSupportTicketCompleted = useCallback((ticket: WithdrawTicket) => {
    if (getTicketType(ticket) === 'deposit') {
      applyDepositCompletion(ticket);
      return;
    }
    handleWithdrawTicketCompleted(ticket);
  }, [applyDepositCompletion, handleWithdrawTicketCompleted]);

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
    setInputSkins(prev => prev.filter(s => inventory.some(i => i.id === s.id)));
  }, [inventory]);

  const onUpgradeComplete = useCallback((won: boolean, roll: RollResult) => {
    if (!user || !inputSkins.length || !targetSkin) return;

    setInventory(prev => applyUpgradeToInventory(prev, inputSkins, targetSkin, won));

    const inputLabel = inputSkins.length === 1
      ? inputSkins[0].name
      : `${inputSkins.length} skins · ${formatUSD(inputTotal)}`;

    logUpgradeResult(logUser, {
      won,
      probability,
      inputLabel,
      targetName: targetSkin.name,
      inputTotal,
      targetPrice: targetSkin.price,
      roll,
    });

    const feedItem: FeedItem = {
      id: `f_${user.userId}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      username: getDisplayName(user),
      inputSkin: inputLabel,
      targetSkin: targetSkin.name,
      inputImage: inputSkins.reduce((best, s) => (s.price > best.price ? s : best), inputSkins[0]).image,
      targetImage: targetSkin.image,
      probability,
      won,
      timestamp: Date.now(),
    };

    void publishFeedEvent(feedItem)
      .then(state => applySiteState(state, { setFeed, setTotalUpgrades, setPlayersOnline }))
      .catch(() => { /* polling will catch up */ });

    setInputSkins([]);
    setTargetSkin(null);
    setMultiplier(null);
    setCap(null);
  }, [inputSkins, targetSkin, probability, inputTotal, user, logUser]);

  const handleUpgradeStart = useCallback(() => {
    if (!user || !inputSkins.length || !targetSkin) return;
    const inputLabel = inputSkins.length === 1
      ? inputSkins[0].name
      : `${inputSkins.length} skins · ${formatUSD(inputTotal)}`;
    log('UPGRADE.start', {
      input: inputLabel,
      inputValue: formatUSD(inputTotal),
      target: targetSkin.name,
      targetValue: formatUSD(targetSkin.price),
      probability: `${probability}%`,
      turbo,
    });
  }, [user, inputSkins, targetSkin, inputTotal, probability, turbo, log]);

  return (
    <LayoutGroup>
      <div className="relative flex h-screen flex-col overflow-hidden">
        <ParticleField />
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(255,215,0,0.06),transparent)]" />

        <LoginModal />

        <ThanksToast
          show={thanksToastVisible}
          onDismiss={dismissThanksToast}
          durationMs={5000}
        />

        {upgradeLocked && (
          <div
            className="fixed inset-0 z-[140] cursor-wait bg-black/50 backdrop-blur-[2px]"
            aria-hidden="true"
            role="presentation"
          />
        )}

        <Header
          inventory={inventory}
          balance={balance}
          lockedSkinIds={lockedSkinIds}
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
          onSupportTicketCompleted={handleSupportTicketCompleted}
        />

        <div className="mx-auto flex min-h-0 w-full max-w-[1920px] flex-1 gap-2 px-2 pb-2 lg:px-4">
          <LiveFeed items={feed} className="hidden w-[220px] shrink-0 border-r border-white/5 xl:flex" />

          <div className="flex min-h-0 flex-1 flex-col gap-2">
            <div className="flex shrink-0 gap-2 lg:gap-3">
              <SelectedSkinSlot
                skins={inputSkins}
                variant="input"
                onClear={() => {
                  if (upgradeLockedRef.current) return;
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
                onComplete={onUpgradeComplete}
                onLockedChange={handleUpgradeLockedChange}
              />

              <SelectedSkinSlot
                skin={targetSkin}
                variant="target"
                onClear={() => {
                  if (upgradeLockedRef.current) return;
                  log('CLICK.clear_target', { skin: targetSkin?.name ?? '' });
                  setTargetSkin(null);
                }}
              />
            </div>

            <div className="grid min-h-0 flex-1 grid-cols-1 gap-2 lg:grid-cols-2">
              <InventoryShopPanel
                skins={inventoryPanelSkins}
                selected={inputSkins}
                maxSelected={MAX_INPUT_SKINS}
                lockedSkinIds={lockedSkinIds}
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
                onSelect={s => {
                  if (upgradeLockedRef.current) return;
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
