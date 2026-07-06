import { CoinPrice } from '../ui/CoinPrice';
import { inventoryTotal } from '../../lib/inventory';
import type { Skin } from '../../data/skins';

interface Props {
  balance: number;
  inventory: Skin[];
  user: { email: string } | null;
  profileLabel: string;
  turbo: boolean;
  isAdmin: boolean;
  openLiveChatCount: number;
  liveChatsOpen: boolean;
  withdrawOpen: boolean;
  adminChatAttentionCount: number;
  adminInboxOpen: boolean;
  supportChatOpen: boolean;
  clearOpen: boolean;
  seeOpen: boolean;
  giftMoneyOpen: boolean;
  giftOpen: boolean;
  userDbOpen: boolean;
  adminOpen: boolean;
  onTurboToggle: () => void;
  onOpenLogin: () => void;
  onLogout: () => void;
  onOpenLiveChats: () => void;
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
  onOpenNickname: () => void;
  onOpenClear: () => void;
  onOpenSee: () => void;
  onOpenAdminInbox: () => void;
  onOpenGiftMoney: () => void;
  onOpenGift: () => void;
  onOpenUserDb: () => void;
  onOpenAdmin: () => void;
}

export function MobileHeaderBar({
  balance,
  inventory,
  user,
  profileLabel,
  turbo,
  isAdmin,
  openLiveChatCount,
  liveChatsOpen,
  withdrawOpen,
  adminChatAttentionCount,
  adminInboxOpen,
  supportChatOpen,
  clearOpen,
  seeOpen,
  giftMoneyOpen,
  giftOpen,
  userDbOpen,
  adminOpen,
  onTurboToggle,
  onOpenLogin,
  onLogout,
  onOpenLiveChats,
  onOpenDeposit,
  onOpenWithdraw,
  onOpenNickname,
  onOpenClear,
  onOpenSee,
  onOpenAdminInbox,
  onOpenGiftMoney,
  onOpenGift,
  onOpenUserDb,
  onOpenAdmin,
}: Props) {
  return (
    <div className="flex flex-col gap-2.5 px-2 py-2 lg:hidden">
      <div className="text-center">
        <h1 className="font-display text-sm font-bold tracking-[0.12em] uppercase sm:text-base">
          Blox<span className="text-gold">Upgrader</span>
          <span className="text-[10px] font-semibold tracking-normal text-white/40">.com</span>
        </h1>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <div className="flex items-center gap-1 rounded-lg border border-white/5 bg-panel/90 px-2 py-1">
          <span className="text-[8px] font-semibold uppercase tracking-wide text-white/40">Saldo</span>
          <CoinPrice value={balance} iconClassName="h-3 w-3" textClassName="font-display text-[11px] font-bold text-gold" />
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-white/5 bg-panel/90 px-2 py-1">
          <span className="text-[8px] font-semibold uppercase tracking-wide text-white/40">Inv</span>
          <CoinPrice value={inventoryTotal(inventory)} iconClassName="h-3 w-3" textClassName="font-display text-[11px] font-bold text-gold" />
        </div>
        <button
          type="button"
          onClick={onTurboToggle}
          aria-pressed={turbo}
          aria-label={turbo ? 'Desactivar turbo' : 'Activar turbo'}
          className={`flex h-9 w-9 items-center justify-center rounded-lg border transition ${
            turbo ? 'border-gold bg-gold/15 shadow-gold' : 'border-white/10 bg-panel hover:border-gold/40'
          }`}
        >
          <LightningIcon active={turbo} />
        </button>
      </div>

      {user ? (
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={onOpenLiveChats}
            className={`relative rounded-lg border px-3 py-2 font-display text-[10px] font-bold uppercase tracking-wide ${
              liveChatsOpen
                ? 'border-win/40 bg-win/15 text-win'
                : 'border-win/25 bg-win/10 text-win'
            } ${openLiveChatCount > 0 ? 'pr-7' : ''}`}
          >
            Chats
            {openLiveChatCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[9px] font-black text-deep">
                {openLiveChatCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={onOpenDeposit}
            className="rounded-lg border border-gold/45 bg-gradient-to-r from-[#ffe566] via-[#ffcc00] to-[#ffb800] px-4 py-2 font-display text-[10px] font-bold uppercase tracking-wide text-[#1a1400] shadow-[0_0_20px_rgba(255,215,0,0.3)]"
          >
            Deposit
          </button>
          <button
            type="button"
            onClick={onOpenWithdraw}
            className={`rounded-lg border px-4 py-2 font-display text-[10px] font-bold uppercase tracking-wide text-white ${
              withdrawOpen ? 'border-white/40 bg-white/15' : 'border-white/20 bg-white/10'
            }`}
          >
            Withdraw
          </button>
          <button
            type="button"
            onClick={onOpenNickname}
            className="max-w-[120px] truncate rounded-lg border border-white/10 bg-panel/80 px-2.5 py-2 text-[10px] text-white/70"
          >
            {profileLabel}
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="rounded-lg border border-white/10 bg-panel px-3 py-2 text-[10px] font-semibold text-white/60"
          >
            Salir
          </button>
        </div>
      ) : (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onOpenLogin}
            className="rounded-lg border border-gold/30 bg-gold/10 px-5 py-2 text-sm font-semibold text-gold"
          >
            Login
          </button>
        </div>
      )}

      {isAdmin && (
        <div className="overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="mx-auto flex w-max max-w-full flex-wrap justify-center gap-1.5 px-1">
            <AdminBtn active={clearOpen} onClick={onOpenClear} className="border-[#ff3344]/60 bg-[#ff3344]/15 text-[#ff6677]">
              Clear
            </AdminBtn>
            <AdminBtn active={seeOpen} onClick={onOpenSee}>See</AdminBtn>
            <AdminBtn active={adminInboxOpen || supportChatOpen} onClick={onOpenAdminInbox} badge={adminChatAttentionCount}>
              Chats
            </AdminBtn>
            <AdminBtn active={giftMoneyOpen} onClick={onOpenGiftMoney} gold>Gift $</AdminBtn>
            <AdminBtn active={giftOpen} onClick={onOpenGift} gold>Gift</AdminBtn>
            <AdminBtn active={userDbOpen} onClick={onOpenUserDb} gold>Users</AdminBtn>
            <AdminBtn active={adminOpen} onClick={onOpenAdmin} win>Admin</AdminBtn>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminBtn({
  children,
  onClick,
  active,
  badge,
  gold,
  win,
  className = '',
}: {
  children: string;
  onClick: () => void;
  active?: boolean;
  badge?: number;
  gold?: boolean;
  win?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative shrink-0 rounded-lg border px-2.5 py-1.5 font-display text-[9px] font-bold uppercase tracking-wide ${
        active
          ? gold
            ? 'border-gold bg-gold/20 text-gold'
            : win
              ? 'border-win bg-win/20 text-win'
              : 'border-white/40 bg-white/15 text-white'
          : gold
            ? 'border-gold/40 bg-gold/10 text-gold'
            : win
              ? 'border-win/40 bg-win/10 text-win'
              : 'border-white/25 bg-white/10 text-white/85'
      } ${className}`}
    >
      {children}
      {badge != null && badge > 0 && (
        <span className="absolute -right-1 -top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-gold px-0.5 text-[8px] font-black text-deep">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </button>
  );
}

function LightningIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={`h-5 w-5 ${active ? 'drop-shadow-[0_0_6px_rgba(255,215,0,0.8)]' : 'opacity-50'}`} aria-hidden="true">
      <path
        d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"
        fill={active ? '#FFD700' : '#B8960F'}
        stroke="#0a0a0a"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
    </svg>
  );
}
