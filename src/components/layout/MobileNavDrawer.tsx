import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useAppRoute } from '../../hooks/useAppRoute';
import { getNavItems, isNavItemActive, navigateNavItem, type NavItem } from '../../lib/navItems';
import { requestOpenAdminPanel } from '../../lib/uiActions';
import { useAdminChatNotifications } from '../../lib/adminChatNotifications';
import { DiscordLinkButton } from '../ui/DiscordLinkButton';

function HamburgerIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
      <path d="M4 7h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 12h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function AdminChatsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M8 10h8M8 14h5M12 3c-4.97 0-9 3.58-9 8 0 1.57.52 3.03 1.42 4.24L3 21l5.05-1.62A8.94 8.94 0 0 0 12 19c4.97 0 9-3.58 9-8s-4.03-8-9-8Z"
        fill="#22D3EE"
        stroke="#67E8F9"
        strokeWidth="0.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface DrawerProps {
  open: boolean;
  onClose: () => void;
}

function MobileNavDrawerPanel({ open, onClose }: DrawerProps) {
  const route = useAppRoute();
  const { isAdmin, user } = useAuth();
  const items = getNavItems({ isAdmin, isLoggedIn: Boolean(user) });
  const { attentionCount: adminChatAttentionCount } = useAdminChatNotifications({
    enabled: isAdmin,
    activeTicketId: null,
  });

  const handleSelect = useCallback((item: NavItem) => {
    if (!item.available) return;
    navigateNavItem(item);
    onClose();
  }, [onClose]);

  const handleOpenAdminChats = useCallback(() => {
    requestOpenAdminPanel('inbox');
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[200] lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.aside
            id="mobile-nav-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            className="absolute inset-y-0 left-0 flex w-[min(18rem,88vw)] flex-col border-r border-violet-500/20 bg-[#0a0812] shadow-[8px_0_40px_rgba(0,0,0,0.65)]"
            style={{ paddingTop: 'env(safe-area-inset-top, 0px)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          >
            <div className="flex items-center justify-between border-b border-white/8 px-4 py-4">
              <div>
                <p className="font-display text-xs font-bold uppercase tracking-[0.14em] text-white/40">
                  Menu
                </p>
                <h2 className="font-display text-lg font-bold tracking-wide text-white">
                  Blox<span className="text-gold">Upgrader</span>
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/60 transition hover:border-violet-500/30 hover:bg-violet-500/10 hover:text-white"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                  <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <nav aria-label="Main navigation" className="flex-1 overflow-y-auto px-3 py-3">
              <ul className="space-y-1.5">
                {items.map(item => {
                  const active = isNavItemActive(item, route);
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        disabled={!item.available}
                        onClick={() => handleSelect(item)}
                        className={`group flex min-h-[52px] w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition ${
                          item.available ? 'cursor-pointer' : 'cursor-default opacity-50'
                        } ${
                          active
                            ? 'border-violet-500/35 bg-violet-500/[0.14] shadow-[0_0_24px_rgba(176,108,255,0.2)]'
                            : 'border-transparent bg-transparent hover:border-white/8 hover:bg-white/[0.04]'
                        }`}
                      >
                        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${
                          active
                            ? 'border-violet-500/30 bg-violet-500/10'
                            : 'border-white/8 bg-white/[0.03] group-hover:border-violet-500/20'
                        }`}
                        >
                          {item.icon}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className={`block font-display text-sm font-bold uppercase tracking-wide ${
                            active ? 'text-[#e4d4ff]' : 'text-white/75 group-hover:text-white'
                          }`}
                          >
                            {item.label}
                          </span>
                          {item.description && (
                            <span className="mt-0.5 block truncate text-[11px] text-white/35 group-hover:text-white/50">
                              {item.description}
                            </span>
                          )}
                        </span>
                        {active && (
                          <span className="h-2 w-2 shrink-0 rounded-full bg-gold shadow-[0_0_8px_rgba(176,108,255,0.8)]" />
                        )}
                      </button>
                      {isAdmin && item.id === 'admin' && (
                        <button
                          type="button"
                          onClick={handleOpenAdminChats}
                          className="group relative mt-1.5 flex min-h-[52px] w-full items-center gap-3 rounded-xl border border-transparent bg-transparent px-3 py-3 text-left transition hover:border-cyan-500/25 hover:bg-cyan-500/[0.08]"
                        >
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/8 bg-white/[0.03] group-hover:border-cyan-500/25">
                            <AdminChatsIcon />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block font-display text-sm font-bold uppercase tracking-wide text-white/75 group-hover:text-cyan-100">
                              Chats
                            </span>
                            <span className="mt-0.5 block truncate text-[11px] text-white/35 group-hover:text-white/50">
                              Live chat inbox — deposits and withdrawals
                            </span>
                          </span>
                          {adminChatAttentionCount > 0 && (
                            <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-black text-deep">
                              {adminChatAttentionCount > 9 ? '9+' : adminChatAttentionCount}
                            </span>
                          )}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>

              <div className="mt-2 border-t border-white/8 pt-2">
                <DiscordLinkButton variant="menu" />
              </div>
            </nav>

            <div className="border-t border-white/8 px-4 py-3">
              <p className="text-center text-[10px] font-medium uppercase tracking-wider text-white/25">
                BloxUpgrader.com
              </p>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export function MobileNavMenuButton({ className = '' }: { className?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open navigation menu"
        aria-expanded={open}
        aria-controls="mobile-nav-drawer"
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/80 transition hover:border-violet-500/35 hover:bg-violet-500/10 hover:text-white lg:hidden ${className}`}
      >
        <HamburgerIcon />
      </button>
      <MobileNavDrawerPanel open={open} onClose={() => setOpen(false)} />
    </>
  );
}
