export type BattleSide = 'terrorist' | 'counter-terrorist';

export const BATTLE_SIDES: BattleSide[] = ['counter-terrorist', 'terrorist'];

export const BATTLE_SIDE_META: Record<
  BattleSide,
  { label: string; headerLabel: string; shortLabel: string; image: string; accent: string }
> = {
  'counter-terrorist': {
    label: 'Counter-Terrorist',
    headerLabel: 'Counter-Terrorist',
    shortLabel: 'CT',
    image: '/battle-sides/counter-terrorist.svg',
    accent: '#5b8fd4',
  },
  terrorist: {
    label: 'Terrorist',
    headerLabel: 'Terrorist',
    shortLabel: 'T',
    image: '/battle-sides/terrorist.png',
    accent: '#c4a574',
  },
};

export function oppositeBattleSide(side: BattleSide): BattleSide {
  return side === 'terrorist' ? 'counter-terrorist' : 'terrorist';
}

export function defaultBotSideForSlot(
  hostSide: BattleSide,
  slotIndex: number,
  maxPlayers: number,
): BattleSide {
  const splitIndex = Math.floor(maxPlayers / 2);
  const hostSlot = hostSide === 'counter-terrorist' ? 0 : splitIndex;
  const isLeftSide = slotIndex < splitIndex;
  const hostOnLeft = hostSlot < splitIndex;

  if (slotIndex === hostSlot) return hostSide;

  if (maxPlayers === 2) return oppositeBattleSide(hostSide);

  if (isLeftSide) return hostOnLeft ? hostSide : oppositeBattleSide(hostSide);
  return hostOnLeft ? oppositeBattleSide(hostSide) : hostSide;
}

export function hostBattleSlotIndex(hostSide: BattleSide, maxPlayers: number): number {
  const splitIndex = Math.floor(maxPlayers / 2);
  return hostSide === 'counter-terrorist' ? 0 : splitIndex;
}

export function orderBattleSlotIndices(maxPlayers: number): number[] {
  const splitIndex = Math.floor(maxPlayers / 2);
  const left = Array.from({ length: splitIndex }, (_, index) => index);
  const right = Array.from({ length: maxPlayers - splitIndex }, (_, index) => index + splitIndex);
  return [...left, ...right];
}

export function resolvePlayerSide(
  player: { side?: BattleSide; slotIndex?: number },
  slotIndex: number,
  maxPlayers: number,
): BattleSide {
  if (player.side) return player.side;
  const splitIndex = Math.floor(maxPlayers / 2);
  const index = player.slotIndex ?? slotIndex;
  return index < splitIndex ? 'counter-terrorist' : 'terrorist';
}

export function getBattleSideTotals(
  players: Array<{
    id: string;
    side?: BattleSide;
    slotIndex?: number;
    totalValue?: number;
  }>,
  maxPlayers: number,
  pendingByPlayerId: Record<string, number> = {},
): Record<BattleSide, number> {
  const totals: Record<BattleSide, number> = {
    'counter-terrorist': 0,
    terrorist: 0,
  };

  players.forEach((player, index) => {
    const side = resolvePlayerSide(player, player.slotIndex ?? index, maxPlayers);
    totals[side] += (player.totalValue ?? 0) + (pendingByPlayerId[player.id] ?? 0);
  });

  return totals;
}

export function getBattleSideWinner(totals: Record<BattleSide, number>): BattleSide | null {
  if (totals['counter-terrorist'] === totals.terrorist) return null;
  return totals['counter-terrorist'] > totals.terrorist ? 'counter-terrorist' : 'terrorist';
}
