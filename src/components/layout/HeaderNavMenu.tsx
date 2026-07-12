import { useAuth } from '../../context/AuthContext';
import { useAppRoute } from '../../hooks/useAppRoute';
import {
  ADMIN_NAV_ITEM,
  NAV_ITEMS,
  isNavItemActive,
  navigateNavItem,
  type NavItem,
} from '../../lib/navItems';
import { AdminChatsNavButton } from './AdminChatsNavButton';

interface Props {
  compact?: boolean;
  adminInboxOpen?: boolean;
  adminChatAttentionCount?: number;
  onOpenAdminInbox?: () => void;
}

export function HeaderNavMenu({
  compact = false,
  adminInboxOpen = false,
  adminChatAttentionCount = 0,
  onOpenAdminInbox,
}: Props) {
  const route = useAppRoute();
  const { isAdmin } = useAuth();
  const items = isAdmin
    ? [...NAV_ITEMS.filter(item => item.id !== 'profile'), ADMIN_NAV_ITEM]
    : NAV_ITEMS.filter(item => item.id !== 'profile');

  const handleClick = (item: NavItem) => {
    navigateNavItem(item);
  };

  return (
    <nav
      aria-label="Main navigation"
      className={`flex items-center ${compact ? 'gap-1 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden' : 'gap-0.5 sm:gap-1 lg:gap-2'}`}
    >
      {items.map(item => {
        const active = isNavItemActive(item, route);
        return (
          <button
            key={item.id}
            type="button"
            disabled={!item.available}
            title={item.available ? item.label : `${item.label} — coming soon`}
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
      {isAdmin && onOpenAdminInbox && (
        <AdminChatsNavButton
          compact={compact}
          active={adminInboxOpen}
          attentionCount={adminChatAttentionCount}
          onOpen={onOpenAdminInbox}
        />
      )}
    </nav>
  );
}
