import { useCallback, useEffect, useState } from 'react';

import {
  fetchGiveawayDetail,
  type GiveawayDetailResponse,
} from '../lib/giveawayApi';
import type { GiveawayPeriod } from '../lib/giveaways';

const DETAIL_POLL_MS = 3500;
export const GIVEAWAY_UPDATED_EVENT = 'giveaway-updated';

export function dispatchGiveawayUpdated(): void {
  window.dispatchEvent(new CustomEvent(GIVEAWAY_UPDATED_EVENT));
}

export function useGiveawayDetail(period: GiveawayPeriod | null, userId: string | null) {
  const [detail, setDetail] = useState<GiveawayDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!period) {
      setDetail(null);
      setLoading(false);
      return;
    }
    const data = await fetchGiveawayDetail(period, userId);
    setDetail(data);
    setLoading(false);
  }, [period, userId]);

  useEffect(() => {
    setLoading(true);
    void refresh();
    const pollId = window.setInterval(() => { void refresh(); }, DETAIL_POLL_MS);
    const onUpdate = () => { void refresh(); };
    window.addEventListener(GIVEAWAY_UPDATED_EVENT, onUpdate);
    return () => {
      window.clearInterval(pollId);
      window.removeEventListener(GIVEAWAY_UPDATED_EVENT, onUpdate);
    };
  }, [refresh]);

  return { detail, loading, refresh };
}
