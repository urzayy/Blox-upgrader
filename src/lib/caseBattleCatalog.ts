import { CASE_CATALOG } from './caseCatalog';
import {
  BATTLES_CASE_SLUGS,
  FEATURED_CASE_SLUGS,
  FIFTY_FIFTY_Z_CASE_SLUGS,
  HIGH_RISK_CASE_SLUGS,
  LOW_RISK_CASE_SLUGS,
  MIXED_CASE_SLUGS,
} from './caseCatalogFilters';
import { getJokerCasePrice } from './freeCaseLoot';
import type { BattleCaseSlot } from './caseBattlesStorage';

export const CASE_PICKER_SECTIONS = [
  {
    id: 'featured',
    label: 'Featured',
    slugs: [...FEATURED_CASE_SLUGS],
  },
  {
    id: 'fifty-fifty',
    label: '50/50',
    slugs: [...FIFTY_FIFTY_Z_CASE_SLUGS],
  },
  {
    id: 'high-risk',
    label: 'High Risk',
    slugs: [...HIGH_RISK_CASE_SLUGS],
  },
  {
    id: 'low-risk',
    label: 'Low Risk',
    slugs: [...LOW_RISK_CASE_SLUGS],
  },
  {
    id: 'battles',
    label: 'Battles',
    slugs: [...BATTLES_CASE_SLUGS],
  },
  {
    id: 'mixed',
    label: 'Mixed',
    slugs: [...MIXED_CASE_SLUGS],
  },
] as const;

export function caseSlotQuantity(slot: BattleCaseSlot): number {
  return slot.quantity ?? 1;
}

export function battleSlotsTotalCount(slots: BattleCaseSlot[]): number {
  return slots.reduce((sum, slot) => sum + caseSlotQuantity(slot), 0);
}

export function caseSlotPrice(slot: BattleCaseSlot): number {
  const item = CASE_CATALOG.find(entry => entry.slug === slot.slug);
  if (!item) return 0;
  return slot.joker ? getJokerCasePrice(slot.slug) : item.price;
}

export function battleSlotsTotalCost(slots: BattleCaseSlot[]): number {
  return slots.reduce((sum, slot) => sum + caseSlotPrice(slot) * caseSlotQuantity(slot), 0);
}

export function expandBattleSlots(slots: BattleCaseSlot[]): BattleCaseSlot[] {
  return slots.flatMap(slot =>
    Array.from({ length: caseSlotQuantity(slot) }, () => ({
      slug: slot.slug,
      joker: slot.joker,
      quantity: 1,
    })),
  );
}

export function findBattleSlotIndex(
  slots: BattleCaseSlot[],
  slug: string,
  joker: boolean,
): number {
  return slots.findIndex(slot => slot.slug === slug && slot.joker === joker);
}

export function consolidateBattleSlots(slots: BattleCaseSlot[]): BattleCaseSlot[] {
  const merged = new Map<string, BattleCaseSlot>();

  for (const slot of slots) {
    const key = `${slot.slug}:${slot.joker}`;
    const existing = merged.get(key);
    if (existing) {
      merged.set(key, {
        ...existing,
        quantity: caseSlotQuantity(existing) + caseSlotQuantity(slot),
      });
      continue;
    }
    merged.set(key, { ...slot, quantity: caseSlotQuantity(slot) });
  }

  return [...merged.values()];
}

export function pickRandomBattleSlots(balance: number): BattleCaseSlot[] {
  const budget = balance * 0.25;
  if (budget <= 0) return [];

  const pool = [...CASE_CATALOG].sort(() => Math.random() - 0.5);
  const targetRounds = 3 + Math.floor(Math.random() * 3);
  const slots: BattleCaseSlot[] = [];
  let remaining = budget;

  for (const item of pool) {
    if (slots.length >= targetRounds) break;
    if (item.price <= remaining) {
      slots.push({ slug: item.slug, joker: false });
      remaining -= item.price;
    }
  }

  if (slots.length === 0) {
    const cheapest = [...CASE_CATALOG]
      .filter(item => item.price <= budget)
      .sort((a, b) => a.price - b.price)[0];
    if (cheapest) {
      slots.push({ slug: cheapest.slug, joker: false });
    }
  }

  return slots;
}

export function slugsToBattleSlots(slugs: string[], jokerFlags?: boolean[]): BattleCaseSlot[] {
  return slugs.map((slug, index) => ({
    slug,
    joker: jokerFlags?.[index] ?? false,
  }));
}
