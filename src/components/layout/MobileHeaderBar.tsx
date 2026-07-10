import { CoinPrice } from '../ui/CoinPrice';
import { inventoryTotal } from '../../lib/inventory';
import { DEV_CLEAN_HEADER_LAYOUT } from '../../lib/devCleanHeaderLayout';
import { cleanHeaderChip } from '../../lib/cleanHeaderClasses';
import { ProfileMenu } from './ProfileMenu';
import { LogoutDoorButton } from './LogoutDoorButton';
import { HeaderNavMenu } from './HeaderNavMenu';
import type { Skin } from '../../data/skins';

interface Props {
  balance: number;
  inventory: Skin[];
  playersOnline: number;
  user: { email: string } | null;
  openLiveChatCount: number;
  liveChatsOpen: boolean;
  withdrawOpen: boolean;
  onOpenLogin: () => void;
  onOpenLiveChats: () => void;
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
}

export function MobileHeaderBar({
  balance,
  inventory,
  playersOnline,
  user,
  openLiveChatCount,
  liveChatsOpen,
  withdrawOpen,
  onOpenLogin,
  onOpenLiveChats,
  onOpenDeposit,
  onOpenWithdraw,
}: Props) {
  const clean = DEV_CLEAN_HEADER_LAYOUT;

  return (
    <div className={`flex flex-col px-2 py-2.5 lg:hidden ${
      DEV_CLEAN_HEADER_LAYOUT ? 'gap-3.5' : 'gap-2.5'
    }`}
    >
      <div className="text-center">
        <h1 className="font-display text-sm font-bold tracking-[0.12em] uppercase sm:text-base">
          Blox<span className="text-gold">Upgrader</span>
          {!clean && (
            <span className="text-[10px] font-semibold tracking-normal text-white/40">.com</span>
          )}
        </h1>
        {clean && (
          <div className="mt-1 flex items-center justify-center gap-1.5">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-win shadow-[0_0_6px_rgba(0,230,118,0.6)]" />
            <span className="font-display text-[10px] font-semibold tabular-nums text-white/75">
              {playersOnline.toLocaleString('es-ES')}
            </span>
            <span className="text-[9px] font-medium uppercase tracking-wide text-white/40">online</span>
          </div>
        )}
      </div>

      <HeaderNavMenu compact />

      <div className="flex flex-wrap items-center justify-center gap-2">
        {!clean && (
          <div className="flex items-center gap-1 rounded-lg border border-white/5 bg-panel/90 px-2 py-1">
            <span className="text-[8px] font-semibold uppercase tracking-wide text-white/40">Saldo</span>
            <CoinPrice value={balance} iconClassName="h-3 w-3" textClassName="font-display text-[11px] font-bold text-gold" />
          </div>
        )}
        {!clean && (
        <div className="flex items-center gap-1 rounded-lg border border-white/5 bg-panel/90 px-2 py-1">
          <span className="text-[8px] font-semibold uppercase tracking-wide text-white/40">Inv</span>
          <CoinPrice value={inventoryTotal(inventory)} iconClassName="h-3 w-3" textClassName="font-display text-[11px] font-bold text-gold" />
        </div>
        )}
      </div>

      {user ? (
        <div className="flex flex-wrap items-center justify-center gap-1 -translate-x-1">
          <button
            type="button"
            onClick={onOpenLiveChats}
            className={`relative rounded-md border font-display font-bold uppercase tracking-wide ${
              clean ? 'px-2.5 py-1.5 text-[9px]' : 'px-3 py-2 text-[10px]'
            } ${
              clean
                ? cleanHeaderChip(liveChatsOpen)
                : liveChatsOpen
                  ? 'border-win/40 bg-win/15 text-win'
                  : 'border-win/25 bg-win/10 text-win'
            } ${openLiveChatCount > 0 ? (clean ? 'pr-6' : 'pr-7') : ''}`}
          >
            Chats
            {openLiveChatCount > 0 && (
              <span className={`absolute right-1 top-1 flex items-center justify-center rounded-full bg-gold font-black text-deep ${
                clean ? 'h-3.5 min-w-3.5 px-0.5 text-[8px]' : 'h-4 min-w-4 px-1 text-[9px]'
              }`}
              >
                {openLiveChatCount}
              </span>
            )}
          </button>
          {clean && (
            <div className={`flex items-center gap-1 rounded-md border px-2 py-1.5 ${cleanHeaderChip(false)}`}>
              <span className="text-[8px] font-semibold uppercase tracking-wide text-white/45">Saldo</span>
              <CoinPrice value={balance} iconClassName="h-3 w-3" textClassName="font-display text-[10px] font-bold text-gold" />
            </div>
          )}
          <button
            type="button"
            onClick={onOpenDeposit}
            className={`rounded-md border border-gold/45 bg-gradient-to-r from-[#d8b4fe] via-[#c084fc] to-[#a855f7] font-display font-bold uppercase tracking-wide text-[#f5f0ff] shadow-[0_0_16px_rgba(176,108,255,0.25)] ${
              clean ? 'px-3 py-1.5 text-[9px]' : 'px-4 py-2 text-[10px]'
            }`}
          >
            Deposit
          </button>
          <button
            type="button"
            onClick={onOpenWithdraw}
            className={`rounded-md border font-display font-bold uppercase tracking-wide text-white ${
              clean ? 'px-3 py-1.5 text-[9px]' : 'px-4 py-2 text-[10px]'
            } ${
              withdrawOpen ? 'border-white/40 bg-white/15' : 'border-white/20 bg-white/10'
            }`}
          >
            Withdraw
          </button>
          <ProfileMenu />
          <LogoutDoorButton />
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
    </div>
  );
}
