import { navigateCaseBattle } from '../../lib/appRoute';
import {
  BATTLE_MODE_META,
  battleActionLabel,
  resolveBattleCases,
  type CaseBattle,
} from '../../lib/caseBattles';
import { CoinPrice } from '../ui/CoinPrice';
import { BattlePlayersCell } from './BattlePlayersCell';
import { BattleRoundsBadge } from './BattleRoundsBadge';
import { BattleScenarioStrip } from './BattleScenarioStrip';

interface Props {
  battle: CaseBattle;
}

export function CaseBattleRow({ battle }: Props) {
  const cases = resolveBattleCases(battle.caseSlugs);
  const modeMeta = BATTLE_MODE_META[battle.mode];
  const action = battleActionLabel(battle);

  const handleAction = () => {
    navigateCaseBattle(battle.id);
  };

  return (
    <article
      className={`grid grid-cols-1 gap-4 border-b border-white/[0.06] px-3 py-4 transition hover:bg-white/[0.015] sm:grid-cols-[5.5rem_minmax(0,1fr)_7rem_8.5rem_9.5rem] sm:items-center sm:gap-3 sm:px-4 lg:px-5`}
    >
      <div className="flex items-center gap-3 sm:block">
        <span className="font-display text-[10px] font-bold uppercase tracking-[0.16em] text-white/30 sm:hidden">
          Rounds
        </span>
        <BattleRoundsBadge roundCount={cases.length} mode={battle.mode} />
      </div>

      <div className="min-w-0">
        <span className="mb-2 block font-display text-[10px] font-bold uppercase tracking-[0.16em] text-white/30 sm:hidden">
          Battle Scenario
        </span>
        <div className="overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <BattleScenarioStrip
            cases={cases}
            currentRound={battle.currentRound}
            mode={battle.mode}
          />
        </div>
      </div>

      <div>
        <span className="mb-1 block font-display text-[10px] font-bold uppercase tracking-[0.16em] text-white/30 sm:hidden">
          Cost
        </span>
        <CoinPrice
          value={battle.cost}
          textClassName={`font-display text-sm font-black sm:text-base ${modeMeta.text}`}
          iconClassName="h-3.5 w-3.5"
        />
      </div>

      <div>
        <span className="mb-1 block font-display text-[10px] font-bold uppercase tracking-[0.16em] text-white/30 sm:hidden">
          Players
        </span>
        <BattlePlayersCell
          players={battle.players}
          maxPlayers={battle.maxPlayers}
          mode={battle.mode}
        />
      </div>

      <div className="sm:justify-self-end">
        <span className="mb-2 block font-display text-[10px] font-bold uppercase tracking-[0.16em] text-white/30 sm:hidden">
          Status
        </span>
        <button
          type="button"
          onClick={handleAction}
          className={`inline-flex w-full items-center justify-center gap-2 rounded-md border px-4 py-2.5 font-display text-[11px] font-black uppercase tracking-[0.12em] transition sm:w-auto sm:min-w-[9.5rem] ${
            action === 'join'
              ? `${modeMeta.border} bg-white/[0.03] ${modeMeta.text} hover:bg-white/[0.06]`
              : `${modeMeta.border} bg-transparent ${modeMeta.text} hover:bg-white/[0.04]`
          }`}
        >
          {action === 'join' ? (
            <>
              <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
                <path d="M8 3.5C5.24 3.5 3 5.74 3 8.5c0 2.4 1.74 4.39 4.02 4.77.08.01.17.02.25.02.18 0 .35-.03.51-.08.16-.05.31-.12.45-.21.14-.09.27-.2.38-.33.11-.13.2-.28.27-.44.07-.16.11-.33.13-.51.02-.18.01-.36-.03-.54A4.98 4.98 0 0 1 8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6c.55 0 1.07-.15 1.52-.41.45-.26.82-.63 1.08-1.08.26-.45.4-.97.4-1.51 0-1.66-1.34-3-3-3Z" />
              </svg>
              Join
            </>
          ) : (
            <>
              <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
                <path d="M8 3.5C5.24 3.5 3 5.74 3 8.5c0 2.4 1.74 4.39 4.02 4.77.08.01.17.02.25.02.18 0 .35-.03.51-.08.16-.05.31-.12.45-.21.14-.09.27-.2.38-.33.11-.13.2-.28.27-.44.07-.16.11-.33.13-.51.02-.18.01-.36-.03-.54A4.98 4.98 0 0 1 8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6c.55 0 1.07-.15 1.52-.41.45-.26.82-.63 1.08-1.08.26-.45.4-.97.4-1.51 0-1.66-1.34-3-3-3Z" />
              </svg>
              View battle
            </>
          )}
        </button>
      </div>
    </article>
  );
}
