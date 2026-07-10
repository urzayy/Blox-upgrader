export type AppRoute = 'main' | 'upgrade' | 'profile' | 'free-cases' | 'giveaways' | 'admin';

export function routeFromPathname(pathname = window.location.pathname): AppRoute {
  const normalized = pathname.replace(/\/+$/, '') || '/';
  if (normalized === '/profile') return 'profile';
  if (normalized === '/upgrade') return 'upgrade';
  if (normalized === '/free-cases' || normalized.startsWith('/free-cases/')) return 'free-cases';
  if (normalized === '/giveaways' || normalized.startsWith('/giveaways/')) return 'giveaways';
  if (normalized === '/admin') return 'admin';
  return 'main';
}

export function freeCaseSlugFromPathname(pathname = window.location.pathname): string | null {
  const normalized = pathname.replace(/\/+$/, '') || '/';
  const match = normalized.match(/^\/free-cases\/([^/]+)$/);
  return match ? match[1].toLowerCase() : null;
}

export function pathForRoute(route: AppRoute): string {
  if (route === 'profile') return '/profile';
  if (route === 'upgrade') return '/upgrade';
  if (route === 'free-cases') return '/free-cases';
  if (route === 'giveaways') return '/giveaways';
  if (route === 'admin') return '/admin';
  return '/';
}

export function navigateApp(route: AppRoute): void {
  const nextPath = pathForRoute(route);
  if (window.location.pathname !== nextPath) {
    window.history.pushState({ route }, '', nextPath);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }
}

export function navigateFreeCase(slug: string): void {
  const nextPath = `/free-cases/${slug.toLowerCase()}`;
  if (window.location.pathname !== nextPath) {
    window.history.pushState({ route: 'free-cases' }, '', nextPath);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }
}

export function caseSlugFromPathname(pathname = window.location.pathname): string | null {
  const normalized = pathname.replace(/\/+$/, '') || '/';
  const match = normalized.match(/^\/cases\/([^/]+)$/);
  return match ? match[1].toLowerCase() : null;
}

export function navigateCase(slug: string): void {
  const nextPath = `/cases/${slug.toLowerCase()}`;
  if (window.location.pathname !== nextPath) {
    window.history.pushState({ route: 'main' }, '', nextPath);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }
}

export function giveawayPeriodFromPathname(pathname = window.location.pathname): string | null {
  const normalized = pathname.replace(/\/+$/, '') || '/';
  const match = normalized.match(/^\/giveaways\/([^/]+)$/);
  return match ? match[1].toLowerCase() : null;
}

export function navigateGiveaway(period: string): void {
  const nextPath = `/giveaways/${period.toLowerCase()}`;
  if (window.location.pathname !== nextPath) {
    window.history.pushState({ route: 'giveaways' }, '', nextPath);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }
}
