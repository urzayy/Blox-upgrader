import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { LayoutGroup } from 'framer-motion';
import { Header } from './components/layout/Header';
import { LiveFeed } from './components/layout/LiveFeed';
import { UpgradeEngine } from './components/upgrade/UpgradeEngine';
import { InventoryPanel } from './components/skins/InventoryPanel';
import { TargetPanel } from './components/skins/TargetPanel';
import { SelectedSkinSlot } from './components/skins/SelectedSkinSlot';
import { ParticleField } from './components/effects/ParticleField';
import { LoginModal } from './components/auth/LoginModal';
import { TARGET_POOL, type Skin, type FeedItem } from './data/skins';
import { useActivityLog } from './hooks/useActivityLog';
import { logUpgradeResult } from './lib/userActivityLog';
import { calcProbability, formatUSD, type RollResult } from './lib/wheelMath';
import { applyUpgradeToInventory, grantSkinToInventory, inventoryTotal, MAX_INPUT_SKINS } from './lib/inventory';
import { loadInventory, saveInventory, clearInventoryForUserId } from './lib/inventoryStorage';
import { ADMIN_EMAILS } from './lib/auth';
import { createFeedItem } from './lib/feed';
import { loadFeed, loadTotalUpgrades, saveFeed, saveTotalUpgrades } from './lib/siteStorage';
import { findTargetForPreset } from './lib/upgradePresets';
import { sfx } from './lib/audio';
import { useWheelSize } from './hooks/useWheelSize';
import { getDisplayName, isAdmin } from './lib/auth';
import { useAuth } from './context/AuthContext';

export default function App() {
  const { user, logout: authLogout, openLogin } = useAuth();
  const { log, logUser } = useActivityLog();
  const userId = user?.userId ?? null;

  const [inventory, setInventory] = useState<Skin[]>(() => loadInventory(userId));
  const [inputSkins, setInputSkins] = useState<Skin[]>([]);
  const [targetSkin, setTargetSkin] = useState<Skin | null>(null);
  const [multiplier, setMultiplier] = useState<number | null>(null);
  const [cap, setCap] = useState<number | null>(null);
  const [feed, setFeed] = useState<FeedItem[]>(() => loadFeed());
  const [totalUpgrades, setTotalUpgrades] = useState(() => loadTotalUpgrades());
  const [turbo, setTurbo] = useState(false);
  const inventoryRef = useRef(inventory);
  const userIdRef = useRef(userId);
  inventoryRef.current = inventory;

  const inputTotal = useMemo(() => inventoryTotal(inputSkins), [inputSkins]);

  const probability = useMemo(
    () => calcProbability(inputTotal, targetSkin?.price ?? 0),
    [inputTotal, targetSkin],
  );

  const wheelSize = useWheelSize();
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

  const handleInputSelect = useCallback((s: Skin) => {
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
  }, [log]);

  const handleAdminGrantSkin = useCallback((skin: Skin) => {
    if (!isAdmin(user)) return;
    log('DEPOSIT.admin', { skin: skin.name, price: formatUSD(skin.price), weapon: skin.weapon });
    setInventory(prev => grantSkinToInventory(prev, skin));
    sfx.win();
  }, [user, log]);

  useEffect(() => {
    if (inputSkins.length && (multiplier || cap)) {
      applyPresetTarget(inputSkins, multiplier, cap);
    }
  }, [inputSkins, multiplier, cap, applyPresetTarget]);

  useLayoutEffect(() => {
    if (!user || !(ADMIN_EMAILS as readonly string[]).includes(user.email)) return;
    const flag = 'blox-upgrader/wipe-urzay-inv-v2';
    if (localStorage.getItem(flag)) return;
    localStorage.setItem(flag, '1');
    clearInventoryForUserId(user.userId);
    setInventory([]);
    setInputSkins([]);
    setTargetSkin(null);
  }, [user]);

  useEffect(() => {
    if (userIdRef.current === userId) return;
    saveInventory(inventoryRef.current, userIdRef.current);
    userIdRef.current = userId;
    setInventory(loadInventory(userId));
    setInputSkins([]);
    setTargetSkin(null);
    setMultiplier(null);
    setCap(null);
  }, [userId]);

  useEffect(() => {
    saveInventory(inventory, userId);
  }, [inventory, userId]);

  useEffect(() => {
    saveFeed(feed);
  }, [feed]);

  useEffect(() => {
    saveTotalUpgrades(totalUpgrades);
  }, [totalUpgrades]);

  useEffect(() => {
    setInputSkins(prev => prev.filter(s => inventory.some(i => i.id === s.id)));
  }, [inventory]);

  useEffect(() => {
    const id = setInterval(() => {
      setFeed(f => [createFeedItem(), ...f].slice(0, 40));
      setTotalUpgrades(t => t + 1);
    }, 3500);
    return () => clearInterval(id);
  }, []);

  const onUpgradeComplete = useCallback((won: boolean, roll: RollResult) => {
    if (!user || !inputSkins.length || !targetSkin) return;

    setInventory(prev => applyUpgradeToInventory(prev, inputSkins, targetSkin, won));
    setTotalUpgrades(t => t + 1);

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

    setFeed(f => [{
      id: `f_${Date.now()}`,
      username: getDisplayName(user),
      inputSkin: inputLabel,
      targetSkin: targetSkin.name,
      probability,
      won,
      timestamp: Date.now(),
    }, ...f].slice(0, 40));

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

        <Header
          inventory={inventory}
          totalUpgrades={totalUpgrades}
          turbo={turbo}
          onTurboToggle={() => {
            log('CLICK.turbo', { active: !turbo });
            setTurbo(t => !t);
          }}
          onLogout={handleLogout}
          onAdminGrantSkin={handleAdminGrantSkin}
        />

        <div className="mx-auto flex min-h-0 w-full max-w-[1920px] flex-1 gap-2 px-2 pb-2 lg:px-4">
          <LiveFeed items={feed} className="hidden w-[220px] shrink-0 border-r border-white/5 xl:flex" />

          <div className="flex min-h-0 flex-1 flex-col gap-2">
            <div className="flex shrink-0 gap-2 lg:gap-3">
              <SelectedSkinSlot
                skins={inputSkins}
                variant="input"
                onClear={() => {
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

            <div className="grid min-h-0 flex-1 grid-cols-1 gap-2 lg:grid-cols-2">
              <InventoryPanel
                skins={inventory}
                selected={inputSkins}
                maxSelected={MAX_INPUT_SKINS}
                onSelect={handleInputSelect}
              />
              <TargetPanel
                skins={TARGET_POOL}
                selected={targetSkin}
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
