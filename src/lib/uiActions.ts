import type { Skin } from '../data/skins';

type VoidHandler = () => void;
type WithdrawHandler = (skinIds?: string[]) => void;
type UpgradeHandler = (skin: Skin) => void;
type SellHandler = (skin: Skin) => boolean;
type GrantSkinsHandler = (skins: Skin[]) => void;
type GrantBalanceHandler = (amount: number) => boolean;
type BattleEntryChargeHandler = (amount: number) => boolean;
type BattleEntryRefundHandler = (amount: number) => void;

let openDepositHandler: VoidHandler | null = null;
let openWithdrawHandler: WithdrawHandler | null = null;
let upgradeWithSkinHandler: UpgradeHandler | null = null;
let sellSkinHandler: SellHandler | null = null;
let syncPlayerHandler: VoidHandler | null = null;
let grantSkinsHandler: GrantSkinsHandler | null = null;
let grantBalanceHandler: GrantBalanceHandler | null = null;
let battleEntryChargeHandler: BattleEntryChargeHandler | null = null;
let battleEntryRefundHandler: BattleEntryRefundHandler | null = null;

export function registerOpenDepositHandler(handler: VoidHandler | null): void {
  openDepositHandler = handler;
}

export function requestOpenDeposit(): void {
  openDepositHandler?.();
}

export function registerOpenWithdrawHandler(handler: WithdrawHandler | null): void {
  openWithdrawHandler = handler;
}

export function requestOpenWithdraw(skinIds?: string[]): void {
  openWithdrawHandler?.(skinIds);
}

export function registerUpgradeWithSkinHandler(handler: UpgradeHandler | null): void {
  upgradeWithSkinHandler = handler;
}

export function requestUpgradeWithSkin(skin: Skin): void {
  upgradeWithSkinHandler?.(skin);
}

export function registerSellSkinHandler(handler: SellHandler | null): void {
  sellSkinHandler = handler;
}

export function requestSellSkin(skin: Skin): boolean {
  return sellSkinHandler?.(skin) ?? false;
}

export function registerSyncPlayerHandler(handler: VoidHandler | null): void {
  syncPlayerHandler = handler;
}

export function requestSyncPlayerState(): void {
  syncPlayerHandler?.();
}

export function registerGrantSkinsHandler(handler: GrantSkinsHandler | null): void {
  grantSkinsHandler = handler;
}

/** Grants skins immediately in app state + localStorage (safe before navigation). */
export function requestGrantSkinsToInventory(skins: Skin[]): boolean {
  if (!skins.length || !grantSkinsHandler) return false;
  grantSkinsHandler(skins);
  return true;
}

export function registerGrantBalanceHandler(handler: GrantBalanceHandler | null): void {
  grantBalanceHandler = handler;
}

export function requestGrantBalance(amount: number): boolean {
  if (amount <= 0 || !grantBalanceHandler) return false;
  return grantBalanceHandler(amount);
}

export function registerBattleEntryHandlers(
  charge: BattleEntryChargeHandler | null,
  refund: BattleEntryRefundHandler | null,
): void {
  battleEntryChargeHandler = charge;
  battleEntryRefundHandler = refund;
}

export function requestChargeBattleEntry(amount: number): boolean {
  return battleEntryChargeHandler?.(amount) ?? false;
}

export function requestRefundBattleEntry(amount: number): void {
  battleEntryRefundHandler?.(amount);
}

export type AdminPanelId =
  | 'clear'
  | 'see'
  | 'inbox'
  | 'giftMoney'
  | 'gift'
  | 'userDb'
  | 'skinPicker'
  | 'announcement';

const adminPanelHandlers: Partial<Record<AdminPanelId, VoidHandler>> = {};

export function registerAdminPanelHandler(id: AdminPanelId, handler: VoidHandler | null): void {
  if (handler) adminPanelHandlers[id] = handler;
  else delete adminPanelHandlers[id];
}

export function requestOpenAdminPanel(id: AdminPanelId): void {
  adminPanelHandlers[id]?.();
}
