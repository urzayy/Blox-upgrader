import type { BattlePlayer } from './caseBattles';
import type { BattleSide } from './battleSides';

export interface BattleBotDefinition {
  id: string;
  name: string;
  avatarUrl: string;
  badgeColor: string;
  color: string;
}

export const BATTLE_BOTS: BattleBotDefinition[] = [
  { id: 'bot-yoda', name: 'Bot Yoda', avatarUrl: '/battle-bots/yoda.png', badgeColor: '#2563eb', color: '#22c55e' },
  { id: 'bot-fine', name: 'Bot Fine', avatarUrl: '/battle-bots/fine.png', badgeColor: '#2563eb', color: '#f97316' },
  { id: 'bot-urzay', name: 'Bot Urzay', avatarUrl: '/battle-bots/urzay.png', badgeColor: '#dc2626', color: '#38bdf8' },
  { id: 'bot-dol', name: 'Bot Dol', avatarUrl: '/battle-bots/dol.png', badgeColor: '#2563eb', color: '#a855f7' },
  { id: 'bot-albertocho', name: 'Bot Albertocho', avatarUrl: '/battle-bots/albertocho.png', badgeColor: '#dc2626', color: '#eab308' },
  { id: 'bot-jorge', name: 'Bot Jorge', avatarUrl: '/battle-bots/jorge.png', badgeColor: '#dc2626', color: '#64748b' },
  { id: 'bot-hamburguesa', name: 'Bot Hamburguesa', avatarUrl: '/battle-bots/hamburguesa.png', badgeColor: '#2563eb', color: '#f59e0b' },
  { id: 'bot-nerd', name: 'Bot Nerd', avatarUrl: '/battle-bots/nerd.png', badgeColor: '#2563eb', color: '#6366f1' },
  { id: 'bot-batman', name: 'Bot Batman', avatarUrl: '/battle-bots/batman.png', badgeColor: '#dc2626', color: '#111827' },
  { id: 'bot-troll', name: 'Bot Troll', avatarUrl: '/battle-bots/troll.png', badgeColor: '#dc2626', color: '#84cc16' },
];

export function botShortName(name: string): string {
  return name.replace(/^Bot\s+/i, '');
}

export function getBattleBotById(id: string): BattleBotDefinition | undefined {
  const resolvedId = id === 'bot-fire' ? 'bot-fine' : id;
  return BATTLE_BOTS.find(bot => bot.id === resolvedId);
}

export function resolveBotAvatarUrl(botId: string, avatarUrl?: string): string | undefined {
  if (avatarUrl) return avatarUrl;
  return getBattleBotById(botId)?.avatarUrl;
}

export function battlePlayerFromBot(
  bot: BattleBotDefinition,
  options?: { team?: number; side?: BattleSide; slotIndex?: number },
): BattlePlayer {
  return {
    id: bot.id,
    name: bot.name,
    avatarUrl: bot.avatarUrl,
    color: bot.color,
    isBot: true,
    botBadgeColor: bot.badgeColor,
    totalValue: 0,
    team: options?.team,
    side: options?.side,
    slotIndex: options?.slotIndex,
  };
}

export function pickRandomAvailableBot(usedBotIds: string[]): BattleBotDefinition | null {
  const available = BATTLE_BOTS.filter(bot => !usedBotIds.includes(bot.id));
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
}

export function getAvailableBots(usedBotIds: string[]): BattleBotDefinition[] {
  return BATTLE_BOTS.filter(bot => !usedBotIds.includes(bot.id));
}
