import { useMemo, type ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import { CoinPrice } from '../components/ui/CoinPrice';
import { SkinImage } from '../components/skins/SkinImage';
import { ProfileAvatar } from '../components/ui/ProfileAvatar';
import { useGiveawayDetail } from '../hooks/useGiveawayDetail';
import { formatGiveawayCountdown, useGiveawayCountdown } from '../hooks/useGiveawayCountdown';
import {
  GIVEAWAY_COINS_PER_ENTRY,
  GIVEAWAY_TEMPLATES,
  PLACEHOLDER_PRIZE,
  skinToGiveawayPrize,
  type GiveawayPeriod,
} from '../lib/giveaways';
import { navigateApp } from '../lib/appRoute';
import { requestOpenDeposit } from '../lib/uiActions';
import { formatUSD } from '../lib/wheelMath';



const VALID_PERIODS = new Set<GiveawayPeriod>(['daily', 'weekly', 'monthly']);



function CreatorBadge() {

  return (

    <div className="flex items-center gap-3">

      <div className="flex h-11 w-11 items-center justify-center rounded-md border border-amber-500/35 bg-amber-500/10">

        <svg viewBox="0 0 24 24" className="h-5 w-5 text-amber-400" fill="currentColor" aria-hidden="true">

          <rect x="4" y="9" width="16" height="11" rx="1.5" />

          <path d="M12 9V4M8.5 6.5 12 4l3.5 2.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />

        </svg>

      </div>

      <div>

        <p className="font-display text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">

          Creador oficial

        </p>

        <p className="font-display text-sm font-black uppercase tracking-wide text-white sm:text-base">

          bloxupgrader

        </p>

      </div>

    </div>

  );

}



function StatBlock({

  icon,

  label,

  value,

  valueClass = 'text-white',

}: {

  icon: React.ReactNode;

  label: string;

  value: ReactNode;

  valueClass?: string;

}) {

  return (

    <div className="flex min-w-0 items-center gap-2.5">

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-white/[0.08] bg-black/20 text-white/45">

        {icon}

      </div>

      <div className="min-w-0">

        <p className="font-display text-[9px] font-bold uppercase tracking-[0.14em] text-white/35">{label}</p>

        <div className={`font-display text-sm font-black tabular-nums sm:text-base ${valueClass}`}>{value}</div>

      </div>

    </div>

  );

}



interface Props {

  period: string;

}



export function GiveawayDetailPage({ period: rawPeriod }: Props) {

  const { user, openLogin } = useAuth();

  const period = VALID_PERIODS.has(rawPeriod as GiveawayPeriod)

    ? (rawPeriod as GiveawayPeriod)

    : null;

  const template = period ? GIVEAWAY_TEMPLATES[period] : null;

  const { detail, loading } = useGiveawayDetail(period, user?.userId ?? null);

  const runtime = detail?.giveaway;
  const active = runtime?.status === 'active' && Boolean(runtime.skin);
  const countdown = useGiveawayCountdown(runtime?.endsAt ?? null, active);
  const prize = runtime?.skin ? skinToGiveawayPrize(runtime.skin) : PLACEHOLDER_PRIZE;
  const myDeposited = detail?.me?.totalDeposited ?? 0;
  const myEntries = detail?.me?.entries ?? 0;
  const myChance = detail?.myChance ?? 0;
  const isParticipant = myDeposited > 0;
  const depositTarget = runtime?.depositRequirement ?? GIVEAWAY_COINS_PER_ENTRY;

  const nextEntryProgress = useMemo(() => {
    const remainder = myDeposited % GIVEAWAY_COINS_PER_ENTRY;
    return remainder === 0 && myDeposited > 0
      ? GIVEAWAY_COINS_PER_ENTRY
      : GIVEAWAY_COINS_PER_ENTRY - remainder;
  }, [myDeposited]);

  const handleDeposit = () => {
    if (!user) {
      openLogin();
      return;
    }
    requestOpenDeposit();
  };



  if (!period || !template) {

    return (

      <div className="flex min-h-[50vh] items-center justify-center px-4">

        <div className="text-center">

          <p className="text-white/50">Giveaway not found.</p>

          <button

            type="button"

            onClick={() => navigateApp('giveaways')}

            className="mt-4 rounded-lg border border-violet-500/35 bg-violet-500/10 px-4 py-2 text-sm font-semibold text-violet-200"

          >

            Back to giveaways

          </button>

        </div>

      </div>

    );

  }



  return (

    <div className="relative w-full overflow-hidden px-2 py-5 pb-16 sm:px-4 lg:px-6 xl:px-8">

      <div

        className="pointer-events-none absolute inset-x-0 top-0 h-64 opacity-60"

        style={{ background: `radial-gradient(ellipse at 50% 0%, ${template.glow}, transparent 70%)` }}

      />



      <section className="relative mx-auto max-w-[1100px]">

        <button

          type="button"

          onClick={() => navigateApp('giveaways')}

          className="mb-4 font-display text-[10px] font-bold uppercase tracking-[0.14em] text-white/40 transition hover:text-white/70"

        >

          ← Back to giveaways

        </button>



        <div

          className="overflow-hidden rounded-2xl border bg-[#101018]/95"

          style={{ borderColor: template.border }}

        >

          <div className="border-b border-white/[0.06] px-4 py-4 sm:px-6">

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr_repeat(3,minmax(0,1fr))] lg:items-center lg:gap-6">

              <CreatorBadge />

              <StatBlock

                icon={(

                  <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden="true">

                    <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />

                    <path d="M10 5v5l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />

                  </svg>

                )}

                label="Ends in"

                value={active ? formatGiveawayCountdown(countdown) : '—'}

                valueClass="text-rose-400"

              />

              <StatBlock

                icon={(

                  <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden="true">

                    <path d="M10 1 12.5 7H19l-5.5 4 2 6L10 13l-5.5 4 2-6L1 7h6.5L10 1z" />

                  </svg>

                )}

                label="Total prize pool"

                value={<CoinPrice value={prize.price} iconClassName="h-4 w-4" textClassName="text-sm font-bold text-amber-300" />}

              />

              <StatBlock

                icon={(

                  <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden="true">

                    <path d="M10 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zm-6.5 7a5.5 5.5 0 1 1 11 0H3.5z" />

                  </svg>

                )}

                label="Participants"

                value={(runtime?.participants ?? 0).toLocaleString('en-US')}

              />

            </div>

          </div>



          <div className="grid grid-cols-1 gap-3 border-b border-white/[0.06] p-4 sm:p-6 lg:grid-cols-[220px_1fr]">

            <div className="rounded-xl border border-white/[0.08] bg-[#0c0b12]/90 p-4">

              <div className="mb-3 flex items-center gap-2">

                <svg viewBox="0 0 20 20" className="h-4 w-4 text-violet-300" fill="currentColor" aria-hidden="true">

                  <path d="M4 4h12v3H4V4zm0 5h8v2H4V9zm0 4h12v3H4v-3z" />

                </svg>

                <span className="font-display text-[10px] font-bold uppercase tracking-[0.14em] text-white/45">

                  Your entries

                </span>

              </div>

              <p className="font-display text-3xl font-black tabular-nums text-white">

                {myEntries}

              </p>

              <p className="mt-2 font-display text-[10px] font-bold uppercase tracking-[0.12em] text-white/35">

                Your chance: {myChance.toFixed(myChance > 0 && myChance < 1 ? 2 : 1)}%

              </p>

              <p className="mt-3 text-[10px] leading-relaxed text-white/35">

                Cada {GIVEAWAY_COINS_PER_ENTRY} coins deposited = 1 entry. They stack.

              </p>

            </div>



            <div className="rounded-xl border border-lime-500/20 bg-[#17180f]/90 p-4 sm:p-5">

              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                <div className="flex items-start gap-3">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-lime-500/25 bg-lime-500/10 text-lime-300">

                    <svg viewBox="0 0 20 20" className="h-5 w-5" fill="currentColor" aria-hidden="true">

                      <path d="M3 6h14v9H3V6zm2-3h10v2H5V3z" />

                    </svg>

                  </div>

                  <div>

                    <p className="font-display text-xs font-bold uppercase tracking-wide text-lime-200/90">

                      Deposit: {formatUSD(depositTarget)}

                    </p>

                    <p className="mt-1 max-w-xl text-xs leading-relaxed text-white/45">
                      The more you deposit, the more entries you get and the better your odds.
                      {isParticipant && myEntries > 0 && (
                        <> You need <span className="text-lime-300">{formatUSD(nextEntryProgress)}</span> more for the next entry.</>
                      )}
                    </p>
                    {user && (
                      <p className="mt-2 text-[10px] uppercase tracking-wide text-white/35">
                        Total deposited in this giveaway: {formatUSD(myDeposited)}
                      </p>
                    )}
                    {user && !isParticipant && (
                      <p className="mt-2 text-xs font-semibold text-amber-300/90">
                        You haven't deposited in this giveaway. Deposit to participate.
                      </p>
                    )}

                  </div>

                </div>



                <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col xl:flex-row">
                  <button
                    type="button"
                    disabled={!active || loading}
                    onClick={handleDeposit}
                    className="rounded-xl bg-lime-400 px-6 py-3 font-display text-xs font-black uppercase tracking-[0.12em] text-[#101010] transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {isParticipant ? 'Deposit' : 'Deposit to join'}
                  </button>
                </div>
              </div>
              <p className="mt-3 text-[10px] leading-relaxed text-white/35">
                One deposit counts for all active giveaways (daily, weekly, monthly).
                When a giveaway ends, you must deposit again to join the next one.
              </p>

            </div>

          </div>



          <div className="px-4 py-5 sm:px-6">

            <div className="mb-4 flex items-center gap-2">

              <h2 className="font-display text-sm font-black uppercase tracking-[0.14em] text-white">

                Giveaway prizes

              </h2>

              <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 font-display text-[10px] font-bold text-white/45">

                1

              </span>

            </div>



            <div className="flex flex-col gap-4 rounded-2xl border border-white/[0.08] bg-[#0b0a12]/90 p-4 sm:flex-row sm:items-center sm:p-5">

              <div className="flex h-36 w-full max-w-[220px] items-center justify-center rounded-xl border border-white/[0.06] bg-[#141024]/80 sm:h-40">

                {prize.image ? (

                  <SkinImage src={prize.image} alt={`${prize.weaponLabel} ${prize.skinName}`} zoom={1.1} />

                ) : (

                  <span className="text-xs uppercase tracking-wide text-white/30">No prize</span>

                )}

              </div>

              <div className="min-w-0 flex-1">

                <p className="font-display text-[10px] font-bold uppercase tracking-wide text-white/35">

                  {prize.weaponLabel} | {prize.wear}

                </p>

                <p className="mt-1 font-display text-xl font-black uppercase tracking-wide text-white sm:text-2xl">

                  {prize.skinName}

                </p>

                <div className="mt-3 inline-flex rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-1.5">

                  <CoinPrice

                    value={prize.price}

                    iconClassName="h-4 w-4"

                    textClassName="font-display text-sm font-bold text-amber-300"

                  />

                </div>

              </div>

            </div>

          </div>



          <div className="border-t border-white/[0.06] px-4 py-5 sm:px-6">

            <h3 className="mb-4 font-display text-sm font-black uppercase tracking-[0.14em] text-white/80">

              Giveaway participants

            </h3>



            {detail?.participants?.length ? (

              <div className="flex flex-wrap gap-1.5">

                {detail.participants.map(participant => {

                  const isMe = participant.userId === user?.userId;

                  return (

                    <div

                      key={participant.userId}

                      title={`${participant.nickname || participant.email.split('@')[0]} · ${participant.entries} entries`}

                      className={`overflow-hidden rounded-md ${

                        isMe ? 'ring-2 ring-amber-400/80 ring-offset-1 ring-offset-[#101018]' : ''

                      }`}

                    >

                      <ProfileAvatar avatarId={participant.avatarId} size={34} />

                    </div>

                  );

                })}

              </div>

            ) : (

              <p className="text-sm text-white/35">

                No participants yet. Be the first to join.

              </p>

            )}

          </div>

        </div>



        {!loading && !active && (

          <p className="mt-4 text-center font-display text-xs font-bold uppercase tracking-[0.14em] text-white/35">

            This giveaway is closed

          </p>

        )}

      </section>

    </div>

  );

}


