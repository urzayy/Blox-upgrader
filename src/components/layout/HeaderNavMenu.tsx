import type { ReactNode } from 'react';
import { navigateApp } from '../../lib/appRoute';
import { useAppRoute } from '../../hooks/useAppRoute';
import { useAuth } from '../../context/AuthContext';

type NavItemId = 'upgrades' | 'case-battle' | 'giveaways' | 'free-cases' | 'admin';

interface NavItem {
  id: NavItemId;
  label: string;
  icon: ReactNode;
  available: boolean;
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

const NAV_ITEMS: NavItem[] = [
  { id: 'upgrades', label: 'Upgrades', icon: <UpgradesIcon />, available: true },
  { id: 'case-battle', label: 'Case battle', icon: <CaseBattleIcon />, available: false },
  { id: 'giveaways', label: 'Giveaways', icon: <GiveawaysIcon />, available: true },
  { id: 'free-cases', label: 'Free cases', icon: <FreeCasesIcon />, available: true },
];

const ADMIN_NAV_ITEM: NavItem = {
  id: 'admin',
  label: 'Admin',
  icon: <AdminIcon />,
  available: true,
};

interface Props {
  compact?: boolean;
}

export function HeaderNavMenu({ compact = false }: Props) {
  const route = useAppRoute();
  const { isAdmin } = useAuth();
  const items = isAdmin ? [...NAV_ITEMS, ADMIN_NAV_ITEM] : NAV_ITEMS;

  const handleClick = (item: NavItem) => {
    if (!item.available) return;
    if (item.id === 'upgrades') navigateApp('upgrade');
    if (item.id === 'free-cases') navigateApp('free-cases');
    if (item.id === 'giveaways') navigateApp('giveaways');
    if (item.id === 'admin') navigateApp('admin');
  };

  const isActive = (item: NavItem) => {
    if (item.id === 'upgrades') return route === 'upgrade';
    if (item.id === 'free-cases') return route === 'free-cases';
    if (item.id === 'giveaways') return route === 'giveaways';
    if (item.id === 'admin') return route === 'admin';
    return false;
  };

  return (
    <nav
      aria-label="Navegación principal"
      className={`flex items-center ${compact ? 'gap-0.5 overflow-x-auto' : 'gap-0.5 sm:gap-1 lg:gap-2'}`}
    >
      {items.map(item => {
        const active = isActive(item);
        return (
          <button
            key={item.id}
            type="button"
            disabled={!item.available}
            title={item.available ? item.label : `${item.label} — próximamente`}
            onClick={() => handleClick(item)}
            className={`group relative flex shrink-0 items-center gap-2 rounded-lg px-2.5 py-2 transition sm:px-3 ${
              item.available ? 'cursor-pointer' : 'cursor-default opacity-50'
            } ${
              active
                ? 'bg-violet-500/[0.12] shadow-[0_0_22px_rgba(176,108,255,0.28)]'
                : 'hover:bg-white/[0.03]'
            }`}
          >
            {active && (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-lg bg-[radial-gradient(ellipse_at_center,rgba(176,108,255,0.22),transparent_72%)]"
              />
            )}
            <span className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center sm:h-7 sm:w-7">
              {item.icon}
            </span>
            <span
              className={`relative z-10 whitespace-nowrap font-display font-bold uppercase tracking-wide transition ${
                compact ? 'text-[10px]' : 'text-[11px] sm:text-xs'
              } ${
                active
                  ? 'text-[#e4d4ff]'
                  : 'text-white/40 group-hover:text-white/65'
              }`}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
