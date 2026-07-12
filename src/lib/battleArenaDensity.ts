import type { ReelSize } from '../components/freecases/FreeCaseReelOpener';

export type BattleDensity = 'duel' | 'quad' | 'six';

export function getBattleDensity(maxPlayers: number): BattleDensity {
  if (maxPlayers <= 2) return 'duel';
  if (maxPlayers <= 4) return 'quad';
  return 'six';
}

export function getBattleReelSize(maxPlayers: number): ReelSize {
  if (maxPlayers <= 2) return 'battle';
  if (maxPlayers <= 4) return 'battle-4';
  return 'battle-6';
}

export interface BattleColumnDensity {
  columnMinHeight: string;
  stageMinHeight: string;
  emptyMinHeight: string;
  heroMaxWidth: string;
  dropThumb: string;
  dropPrev: string;
  finishLoss: string;
  finishLossIcon: string;
  dropGridCols: string;
  footerPy: string;
  nameText: string;
  valueText: string;
  showDropGrid: boolean;
}

export const BATTLE_COLUMN_DENSITY: Record<BattleDensity, BattleColumnDensity> = {
  duel: {
    columnMinHeight: 'min-h-[20rem] sm:min-h-[22rem]',
    stageMinHeight: 'min-h-[17rem] sm:min-h-[19rem]',
    emptyMinHeight: 'min-h-[18rem] sm:min-h-[20rem]',
    heroMaxWidth: 'max-w-[10rem] sm:max-w-[13rem]',
    dropThumb: 'h-9 w-9',
    dropPrev: 'h-10 w-10',
    finishLoss: 'h-28 w-28 sm:h-32 sm:w-32',
    finishLossIcon: 'h-20 w-20 sm:h-24 sm:w-24',
    dropGridCols: 'grid-cols-2',
    footerPy: 'py-2.5',
    nameText: 'text-sm',
    valueText: 'text-sm',
    showDropGrid: true,
  },
  quad: {
    columnMinHeight: 'min-h-[16rem] sm:min-h-[18rem]',
    stageMinHeight: 'min-h-[14rem] sm:min-h-[16rem]',
    emptyMinHeight: 'min-h-[14rem] sm:min-h-[16rem]',
    heroMaxWidth: 'max-w-[9rem] sm:max-w-[11rem]',
    dropThumb: 'h-8 w-8',
    dropPrev: 'h-9 w-9',
    finishLoss: 'h-24 w-24 sm:h-28 sm:w-28',
    finishLossIcon: 'h-16 w-16 sm:h-20 sm:w-20',
    dropGridCols: 'grid-cols-2',
    footerPy: 'py-2',
    nameText: 'text-xs sm:text-sm',
    valueText: 'text-xs sm:text-sm',
    showDropGrid: true,
  },
  six: {
    columnMinHeight: 'min-h-0',
    stageMinHeight: 'min-h-[7.5rem] sm:min-h-[8.5rem]',
    emptyMinHeight: 'min-h-[8rem] sm:min-h-[9rem]',
    heroMaxWidth: 'w-full max-w-none',
    dropThumb: 'h-5 w-5',
    dropPrev: 'h-6 w-6',
    finishLoss: 'h-14 w-14 sm:h-16 sm:w-16',
    finishLossIcon: 'h-10 w-10 sm:h-12 sm:w-12',
    dropGridCols: 'grid-cols-1',
    footerPy: 'py-1',
    nameText: 'text-[10px]',
    valueText: 'text-[10px]',
    showDropGrid: false,
  },
};

export function getBattleColumnDensity(maxPlayers: number): BattleColumnDensity {
  return BATTLE_COLUMN_DENSITY[getBattleDensity(maxPlayers)];
}
