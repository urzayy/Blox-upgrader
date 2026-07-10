import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AdminGiveawayPanel } from '../components/admin/AdminGiveawayPanel';
import { GiveawayCard } from '../components/giveaways/GiveawayCard';
import { LastGiveawayWinners } from '../components/giveaways/LastGiveawayWinners';
import { useGiveawaysState } from '../hooks/useGiveawaysState';
import { GIVEAWAYS } from '../lib/giveaways';

export function GiveawaysPage() {
  const { isAdmin, user } = useAuth();
  const { slots, refresh } = useGiveawaysState();
  const [adminOpen, setAdminOpen] = useState(false);

  return (
    <div className="relative w-full overflow-hidden px-2 py-5 pb-12 sm:px-4 lg:px-6 xl:px-8">
      <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-violet-600/20 blur-[100px]" />
      <div className="pointer-events-none absolute -right-20 top-32 h-80 w-80 rounded-full bg-fuchsia-600/15 blur-[110px]" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-64 w-96 -translate-x-1/2 rounded-full bg-indigo-600/10 blur-[90px]" />

      <section className="relative mx-auto max-w-[1200px]">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 text-violet-400" aria-hidden="true">
              <path d="M6 0 12 6 6 12 0 6Z" fill="currentColor" />
            </svg>
            <h1 className="font-display text-lg font-black uppercase tracking-wide text-white sm:text-xl lg:text-2xl">
              Giveaways
            </h1>
            <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 text-violet-400" aria-hidden="true">
              <path d="M6 0 12 6 6 12 0 6Z" fill="currentColor" />
            </svg>
          </div>

          {isAdmin && user && (
            <button
              type="button"
              onClick={() => setAdminOpen(true)}
              className="rounded-lg border border-violet-500/35 bg-violet-500/10 px-4 py-2 font-display text-[10px] font-black uppercase tracking-[0.14em] text-violet-200 transition hover:bg-violet-500/20"
            >
              Admin · Gestionar sorteos
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
          {GIVEAWAYS.map(giveaway => (
            <GiveawayCard
              key={giveaway.id}
              giveaway={giveaway}
              runtime={slots[giveaway.id]}
            />
          ))}
        </div>

        <LastGiveawayWinners />
      </section>

      {isAdmin && user && (
        <AdminGiveawayPanel
          open={adminOpen}
          adminEmail={user.email}
          slots={slots}
          onClose={() => setAdminOpen(false)}
          onUpdated={() => { void refresh(); }}
        />
      )}
    </div>
  );
}
