import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import type { PlayerLevelState } from '../lib/playerLevel';
import { getPlayerLevel, subscribeXpUpdates } from '../lib/xpStorage';

export function usePlayerLevel(): PlayerLevelState {
  const { user } = useAuth();
  const userId = user?.userId ?? null;
  const [level, setLevel] = useState<PlayerLevelState>(() => getPlayerLevel(userId));

  useEffect(() => {
    setLevel(getPlayerLevel(userId));
    return subscribeXpUpdates(userId, setLevel);
  }, [userId]);

  return level;
}
