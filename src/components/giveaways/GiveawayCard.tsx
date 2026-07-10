import { CoinPrice } from '../ui/CoinPrice';
import { padCountdownUnit, useGiveawayCountdown } from '../../hooks/useGiveawayCountdown';
import {
  PLACEHOLDER_PRIZE,
  skinToGiveawayPrize,
  type GiveawayDefinition,
} from '../../lib/giveaways';
import type { GiveawayRuntimeSlot } from '../../lib/giveawayApi';
import { navigateGiveaway } from '../../lib/appRoute';
import { SkinImage } from '../skins/SkinImage';

function HeaderIcon({ type, color }: { type: GiveawayDefinition['headerIcon']; color: string }) {
  if (type === 'crown') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill={color} aria-hidden="true">
        <path d="M4 17h16l-1.2-8.2-3.4 3.1L12 5 8.6 11.9 5.2 8.8 4 17zm1.6 2 14.8-.1.2 1H5.4l.2-1z" />
      </svg>
    );
  }
  if (type === 'calendar') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
        <rect x="4" y="5" width="16" height="15" rx="2" stroke={color} strokeWidth="1.8" />
        <path d="M8 3v4M16 3v4M4 10h16" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill={color} aria-hidden="true">
      <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />
    </svg>
  );
}

function ParticipantsIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 text-white/35" fill="currentColor" aria-hidden="true">
      <path d="M10 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zm-6.5 7a5.5 5.5 0 1 1 11 0H3.5z" />
    </svg>
  );
}

function CountdownBox({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex h-11 w-11 items-center justify-center rounded-md border border-white/[0.08] bg-[#0d0b14]/90 sm:h-12 sm:w-12">
        <span className="font-display text-lg font-black tabular-nums text-white/90 sm:text-xl">{value}</span>
      </div>
      <span className="font-display text-[9px] font-bold uppercase tracking-[0.16em] text-white/30">{label}</span>
    </div>
  );
}

interface Props {
  giveaway: GiveawayDefinition;
  runtime: GiveawayRuntimeSlot;
}

export function GiveawayCard({ giveaway, runtime }: Props) {
  const active = runtime.status === 'active' && Boolean(runtime.skin);
  const countdown = useGiveawayCountdown(runtime.endsAt, active);
  const prize = runtime.skin ? skinToGiveawayPrize(runtime.skin) : PLACEHOLDER_PRIZE;

  return (
    <article
      className="relative flex min-h-[28rem] flex-col overflow-hidden rounded-2xl border bg-[#12101c]/95 p-4 sm:min-h-[30rem] sm:p-5"
      style={{
        borderColor: giveaway.border,
        boxShadow: `0 12px 36px -12px rgba(0,0,0,0.65), 0 0 40px -12px ${giveaway.glow}`,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{ background: `radial-gradient(ellipse at 50% 0%, ${giveaway.glow}, transparent 68%)` }}
      />

      <header className="relative mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <HeaderIcon type={giveaway.headerIcon} color={giveaway.accent} />
          <div>
            <h2 className="font-display text-sm font-black uppercase tracking-[0.12em] text-white sm:text-base">
              {giveaway.title}
            </h2>
            <p className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">
              {giveaway.subtitle}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-black/25 px-2.5 py-1">
          <ParticipantsIcon />
          <span className="font-display text-xs font-bold tabular-nums text-white/55">
            {runtime.participants.toLocaleString('es-ES')}
          </span>
        </div>
      </header>

      <div className="relative mx-auto mb-4 flex w-full max-w-[16rem] flex-1 items-center justify-center py-2">
        <div
          className="absolute h-36 w-36 rounded-[1.35rem] rotate-45 border border-white/[0.06] bg-[#0a0812]/80 sm:h-40 sm:w-40"
          style={{ boxShadow: `inset 0 0 32px ${giveaway.glow}` }}
        />
        <div className="relative z-10 flex h-28 w-full items-center justify-center sm:h-32">
          {prize.image ? (
            <SkinImage src={prize.image} alt={`${prize.weaponLabel} ${prize.skinName}`} zoom={1.15} />
          ) : (
            <div className="flex flex-col items-center gap-2 text-white/25">
              <svg viewBox="0 0 24 24" className="h-14 w-14" fill="currentColor" aria-hidden="true">
                <rect x="4" y="9" width="16" height="11" rx="1.5" />
                <path d="M12 9V4M8.5 6.5 12 4l3.5 2.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <span className="font-display text-[10px] font-bold uppercase tracking-[0.14em]">Sorteo cerrado</span>
            </div>
          )}
        </div>
      </div>

      <div className="relative mb-4 flex items-end justify-between gap-3 border-b border-white/[0.06] pb-4">
        <div className="min-w-0">
          <p className="font-display text-[10px] font-bold uppercase tracking-wide text-white/35">
            {prize.weaponLabel} | {prize.wear}
          </p>
          <p className="truncate font-display text-base font-black uppercase tracking-wide text-white sm:text-lg">
            {prize.skinName}
          </p>
        </div>
        <CoinPrice
          value={prize.price}
          iconClassName="h-4 w-4"
          textClassName="font-display text-sm font-bold text-sky-300/90 sm:text-base"
        />
      </div>

      {active ? (
        <div className="relative mb-4 flex items-center justify-center gap-2 sm:gap-3">
          <CountdownBox value={padCountdownUnit(countdown.days)} label="D" />
          <CountdownBox value={padCountdownUnit(countdown.hours)} label="H" />
          <span className="mb-5 font-display text-lg font-black text-white/20">:</span>
          <CountdownBox value={padCountdownUnit(countdown.minutes)} label="Min" />
          <CountdownBox value={padCountdownUnit(countdown.seconds)} label="S" />
        </div>
      ) : (
        <p className="relative mb-4 text-center font-display text-xs font-bold uppercase tracking-[0.14em] text-white/30">
          Esperando próximo sorteo
        </p>
      )}

      <div className="relative mt-auto space-y-3">
        {active && runtime.depositRequirement > 0 && (
          <p className="text-center text-[10px] uppercase tracking-[0.12em] text-white/40">
            Depósito mínimo:{' '}
            <CoinPrice
              value={runtime.depositRequirement}
              iconClassName="h-3 w-3"
              textClassName="text-[10px] font-bold text-gold"
            />
          </p>
        )}

        <div className="flex items-center justify-between gap-2 rounded-lg border border-white/[0.06] bg-[#0a0812]/80 px-3 py-2.5">
          <span className="font-display text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">
            Valor total
          </span>
          <div className="flex items-center gap-2">
            <span className="rounded border border-white/[0.08] bg-[#141024] px-2 py-0.5 font-display text-xs font-bold text-white/50">
              1
            </span>
            <div className="rounded-md bg-emerald-500/15 px-2.5 py-1">
              <CoinPrice
                value={prize.price}
                iconClassName="h-3.5 w-3.5"
                textClassName="font-display text-xs font-bold text-emerald-300"
              />
            </div>
          </div>
        </div>

        <button
          type="button"
          disabled={!active}
          onClick={() => active && navigateGiveaway(giveaway.id)}
          className={`w-full rounded-xl border px-4 py-3 font-display text-xs font-black uppercase tracking-[0.14em] transition ${
            active
              ? 'border-violet-500/35 bg-gradient-to-r from-[#5b21b6] to-[#7c3aed] text-white hover:brightness-110'
              : 'cursor-not-allowed border-white/[0.06] bg-[#1a1830] text-white/35'
          }`}
        >
          {active ? 'Unirse al sorteo' : 'Sorteo cerrado'}
        </button>
      </div>
    </article>
  );
}
