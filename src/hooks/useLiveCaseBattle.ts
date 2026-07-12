import { useEffect, useState } from 'react';
import { getCaseBattleById, type CaseBattle } from '../lib/caseBattles';
import { BATTLES_UPDATED_EVENT } from '../lib/caseBattlesStorage';

export function useLiveCaseBattle(battleId: string): CaseBattle | undefined {
  const [battle, setBattle] = useState<CaseBattle | undefined>(() => getCaseBattleById(battleId));

  useEffect(() => {
    const sync = () => setBattle(getCaseBattleById(battleId));
    sync();

    const intervalId = window.setInterval(sync, 400);
    window.addEventListener(BATTLES_UPDATED_EVENT, sync);
    window.addEventListener('storage', sync);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener(BATTLES_UPDATED_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, [battleId]);

  return battle;
}
