import type { BattlePlayer } from '../../lib/caseBattles';

import type { BattlePlayerOutcome } from '../../lib/caseBattleOutcome';

import type { ProfileAvatarId } from '../../lib/profileAvatars';

import type { BattleColumnDensity } from '../../lib/battleArenaDensity';

import { CoinPrice } from '../ui/CoinPrice';

import { BattlePlayerAvatar } from './BattlePlayerAvatar';



interface Props {

  player: BattlePlayer;

  outcome: BattlePlayerOutcome;

  profilePhotoUrl?: string | null;

  profileAvatarId?: ProfileAvatarId;

  compact?: boolean;

  density?: BattleColumnDensity;

}



function BattleThumbsUpIcon({ className = '' }: { className?: string }) {

  return (

    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" fill="currentColor">

      <path

        d="M12 28c0-2.2 1.8-4 4-4h8l6-14.5c.8-2 3.6-2.4 5.1-.7l2.2 2.6-4.8 12.6h11.7c3.3 0 5.8 3 5.1 6.2L44 46H22c-2.2 0-4-1.8-4-4V28Z"

        opacity="0.92"

      />

      <rect x="8" y="26" width="8" height="18" rx="2.5" opacity="0.75" />

    </svg>

  );

}



export function BattleLossBadge({

  className = '',

  iconClassName = '',

}: {

  className?: string;

  iconClassName?: string;

}) {

  return (

    <div

      className={`flex items-center justify-center rounded-full border border-red-400/25 bg-red-400/[0.06] text-red-400/85 shadow-[inset_0_0_28px_rgba(239,68,68,0.1),0_0_40px_rgba(239,68,68,0.08)] ${className}`}

      aria-label="Defeat"

    >

      <BattleThumbsUpIcon

        className={`rotate-180 ${iconClassName || 'h-24 w-24 sm:h-28 sm:w-28'}`}

      />

    </div>

  );

}



export function BattleFinishPanel({

  player,

  outcome,

  profilePhotoUrl,

  profileAvatarId,

  compact = false,

  density,

}: Props) {

  if (!outcome.isWinner) {

    return (

      <div className="flex w-full flex-col items-center justify-center px-2 py-3 sm:px-3 sm:py-4">

        <BattleLossBadge
          className={density?.finishLoss ?? (compact ? 'h-20 w-20 sm:h-24 sm:w-24' : 'h-36 w-36 sm:h-40 sm:w-40')}
          iconClassName={density?.finishLossIcon ?? (compact ? 'h-14 w-14 sm:h-16 sm:w-16' : 'h-28 w-28 sm:h-32 sm:w-32')}
        />

      </div>

    );

  }



  return (

    <div className="flex w-full flex-col items-center justify-center px-2 py-3 sm:px-3 sm:py-4">

      <div className={`flex w-full flex-col items-center rounded-2xl border border-lime-400/25 bg-lime-400/[0.04] text-center shadow-[0_0_32px_rgba(132,204,22,0.08)] ${
        compact ? 'max-w-[11rem] px-3 py-3' : 'max-w-[15rem] px-4 py-5'
      }`}
      >

        <BattlePlayerAvatar

          player={player}

          size={compact ? 'sm' : 'lg'}

          showWinCrown

          winnerGlow

          className={compact ? 'mb-2' : 'mb-4'}

          profilePhotoUrl={profilePhotoUrl}

          profileAvatarId={profileAvatarId}

        />



        <CoinPrice

          value={outcome.winnings}

          textClassName={`font-display font-black text-lime-300 ${compact ? 'text-xl sm:text-2xl' : 'text-3xl sm:text-4xl'}`}

          iconClassName={compact ? 'h-4 w-4 sm:h-5 sm:w-5' : 'h-6 w-6 sm:h-7 sm:w-7'}

        />



        {outcome.loanPaid != null && (

          <div className="mt-4 flex w-full items-center justify-center gap-2 border-t border-white/10 pt-4">

            <span className="font-display text-[10px] font-bold uppercase tracking-[0.12em] text-white/45">

              Pagado

            </span>

            <CoinPrice

              value={outcome.loanPaid}

              textClassName="font-display text-sm font-black text-white/70"

              iconClassName="h-3.5 w-3.5"

            />

          </div>

        )}

      </div>

    </div>

  );

}


