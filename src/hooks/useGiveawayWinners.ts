import { useEffect, useState } from 'react';
import { fetchGiveawayWinners, type GiveawayWinnerRecord } from '../lib/giveawayApi';

export function useGiveawayWinners(limit = 24) {
  const [winners, setWinners] = useState<GiveawayWinnerRecord[]>([]);

  useEffect(() => {
    const load = async () => {
      setWinners(await fetchGiveawayWinners(limit));
    };
    void load();
    const id = window.setInterval(() => { void load(); }, 20000);
    return () => window.clearInterval(id);
  }, [limit]);

  return winners;
}

export function formatGiveawayWinnerAgo(wonAt: number, now = Date.now()): string {
  const diffMs = Math.max(0, now - wonAt);
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 60) return `${Math.max(1, minutes)}M AGO`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}H AGO`;
  const days = Math.floor(hours / 24);
  return `${days}D AGO`;
}
