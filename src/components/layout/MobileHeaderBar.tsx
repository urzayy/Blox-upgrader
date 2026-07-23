import { CoinPrice } from '../ui/CoinPrice';

import { inventoryTotal } from '../../lib/inventory';

import { DEV_CLEAN_HEADER_LAYOUT } from '../../lib/devCleanHeaderLayout';

import { cleanHeaderChip } from '../../lib/cleanHeaderClasses';

import { ProfileMenu } from './ProfileMenu';

import { LogoutDoorButton } from './LogoutDoorButton';

import { MobileNavMenuButton } from './MobileNavDrawer';

import { DiscordLinkButton } from '../ui/DiscordLinkButton';

import type { Skin } from '../../data/skins';



interface Props {

  balance: number;

  inventory: Skin[];

  playersOnline: number;

  user: { email: string } | null;

  onOpenLogin: () => void;

  onOpenDeposit: () => void;

  onOpenWithdraw: () => void;

  withdrawOpen: boolean;

}



export function MobileHeaderBar({

  balance,

  inventory,

  playersOnline,

  user,

  onOpenLogin,

  onOpenDeposit,

  onOpenWithdraw,

  withdrawOpen,

}: Props) {

  const clean = DEV_CLEAN_HEADER_LAYOUT;

  const invValue = inventoryTotal(inventory);



  return (

    <div className={`z-40 flex flex-col border-b border-white/5 bg-[#0a0812]/95 px-3 py-2.5 backdrop-blur-xl lg:hidden ${

      clean ? 'gap-2' : 'gap-2'

    }`}

    style={{ paddingTop: 'max(0.625rem, env(safe-area-inset-top, 0px))' }}

    >

      <div className="flex items-center gap-2">

        <MobileNavMenuButton />



        <button

          type="button"

          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}

          className="min-w-0 flex-1 text-left"

        >

          <h1 className="truncate font-display text-sm font-bold tracking-[0.08em] uppercase">

            Blox<span className="text-gold">Upgrader</span>

          </h1>

          <div className="mt-0.5 flex items-center gap-1.5">

            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-win shadow-[0_0_6px_rgba(0,230,118,0.6)]" />

            <span className="font-display text-[10px] font-semibold tabular-nums text-white/70">

              {playersOnline.toLocaleString('en-US')}

            </span>

            <span className="text-[9px] font-medium uppercase tracking-wide text-white/35">online</span>

          </div>

        </button>



        {user ? (

          <div className="flex shrink-0 items-center gap-1.5">

            <ProfileMenu />

            <LogoutDoorButton />

          </div>

        ) : (

          <button

            type="button"

            onClick={onOpenLogin}

            className="shrink-0 rounded-lg border border-gold/30 bg-gold/10 px-3 py-2 text-xs font-semibold text-gold"

          >

            Log in

          </button>

        )}

      </div>



      {user ? (

        <div className="flex items-center gap-1.5">

          <div className={`flex min-w-0 flex-1 items-center gap-2 rounded-lg border px-2.5 py-1.5 ${

            clean ? cleanHeaderChip(false) : 'border-white/10 bg-panel/90'

          }`}

          >

            <div className="min-w-0 flex-1">

              <span className="block text-[8px] font-semibold uppercase tracking-wide text-white/35">Balance</span>

              <CoinPrice value={balance} iconClassName="h-3 w-3" textClassName="font-display text-xs font-bold text-gold" />

            </div>

            <div className="h-6 w-px shrink-0 bg-white/10" />

            <div className="min-w-0 flex-1">

              <span className="block text-[8px] font-semibold uppercase tracking-wide text-white/35">Inventory</span>

              <CoinPrice value={invValue} iconClassName="h-3 w-3" textClassName="font-display text-xs font-bold text-gold" />

            </div>

          </div>

          <DiscordLinkButton />

          <button

            type="button"

            onClick={onOpenDeposit}

            className="shrink-0 rounded-lg border border-gold/45 bg-gradient-to-r from-[#d8b4fe] via-[#c084fc] to-[#a855f7] px-3 py-2 font-display text-[10px] font-bold uppercase tracking-wide text-[#f5f0ff] shadow-[0_0_12px_rgba(176,108,255,0.2)]"

          >

            Deposit

          </button>

          <button

            type="button"

            onClick={onOpenWithdraw}

            className={`shrink-0 rounded-lg border px-3 py-2 font-display text-[10px] font-bold uppercase tracking-wide text-white ${

              withdrawOpen ? 'border-white/40 bg-white/15' : 'border-white/20 bg-white/10'

            }`}

          >

            Withdraw

          </button>

        </div>

      ) : null}

    </div>

  );

}


