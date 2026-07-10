import { useCallback, useEffect, useState } from 'react';
import { fetchGiveawaysState, type GiveawayRuntimeSlot, type GiveawaysStateResponse } from '../lib/giveawayApi';
import type { GiveawayPeriod } from '../lib/giveaways';

const EMPTY_SLOT: GiveawayRuntimeSlot = {
  period: 'daily',
  status: 'closed',
  skin: null,
  depositRequirement: 0,
  startedAt: null,
  endsAt: null,
  participants: 0,
  openedBy: null,
  closedAt: null,
};

function normalizeResponse(data: GiveawaysStateResponse | null): Record<GiveawayPeriod, GiveawayRuntimeSlot> {
  const periods: GiveawayPeriod[] = ['monthly', 'weekly', 'daily'];
  const result = {} as Record<GiveawayPeriod, GiveawayRuntimeSlot>;
  for (const period of periods) {
    result[period] = data?.giveaways?.[period] ?? { ...EMPTY_SLOT, period };
  }
  return result;
}

export function useGiveawaysState() {
  const [slots, setSlots] = useState<Record<GiveawayPeriod, GiveawayRuntimeSlot>>(() => normalizeResponse(null));
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const data = await fetchGiveawaysState();
    setSlots(normalizeResponse(data));
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
    const id = window.setInterval(() => { void refresh(); }, 15000);
    return () => window.clearInterval(id);
  }, [refresh]);

  return { slots, loading, refresh };
}
