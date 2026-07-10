export function normalizeBalance(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.floor(n));
}

export function isSkin(value) {
  return (
    value
    && typeof value.id === 'string'
    && typeof value.name === 'string'
    && typeof value.weapon === 'string'
    && typeof value.rarity === 'string'
    && typeof value.wear === 'string'
    && typeof value.price === 'number'
    && typeof value.image === 'string'
  );
}

export function normalizeInventory(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.filter(isSkin).slice(0, 500);
}

export function shouldSkipEmptyPlayerStateOverwrite(existing, balance, inventory) {
  if (!existing) return false;
  const nextBalance = normalizeBalance(balance);
  const nextInventory = normalizeInventory(inventory);
  const incomingEmpty = nextBalance === 0 && nextInventory.length === 0;
  const existingHasData = existing.balance > 0 || (existing.inventory?.length ?? 0) > 0;
  return incomingEmpty && existingHasData;
}
