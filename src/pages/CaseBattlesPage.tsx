import { useMemo, useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getLiveCaseBattles,
  type BattleListTab,
  type BattleMode,
} from '../lib/caseBattles';
import { loadLiveBattles, BATTLES_UPDATED_EVENT } from '../lib/caseBattlesStorage';
import { navigateCreateCaseBattle } from '../lib/appRoute';
import { CaseBattleRow } from '../components/casebattles/CaseBattleRow';
import { CaseBattlesToolbar } from '../components/casebattles/CaseBattlesToolbar';

export function CaseBattlesPage({ balance }: { balance: number }) {
  const { user, openLogin } = useAuth();
  const [tab, setTab] = useState<BattleListTab>('active');
  const [modeFilter, setModeFilter] = useState<BattleMode | 'all'>('all');
  const [affordableOnly, setAffordableOnly] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadLiveBattles();
    setRefreshKey(key => key + 1);

    const sync = () => setRefreshKey(key => key + 1);
    const intervalId = window.setInterval(sync, 2000);
    window.addEventListener(BATTLES_UPDATED_EVENT, sync);
    window.addEventListener('storage', sync);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener(BATTLES_UPDATED_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const battles = useMemo(() => {
    void refreshKey;
    return getLiveCaseBattles().filter(battle => {
      if (tab === 'my-battles') {
        if (!user) return false;
        const joined = battle.players.some(player => player.id === user.userId);
        if (!joined) return false;
      }

      if (modeFilter !== 'all' && battle.mode !== modeFilter) return false;
      if (affordableOnly && battle.cost > balance) return false;
      return true;
    });
  }, [affordableOnly, balance, modeFilter, refreshKey, tab, user]);

  const hasFilters = modeFilter !== 'all' || affordableOnly;
  const emptyMessage =
    tab === 'my-battles'
      ? 'You have no active battles'
      : hasFilters
        ? 'No active battles match these filters'
        : 'No active battles right now';

  return (
    <div className="relative w-full overflow-hidden px-3 py-5 pb-24 sm:px-4 lg:px-6 xl:px-8">
      <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-lime-500/10 blur-[100px]" />
      <div className="pointer-events-none absolute -right-20 top-32 h-80 w-80 rounded-full bg-violet-600/10 blur-[110px]" />

      <section className="relative mx-auto max-w-[1400px]">
        <div className="mb-5 flex flex-wrap items-center gap-2 sm:gap-3">
          <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 text-lime-400" aria-hidden="true">
            <path d="M6 0 12 6 6 12 0 6Z" fill="currentColor" />
          </svg>
          <h1 className="font-display text-lg font-black uppercase tracking-wide text-white sm:text-xl lg:text-2xl">
            Case Battles
          </h1>
          <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 text-lime-400" aria-hidden="true">
            <path d="M6 0 12 6 6 12 0 6Z" fill="currentColor" />
          </svg>
        </div>

        <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-[#12101c]/95">
          <CaseBattlesToolbar
            tab={tab}
            onTabChange={setTab}
            modeFilter={modeFilter}
            onModeFilterChange={setModeFilter}
            affordableOnly={affordableOnly}
            onAffordableChange={setAffordableOnly}
            onCreateBattle={() => {
              if (!user) {
                openLogin();
                return;
              }
              navigateCreateCaseBattle();
            }}
          />

          <div className="hidden grid-cols-[5.5rem_minmax(0,1fr)_7rem_8.5rem_9.5rem] gap-3 border-b border-white/[0.06] px-4 py-3 font-display text-[10px] font-bold uppercase tracking-[0.18em] text-white/30 sm:grid lg:px-5">
            <span>Rounds</span>
            <span>Battle Scenario</span>
            <button type="button" className="inline-flex items-center gap-1 text-left hover:text-white/50">
              Cost
              <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="currentColor" aria-hidden="true">
                <path d="M6 3 9 7H3L6 3Z" />
              </svg>
            </button>
            <span>Players</span>
            <span className="text-right">Status</span>
          </div>

          {battles.length > 0 ? (
            battles.map(battle => <CaseBattleRow key={battle.id} battle={battle} />)
          ) : (
            <p className="px-4 py-16 text-center font-display text-sm font-bold uppercase tracking-[0.12em] text-white/35">
              {emptyMessage}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
