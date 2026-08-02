/** Compute SALDO credit from a completed deposit ticket (mirrors client getDepositCreditAmount). */
export function getDepositCreditFromTicket(ticket) {
  if (!ticket || (ticket.type ?? 'withdraw') !== 'deposit') return 0;
  if (ticket.creditTotal != null && ticket.creditTotal > 0) {
    return Math.floor(ticket.creditTotal);
  }
  if ((ticket.robuxAmount ?? 0) > 0) {
    const base = Math.round(ticket.robuxAmount * 1.2 * 100) / 100;
    const bonusPercent = Number(ticket.bonusPercent) || 0;
    if (bonusPercent > 0) {
      return Math.floor(base * (1 + bonusPercent / 100));
    }
    return Math.floor(base);
  }
  const fromSkins = (Array.isArray(ticket.skins) ? ticket.skins : [])
    .reduce((sum, s) => sum + (Number(s?.price) || 0), 0);
  return Math.floor(fromSkins > 0 ? fromSkins : (Number(ticket.total) || 0));
}

/** Record giveaway participation when a deposit ticket completes. */
export function recordGiveawayDepositFromTicket(giveawayStore, ticket) {
  if (!giveawayStore || !ticket) return [];
  if ((ticket.type ?? 'withdraw') !== 'deposit') return [];
  const amount = getDepositCreditFromTicket(ticket);
  if (amount <= 0 || !ticket.userId) return [];
  return giveawayStore.recordUserDeposit(String(ticket.userId).trim(), amount, {
    email: ticket.userEmail,
    nickname: ticket.userLabel,
  });
}
