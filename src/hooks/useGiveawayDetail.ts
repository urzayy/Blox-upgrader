import { useCallback, useEffect, useState } from 'react';

import {

  fetchGiveawayDetail,

  type GiveawayDetailResponse,

} from '../lib/giveawayApi';

import type { GiveawayPeriod } from '../lib/giveaways';



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

    const pollId = window.setInterval(() => { void refresh(); }, 8000);
    const onDeposit = () => { void refresh(); };
    window.addEventListener('giveaway-deposit-recorded', onDeposit);
    return () => {
      window.clearInterval(pollId);
      window.removeEventListener('giveaway-deposit-recorded', onDeposit);
    };
  }, [refresh]);



  return { detail, loading, refresh };

}


