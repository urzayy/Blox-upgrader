import { useEffect, useState } from 'react';
import {
  battleIdFromPathname,
  caseSlugFromPathname,
  freeCaseSlugFromPathname,
  giveawayPeriodFromPathname,
  isCreateCaseBattlePath,
  routeFromPathname,
  type AppRoute,
} from '../lib/appRoute';

export function useCaseSlug(): string | null {
  const [slug, setSlug] = useState<string | null>(() => caseSlugFromPathname());

  useEffect(() => {
    const sync = () => setSlug(caseSlugFromPathname());
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);

  return slug;
}

export function useAppRoute(): AppRoute {
  const [route, setRoute] = useState<AppRoute>(() => routeFromPathname());

  useEffect(() => {
    const sync = () => setRoute(routeFromPathname());
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);

  return route;
}

export function useFreeCaseSlug(): string | null {
  const [slug, setSlug] = useState<string | null>(() => freeCaseSlugFromPathname());

  useEffect(() => {
    const sync = () => setSlug(freeCaseSlugFromPathname());
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);

  return slug;
}

export function useGiveawayPeriod(): string | null {
  const [period, setPeriod] = useState<string | null>(() => giveawayPeriodFromPathname());

  useEffect(() => {
    const sync = () => setPeriod(giveawayPeriodFromPathname());
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);

  return period;
}

export function useBattleId(): string | null {
  const [battleId, setBattleId] = useState<string | null>(() => battleIdFromPathname());

  useEffect(() => {
    const sync = () => setBattleId(battleIdFromPathname());
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);

  return battleId;
}

export function useIsCreateCaseBattle(): boolean {
  const [isCreate, setIsCreate] = useState(() => isCreateCaseBattlePath());

  useEffect(() => {
    const sync = () => setIsCreate(isCreateCaseBattlePath());
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);

  return isCreate;
}
