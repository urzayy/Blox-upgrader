import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { shouldBypassFreeCaseCooldown } from '../lib/devFreeCaseBypass';
import {
  canOpenFreeCase,
  formatCooldown,
  getCooldownRemainingMs,
  subscribeFreeCaseCooldowns,
} from '../lib/freeCaseCooldown';

export function useFreeCaseCooldown(slug: string) {
  const { user } = useAuth();
  const userId = user?.userId ?? null;
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    return subscribeFreeCaseCooldowns(userId, () => setNow(Date.now()));
  }, [userId]);

  const bypassCooldown = shouldBypassFreeCaseCooldown(slug);
  const remainingMs = bypassCooldown ? 0 : getCooldownRemainingMs(userId, slug, now);
  const ready = bypassCooldown || canOpenFreeCase(userId, slug, now);

  return {
    ready,
    remainingMs,
    timer: formatCooldown(remainingMs),
  };
}
