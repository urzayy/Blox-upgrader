import type { Skin } from '../data/skins';

export const MAX_INPUT_SKINS = 5;

export function inventoryTotal(skins: Skin[]): number {
  return skins.reduce((sum, skin) => sum + skin.price, 0);
}

export function commitUpgradeStake(inventory: Skin[], inputs: Skin[]): Skin[] {
  const inputIds = new Set(inputs.map(s => s.id));
  return inventory.filter(s => !inputIds.has(s.id));
}

export function upgradeWinSkinId(sessionKey: string): string {
  return `inv_upgrade_${sessionKey}`;
}

export function applyUpgradeWin(inventory: Skin[], target: Skin, sessionKey?: string): Skin[] {
  const obtainedAt = Date.now();
  const id = sessionKey
    ? upgradeWinSkinId(sessionKey)
    : `inv_${obtainedAt}_${Math.random().toString(36).slice(2, 7)}`;

  if (inventory.some(s => s.id === id)) return inventory;

  const wonSkin: Skin = {
    ...target,
    id,
    obtainedAt,
  };
  return [...inventory, wonSkin];
}

export function applyUpgradeToInventory(
  inventory: Skin[],
  inputs: Skin[],
  target: Skin,
  won: boolean,
): Skin[] {
  const afterStake = commitUpgradeStake(inventory, inputs);
  if (!won) return afterStake;
  return applyUpgradeWin(afterStake, target);
}

export function grantSkinToInventory(inventory: Skin[], template: Skin): Skin[] {
  const obtainedAt = Date.now();
  const granted: Skin = {
    ...template,
    id: `inv_admin_${obtainedAt}_${Math.random().toString(36).slice(2, 7)}`,
    obtainedAt,
  };
  return [...inventory, granted];
}

export function createConsolationGrantedSkin(template: Skin): Skin {
  const obtainedAt = Date.now();
  return {
    ...template,
    id: `inv_consolation_${obtainedAt}_${Math.random().toString(36).slice(2, 7)}`,
    obtainedAt,
  };
}

export function grantConsolationSkinToInventory(inventory: Skin[], template: Skin): Skin[] {
  return [...inventory, createConsolationGrantedSkin(template)];
}

export function withdrawSkinsFromInventory(inventory: Skin[], skinIds: Iterable<string>): Skin[] {
  const ids = new Set(skinIds);
  return inventory.filter(s => !ids.has(s.id));
}

export function sellSkinFromInventory(inventory: Skin[], skinId: string): Skin[] {
  return inventory.filter(s => s.id !== skinId);
}

export function purchaseSkinCopies(inventory: Skin[], template: Skin, quantity: number): Skin[] {
  if (quantity <= 0) return inventory;
  const base = Date.now();
  const copies: Skin[] = Array.from({ length: quantity }, (_, index) => ({
    ...template,
    id: `inv_shop_${base}_${index}_${Math.random().toString(36).slice(2, 7)}`,
    obtainedAt: base,
  }));
  return [...inventory, ...copies];
}
