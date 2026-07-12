import { getCatalogCaseBySlug, type CatalogCase } from './caseCatalog';
import type { Skin } from '../data/skins';
import type { ProfileAvatarId } from './profileAvatars';
import type { FreeCaseReelResult } from './freeCaseReel';
import { battleSlotsTotalCost, expandBattleSlots } from './caseBattleCatalog';
import { battleLoanEntryCost, isBattleFormatAvailable } from './caseBattleCreate';
import { defaultBotSideForSlot, hostBattleSlotIndex, type BattleSide } from './battleSides';
import { loadLiveBattles, type BattleCaseSlot } from './caseBattlesStorage';

export type BattleMode = 'classic' | 'underdog' | 'share' | 'jackpot' | 'crazy-jackpot';
export type BattleStatus = 'waiting' | 'in_progress' | 'finished';
export type BattleListTab = 'active' | 'my-battles';
export type BattleFormat = '1v1' | '1v1v1' | '1v1v1v1' | '2v2' | '2v2v2' | '3v3';
export type BattlePrivacy = 'public' | 'private';

export interface BattlePlayer {
  id: string;
  name: string;
  avatarUrl?: string;
  avatarId?: ProfileAvatarId;
  color: string;
  isHost?: boolean;
  isBot?: boolean;
  botBadgeColor?: string;
  drops?: Skin[];
  totalValue?: number;
  team?: number;
  side?: BattleSide;
  slotIndex?: number;
}

export interface BattlePendingRoundSession {
  playerId: string;
  result: FreeCaseReelResult;
  grantedSkin: Skin;
}

export interface BattlePendingRound {
  roundIndex: number;
  startedAt: number;
  applyAt: number;
  slug: string;
  joker: boolean;
  dropsByPlayerId: Record<string, Skin>;
  sessions: BattlePendingRoundSession[];
}

export interface CaseBattle {
  id: string;
  mode: BattleMode;
  status: BattleStatus;
  format: BattleFormat;
  privacy: BattlePrivacy;
  loanMode: boolean;
  loanPercent: number;
  caseSlugs: string[];
  jokerFlags: boolean[];
  currentRound: number;
  cost: number;
  fullCost: number;
  hostEntryPaid?: number;
  economySettled?: boolean;
  settledUserIds?: string[];
  /** Timestamp when the battle reached `finished` — used for post-game grace period. */
  finishedAt?: number;
  pendingRound?: BattlePendingRound;
  maxPlayers: number;
  players: BattlePlayer[];
  createdByUserId: string;
}

export const BATTLE_MODE_META: Record<
  BattleMode,
  { label: string; accent: string; border: string; bg: string; text: string }
> = {
  classic: {
    label: 'Classic',
    accent: '#84cc16',
    border: 'border-lime-400/70',
    bg: 'bg-lime-400',
    text: 'text-lime-300',
  },
  underdog: {
    label: 'Underdog',
    accent: '#a855f7',
    border: 'border-violet-400/70',
    bg: 'bg-violet-500',
    text: 'text-violet-300',
  },
  share: {
    label: 'Share',
    accent: '#3b82f6',
    border: 'border-sky-400/70',
    bg: 'bg-sky-500',
    text: 'text-sky-300',
  },
  jackpot: {
    label: 'Jackpot',
    accent: '#f59e0b',
    border: 'border-amber-400/70',
    bg: 'bg-amber-500',
    text: 'text-amber-300',
  },
  'crazy-jackpot': {
    label: 'Jackpot Loco',
    accent: '#ef4444',
    border: 'border-red-400/70',
    bg: 'bg-red-500',
    text: 'text-red-300',
  },
};

const PLAYER_COLORS = ['#f97316', '#22d3ee', '#a855f7', '#eab308', '#ef4444', '#14b8a6'];

export function isLiveCaseBattle(battle: CaseBattle): boolean {
  return (
    Boolean(battle.createdByUserId) &&
    battle.players.length > 0 &&
    battle.players.every(player => Boolean(player.id)) &&
    battle.status !== 'finished' &&
    battle.currentRound < battle.caseSlugs.length &&
    (battle.status === 'waiting' || battle.status === 'in_progress')
  );
}

export function getLiveCaseBattles(): CaseBattle[] {
  return loadLiveBattles().filter(
    battle => isLiveCaseBattle(battle) && isBattleFormatAvailable(battle.format),
  );
}

export function getCaseBattleById(id: string): CaseBattle | undefined {
  const normalized = id.toLowerCase();
  return loadLiveBattles().find(battle => battle.id.toLowerCase() === normalized);
}

export function resolveBattleCases(slugs: string[]): CatalogCase[] {
  return slugs
    .map(slug => getCatalogCaseBySlug(slug))
    .filter((item): item is CatalogCase => Boolean(item));
}

export function battleTotalCost(slugs: string[]): number {
  return resolveBattleCases(slugs).reduce((sum, item) => sum + item.price, 0);
}

export function canJoinBattle(battle: CaseBattle): boolean {
  return battle.status === 'waiting' && battle.players.length < battle.maxPlayers;
}

export function battleActionLabel(battle: CaseBattle): 'join' | 'view' {
  return canJoinBattle(battle) ? 'join' : 'view';
}

export function canSpectateBattle(battle: CaseBattle): boolean {
  return battle.status === 'waiting' || battle.status === 'in_progress';
}

export function isBattleParticipant(
  battle: CaseBattle,
  userId: string | undefined,
): boolean {
  if (!userId) return false;
  return battle.players.some(player => !player.isBot && player.id === userId);
}

export function getPlayerAtSlot(battle: CaseBattle, slotIndex: number): BattlePlayer | null {
  const indexed = battle.players.find(player => player.slotIndex === slotIndex);
  if (indexed) return indexed;
  if (battle.players.some(player => player.slotIndex != null)) return null;
  return battle.players[slotIndex] ?? null;
}

export function getBattleSlots(battle: CaseBattle): (BattlePlayer | null)[] {
  return Array.from({ length: battle.maxPlayers }, (_, index) => getPlayerAtSlot(battle, index));
}

export function getNextOpenBattleSlot(battle: CaseBattle): number {
  for (let index = 0; index < battle.maxPlayers; index += 1) {
    if (!getPlayerAtSlot(battle, index)) return index;
  }
  return battle.maxPlayers;
}

export function buildBattleFromDraft(input: {
  mode: BattleMode;
  format: BattleFormat;
  privacy: BattlePrivacy;
  loanMode: boolean;
  loanPercent: number;
  cases: BattleCaseSlot[];
  host: { userId: string; name: string; avatarUrl?: string; avatarId?: ProfileAvatarId };
  hostSide: BattleSide;
  maxPlayers: number;
}): CaseBattle {
  const expandedCases = expandBattleSlots(input.cases);
  const fullCost = battleSlotsTotalCost(input.cases);
  const cost = battleLoanEntryCost(fullCost, input.loanMode, input.loanPercent);
  const hostSlotIndex = hostBattleSlotIndex(input.hostSide, input.maxPlayers);
  const splitIndex = Math.floor(input.maxPlayers / 2);
  const hostTeam = hostSlotIndex < splitIndex ? 1 : 2;

  return {
    id: `battle-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    mode: input.mode,
    status: 'waiting',
    format: input.format,
    privacy: input.privacy,
    loanMode: input.loanMode,
    loanPercent: input.loanMode ? input.loanPercent : 0,
    caseSlugs: expandedCases.map(item => item.slug),
    jokerFlags: expandedCases.map(item => item.joker),
    currentRound: 0,
    cost,
    fullCost,
    hostEntryPaid: cost,
    maxPlayers: input.maxPlayers,
    createdByUserId: input.host.userId,
    players: [
      {
        id: input.host.userId,
        name: input.host.name,
        color: PLAYER_COLORS[0],
        isHost: true,
        totalValue: 0,
        side: input.hostSide,
        slotIndex: hostSlotIndex,
        avatarUrl: input.host.avatarUrl,
        avatarId: input.host.avatarId,
        team: input.format === '2v2' || input.format === '3v3' ? hostTeam : undefined,
      },
    ],
  };
}

export function addBotToBattle(battle: CaseBattle, botPlayer: BattlePlayer): CaseBattle | null {
  if (battle.players.length >= battle.maxPlayers) return null;
  if (battle.players.some(player => player.id === botPlayer.id)) return null;
  if (
    botPlayer.slotIndex != null &&
    getPlayerAtSlot(battle, botPlayer.slotIndex)
  ) {
    return null;
  }

  return {
    ...battle,
    players: [...battle.players, botPlayer],
  };
}

export function removePlayerFromBattle(battle: CaseBattle, playerId: string): CaseBattle | null {
  const player = battle.players.find(entry => entry.id === playerId);
  if (!player || player.isHost) return null;

  return {
    ...battle,
    players: battle.players.filter(entry => entry.id !== playerId),
  };
}

export function addHumanPlayerToBattle(
  battle: CaseBattle,
  player: {
    userId: string;
    name: string;
    avatarUrl?: string;
    avatarId?: ProfileAvatarId;
    slotIndex?: number;
  },
): CaseBattle | null {
  if (!canJoinBattle(battle)) return null;
  if (battle.players.some(entry => !entry.isBot && entry.id === player.userId)) return null;

  const slotIndex = player.slotIndex ?? getNextOpenBattleSlot(battle);
  if (slotIndex >= battle.maxPlayers || getPlayerAtSlot(battle, slotIndex)) return null;

  const hostSide = battle.players.find(entry => entry.isHost)?.side ?? 'counter-terrorist';
  const side = defaultBotSideForSlot(hostSide, slotIndex, battle.maxPlayers);
  const splitIndex = Math.floor(battle.maxPlayers / 2);
  const team =
    battle.format === '2v2' || battle.format === '3v3'
      ? slotIndex < splitIndex
        ? 1
        : 2
      : undefined;

  return {
    ...battle,
    players: [
      ...battle.players,
      {
        id: player.userId,
        name: player.name,
        color: PLAYER_COLORS[battle.players.length % PLAYER_COLORS.length],
        totalValue: 0,
        side,
        slotIndex,
        avatarUrl: player.avatarUrl,
        avatarId: player.avatarId,
        team,
      },
    ],
  };
}
