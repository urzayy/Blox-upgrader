import type { Skin } from '../data/skins';

const OBTAINED_ID_PATTERNS = [
  /^inv_shop_(\d+)_/,
  /^inv_(?:admin_|consolation_|fix_)?(\d+)_/,
];

export function getSkinObtainedAt(skin: Skin): number | null {
  if (typeof skin.obtainedAt === 'number' && Number.isFinite(skin.obtainedAt)) {
    return skin.obtainedAt;
  }

  for (const pattern of OBTAINED_ID_PATTERNS) {
    const match = skin.id.match(pattern);
    if (match) return Number(match[1]);
  }

  return null;
}

export function formatSkinObtained(at: number): { time: string; date: string } {
  const date = new Date(at);
  return {
    time: date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }),
    date: date.toLocaleDateString('en-CA'),
  };
}
