import type { Skin } from '../data/skins';

type VoidHandler = () => void;
type WithdrawHandler = (skinIds?: string[]) => void;
type UpgradeHandler = (skin: Skin) => void;
type SellHandler = (skin: Skin) => boolean;

let openDepositHandler: VoidHandler | null = null;
let openWithdrawHandler: WithdrawHandler | null = null;
let upgradeWithSkinHandler: UpgradeHandler | null = null;
let sellSkinHandler: SellHandler | null = null;
let syncPlayerHandler: VoidHandler | null = null;

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

export type AdminPanelId =
  | 'clear'
  | 'see'
  | 'inbox'
  | 'giftMoney'
  | 'gift'
  | 'userDb'
  | 'skinPicker';

const adminPanelHandlers: Partial<Record<AdminPanelId, VoidHandler>> = {};

export function registerAdminPanelHandler(id: AdminPanelId, handler: VoidHandler | null): void {
  if (handler) adminPanelHandlers[id] = handler;
  else delete adminPanelHandlers[id];
}

export function requestOpenAdminPanel(id: AdminPanelId): void {
  adminPanelHandlers[id]?.();
}
