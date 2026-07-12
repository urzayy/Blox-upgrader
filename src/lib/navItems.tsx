import type { ReactNode } from 'react';
import { navigateApp } from './appRoute';
import type { AppRoute } from './appRoute';

export type NavItemId =
  | 'cases'
  | 'upgrades'
  | 'case-battle'
  | 'giveaways'
  | 'free-cases'
  | 'profile'
  | 'admin';

export interface NavItem {
  id: NavItemId;
  label: string;
  description?: string;
  icon: ReactNode;
  available: boolean;
  requiresAuth?: boolean;
}

function CasesIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <rect x="3" y="8" width="18" height="13" rx="2" fill="#8B5CF6" stroke="#C4B5FD" strokeWidth="0.6" />
      <path d="M3 11h18" stroke="#6D28D9" strokeWidth="1.2" />
      <path d="M12 8V5.5M8.5 6.5 12 4l3.5 2.5" stroke="#D8B4FE" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function UpgradesIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M13 2 4 14h7l-1 8 9-12h-7l1-8z"
        fill="#EAB308"
        stroke="#FDE047"
        strokeWidth="0.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CaseBattleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path d="M4 20 9 4l2 7 3-2-2-7 6 11-2-3-3 2 3 8z" fill="#F97316" stroke="#FB923C" strokeWidth="0.6" strokeLinejoin="round" />
      <path d="M20 20 15 4l-2 7-3-2 2-7-6 11 2-3 3 2-3 8z" fill="#EA580C" stroke="#FDBA74" strokeWidth="0.6" strokeLinejoin="round" />
    </svg>
  );
}

function GiveawaysIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <rect x="4" y="9" width="16" height="11" rx="1.5" fill="#A855F7" />
      <path d="M12 9V4M8.5 6.5 12 4l3.5 2.5" stroke="#D8B4FE" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M4 11h16" stroke="#7C3AED" strokeWidth="1.2" />
    </svg>
  );
}

function FreeCasesIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M12 3.5 14.2 9h5.3l-4.3 3.1 1.6 5.3L12 15.8 7.2 17.4l1.6-5.3L4.5 9h5.3L12 3.5z"
        fill="#22D3EE"
        stroke="#67E8F9"
        strokeWidth="0.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="4" fill="#A78BFA" stroke="#C4B5FD" strokeWidth="0.6" />
      <path d="M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7" fill="#7C3AED" stroke="#A78BFA" strokeWidth="0.6" strokeLinecap="round" />
    </svg>
  );
}

function AdminIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M12 2 4 6v6c0 5 3.4 9.7 8 11 4.6-1.3 8-6 8-11V6l-8-4z"
        fill="#EF4444"
        stroke="#F87171"
        strokeWidth="0.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'cases', label: 'Cases', description: 'Browse all cases', icon: <CasesIcon />, available: true },
  { id: 'upgrades', label: 'Upgrade', description: 'Upgrade your skins', icon: <UpgradesIcon />, available: true },
  { id: 'case-battle', label: 'Case Battles', description: 'Battle other players', icon: <CaseBattleIcon />, available: true },
  { id: 'giveaways', label: 'Giveaways', description: 'Win free prizes', icon: <GiveawaysIcon />, available: true },
  { id: 'free-cases', label: 'Daily Cases', description: 'Free cases every day', icon: <FreeCasesIcon />, available: true },
  { id: 'profile', label: 'Profile', description: 'Your account & stats', icon: <ProfileIcon />, available: true, requiresAuth: true },
];

export const ADMIN_NAV_ITEM: NavItem = {
  id: 'admin',
  label: 'Admin',
  description: 'Admin dashboard',
  icon: <AdminIcon />,
  available: true,
};

export function routeForNavItem(item: NavItem): AppRoute | null {
  if (item.id === 'cases') return 'main';
  if (item.id === 'upgrades') return 'upgrade';
  if (item.id === 'case-battle') return 'case-battles';
  if (item.id === 'free-cases') return 'free-cases';
  if (item.id === 'giveaways') return 'giveaways';
  if (item.id === 'profile') return 'profile';
  if (item.id === 'admin') return 'admin';
  return null;
}

export function isNavItemActive(item: NavItem, route: AppRoute): boolean {
  const itemRoute = routeForNavItem(item);
  return itemRoute !== null && itemRoute === route;
}

export function navigateNavItem(item: NavItem): void {
  if (!item.available) return;
  const route = routeForNavItem(item);
  if (route) navigateApp(route);
}

export function getNavItems(options: { isAdmin: boolean; isLoggedIn: boolean }): NavItem[] {
  const items = NAV_ITEMS.filter(item => !item.requiresAuth || options.isLoggedIn);
  return options.isAdmin ? [...items, ADMIN_NAV_ITEM] : items;
}
