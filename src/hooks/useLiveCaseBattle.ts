import { useEffect, useState } from 'react';
import { getCaseBattleById, type CaseBattle } from '../lib/caseBattles';
import { BATTLES_UPDATED_EVENT, hydrateBattleFromServer } from '../lib/caseBattlesStorage';

export function useLiveCaseBattle(battleId: string): CaseBattle | undefined {
  const [battle, setBattle] = useState<CaseBattle | undefined>(() => getCaseBattleById(battleId));

  useEffect(() => {
    let cancelled = false;

    const syncLocal = () => {
      if (!cancelled) setBattle(getCaseBattleById(battleId));
    };

    const syncRemote = async () => {
      const remote = await hydrateBattleFromServer(battleId);
      if (!cancelled) {
        setBattle(remote ?? getCaseBattleById(battleId));
      }
    };

    syncLocal();
    void syncRemote();

    const intervalId = window.setInterval(() => { void syncRemote(); }, 1000);
    const localIntervalId = window.setInterval(syncLocal, 400);
    window.addEventListener(BATTLES_UPDATED_EVENT, syncLocal);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      window.clearInterval(localIntervalId);
      window.removeEventListener(BATTLES_UPDATED_EVENT, syncLocal);
    };
  }, [battleId]);

  return battle;
}
