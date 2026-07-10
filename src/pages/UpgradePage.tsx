import { useRef } from 'react';
import type { Skin } from '../data/skins';
import { TargetPanel } from '../components/skins/TargetPanel';
import { UpgradeEngine, type UpgradeEngineHandle } from '../components/upgrade/UpgradeEngine';
import { UpgradeSelectionPanel } from '../components/upgrade/UpgradeSelectionPanel';
import { UpgradeInventoryColumn } from '../components/upgrade/UpgradeInventoryColumn';
import { UpgradeMultiplierBar } from '../components/upgrade/UpgradeMultiplierBar';
import type { ShopPurchaseItem } from '../components/shop/ShopPanel';
import type { RollResult } from '../lib/wheelMath';

interface Props {
  inventory: Skin[];
  inputSkins: Skin[];
  targetSkin: Skin | null;
  targetPool: Skin[];
  probability: number;
  wheelSize: number;
  multiplier: number | null;
  cap: number | null;
  canUpgrade: boolean;
  isUpgradeRolling: boolean;
  requiresLogin: boolean;
  turbo: boolean;
  lockedSkinIds: ReadonlySet<string>;
  upgradeRollingIds: ReadonlySet<string>;
  balance: number;
  liveHelpLoading: boolean;
  onLoginRequired: () => void;
  onMultiplier: (m: number) => void;
  onCap: (c: number) => void;
  onUpgradeStart: () => boolean;
  onUpgradeRollLocked: (roll: RollResult) => void;
  onUpgradeComplete: (won: boolean, roll: RollResult) => void;
  onInputSelect: (skin: Skin) => void;
  onSellSkin: (skin: Skin) => void;
  onPurchase: (items: ShopPurchaseItem[]) => boolean;
  onTargetSelect: (skin: Skin) => void;
  onClearInput: () => void;
  onClearTarget: () => void;
  onRandomInput: () => void;
  onSelectAllInput: () => void;
  onTurboToggle: () => void;
  onLiveHelp: () => void;
}

export function UpgradePage({
  inventory,
  inputSkins,
  targetSkin,
  targetPool,
  probability,
  wheelSize,
  multiplier,
  cap,
  canUpgrade,
  isUpgradeRolling,
  requiresLogin,
  turbo,
  lockedSkinIds,
  upgradeRollingIds,
  balance,
  liveHelpLoading,
  onLoginRequired,
  onMultiplier,
  onCap,
  onUpgradeStart,
  onUpgradeRollLocked,
  onUpgradeComplete,
  onInputSelect,
  onSellSkin,
  onPurchase,
  onTargetSelect,
  onClearInput,
  onClearTarget,
  onRandomInput,
  onSelectAllInput,
  onTurboToggle,
  onLiveHelp,
}: Props) {
  const engineRef = useRef<UpgradeEngineHandle>(null);

  return (
    <div className="flex w-full flex-col gap-5 px-2 py-4 pb-8 sm:px-4 lg:gap-6 lg:px-6 lg:py-5">
      <div className="grid grid-cols-1 items-stretch gap-4 xl:grid-cols-[1fr_auto_1fr] xl:gap-5">
        <UpgradeSelectionPanel
          variant="input"
          skins={inputSkins}
          rolling={isUpgradeRolling}
          turbo={turbo}
          onTurboToggle={onTurboToggle}
          onRandom={onRandomInput}
          onSelectAll={onSelectAllInput}
          onClear={onClearInput}
        />

        <div className="flex flex-col items-center justify-center">
          <UpgradeEngine
            ref={engineRef}
            probability={probability}
            wheelSize={wheelSize}
            multiplier={multiplier}
            cap={cap}
            canUpgrade={canUpgrade}
            requiresLogin={requiresLogin}
            onLoginRequired={onLoginRequired}
            turbo={turbo}
            onMultiplier={onMultiplier}
            onCap={onCap}
            onUpgradeStart={onUpgradeStart}
            onUpgradeRollLocked={onUpgradeRollLocked}
            onComplete={onUpgradeComplete}
            showUpgradeButton={false}
            showControls={false}
            riskyLabel
          />
          <UpgradeMultiplierBar
            multiplier={multiplier}
            onMultiplier={onMultiplier}
            disabled={isUpgradeRolling}
          />
        </div>

        <UpgradeSelectionPanel
          variant="target"
          skin={targetSkin}
          onClear={onClearTarget}
          onUpgrade={() => engineRef.current?.runUpgrade()}
          canUpgrade={canUpgrade}
          spinning={isUpgradeRolling}
          requiresLogin={requiresLogin}
        />
      </div>

      <div className="flex items-center justify-center gap-3 py-1">
        <span className="h-1.5 w-1.5 rounded-full bg-violet-400/80" />
        <h2 className="font-display text-sm font-bold uppercase tracking-[0.18em] text-white/90 sm:text-base">
          BloxStrike Skins Upgrade
        </h2>
        <span className="h-1.5 w-1.5 rounded-full bg-violet-400/80" />
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-5">
        <UpgradeInventoryColumn
          skins={inventory}
          selected={inputSkins}
          balance={balance}
          requiresLogin={requiresLogin}
          lockedSkinIds={lockedSkinIds}
          upgradeRollingIds={upgradeRollingIds}
          onLoginRequired={onLoginRequired}
          onSelect={onInputSelect}
          onSell={onSellSkin}
          onPurchase={onPurchase}
        />
        <TargetPanel
          skins={targetPool}
          selected={targetSkin}
          title="Upgrade items"
          variant="upgrader"
          onLiveHelp={onLiveHelp}
          liveHelpLoading={liveHelpLoading}
          onSelect={onTargetSelect}
        />
      </div>
    </div>
  );
}
