import type { Skin } from '../data/skins';
import type { Session } from './auth';
import { getDisplayName } from './auth';
import { formatUSD } from './wheelMath';

export type SupportTicketType = 'withdraw' | 'deposit';
export type WithdrawTicketStatus = 'open' | 'completed' | 'cancelled';

export interface WithdrawSkinSummary {
  id: string;
  name: string;
  price: number;
  weapon: string;
  image: string;
  wear: string;
}

export interface WithdrawTicket {
  id: string;
  userId: string;
  userEmail: string;
  userLabel: string;
  type?: SupportTicketType;
  skins: WithdrawSkinSummary[];
  total: number;
  status: WithdrawTicketStatus;
  createdAt: number;
  updatedAt: number;
}

export function getTicketType(ticket: WithdrawTicket): SupportTicketType {
  return ticket.type ?? 'withdraw';
}

/** Exact SALDO credit for a completed deposit ticket. */
export function getDepositCreditAmount(ticket: WithdrawTicket): number {
  const fromSkins = ticket.skins.reduce((sum, s) => sum + s.price, 0);
  return fromSkins > 0 ? fromSkins : ticket.total;
}

export function getPendingWithdrawSkinIds(tickets: WithdrawTicket[]): string[] {
  const ids: string[] = [];
  for (const ticket of tickets) {
    if (getTicketType(ticket) !== 'withdraw') continue;
    if (ticket.status !== 'open') continue;
    for (const skin of ticket.skins) {
      ids.push(skin.id);
    }
  }
  return ids;
}

export type ChatSenderRole = 'user' | 'admin' | 'system';

export interface ChatMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderEmail: string;
  senderRole: ChatSenderRole;
  senderLabel: string;
  text: string;
  createdAt: number;
}

export interface WithdrawTicketBundle {
  ticket: WithdrawTicket;
  messages: ChatMessage[];
}

function summarizeSkin(skin: Skin): WithdrawSkinSummary {
  return {
    id: skin.id,
    name: skin.name,
    price: skin.price,
    weapon: skin.weapon,
    image: skin.image,
    wear: skin.wear,
  };
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export async function createWithdrawTicket(
  session: Session,
  skins: Skin[],
  userLabel: string,
): Promise<WithdrawTicketBundle> {
  return api<WithdrawTicketBundle>('/api/withdraw/tickets', {
    method: 'POST',
    body: JSON.stringify({
      type: 'withdraw',
      userId: session.userId,
      userEmail: session.email,
      userLabel,
      skins: skins.map(summarizeSkin),
    }),
  });
}

export async function createDepositTicket(
  session: Session,
  userLabel: string,
  items: { skin: Skin; quantity: number }[],
): Promise<WithdrawTicketBundle> {
  const skins: WithdrawSkinSummary[] = [];
  for (const item of items) {
    for (let i = 0; i < item.quantity; i++) {
      skins.push(summarizeSkin(item.skin));
    }
  }
  const total = items.reduce((sum, item) => sum + item.skin.price * item.quantity, 0);

  return api<WithdrawTicketBundle>('/api/withdraw/tickets', {
    method: 'POST',
    body: JSON.stringify({
      type: 'deposit',
      userId: session.userId,
      userEmail: session.email,
      userLabel,
      skins,
      total,
    }),
  });
}

export async function fetchWithdrawTicket(ticketId: string): Promise<WithdrawTicketBundle> {
  return api<WithdrawTicketBundle>(`/api/withdraw/tickets/${encodeURIComponent(ticketId)}`);
}

export async function fetchUserWithdrawTickets(userId: string): Promise<WithdrawTicket[]> {
  const data = await api<{ tickets: WithdrawTicket[] }>(
    `/api/withdraw/tickets?userId=${encodeURIComponent(userId)}`,
  );
  return data.tickets;
}

export async function fetchAdminWithdrawTickets(openOnly = true): Promise<WithdrawTicket[]> {
  const data = await api<{ tickets: WithdrawTicket[] }>(
    `/api/withdraw/tickets?admin=1${openOnly ? '' : '&all=1'}`,
  );
  return data.tickets;
}

export async function sendWithdrawChatMessage(
  ticketId: string,
  session: Session,
  isAdmin: boolean,
  text: string,
): Promise<WithdrawTicketBundle> {
  return api<WithdrawTicketBundle>(`/api/withdraw/tickets/${encodeURIComponent(ticketId)}/messages`, {
    method: 'POST',
    body: JSON.stringify({
      senderId: session.userId,
      senderEmail: session.email,
      senderRole: isAdmin ? 'admin' : 'user',
      senderLabel: isAdmin ? 'Admin' : getDisplayName(session),
      text: text.trim(),
    }),
  });
}

export async function updateWithdrawTicketStatus(
  ticketId: string,
  status: WithdrawTicketStatus,
): Promise<WithdrawTicketBundle> {
  return api<WithdrawTicketBundle>(`/api/withdraw/tickets/${encodeURIComponent(ticketId)}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function formatWithdrawSummary(ticket: WithdrawTicket): string {
  if (getTicketType(ticket) === 'deposit') {
    const count = ticket.skins.length;
    const names = ticket.skins.map(s => s.name).slice(0, 2).join(' · ');
    const suffix = count > 2 ? '…' : '';
    return count
      ? `Deposit · ${count} skins · ${formatUSD(ticket.total)} — ${names}${suffix}`
      : `Deposit · ${formatUSD(ticket.total)}`;
  }
  const names = ticket.skins.map(s => s.name).join(' · ');
  return `${ticket.skins.length} skins · ${formatUSD(ticket.total)} — ${names}`;
}

export function formatTicketTypeLabel(ticket: WithdrawTicket): string {
  return getTicketType(ticket) === 'deposit' ? 'Deposit' : 'Withdraw';
}
