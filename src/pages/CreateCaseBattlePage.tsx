import { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProfileLabel } from '../lib/auth';
import { useProfilePhoto } from '../hooks/useProfilePhoto';
import { resolveAvatarId } from '../lib/profileAvatars';
import { navigateCaseBattle, navigateCaseBattles } from '../lib/appRoute';
import {
  BATTLE_MODE_DESCRIPTIONS,
  BATTLE_FORMATS,
  isBattleFormatAvailable,
  battleLoanEntryCost,
  getBattleFormatMeta,
} from '../lib/caseBattleCreate';
import {
  battleSlotsTotalCost,
  battleSlotsTotalCount,
  caseSlotQuantity,
  consolidateBattleSlots,
  pickRandomBattleSlots,
} from '../lib/caseBattleCatalog';
import {
  buildBattleFromDraft,
  type BattleFormat,
  type BattleMode,
  type BattlePrivacy,
} from '../lib/caseBattles';
import {
  addLiveBattle,
  BATTLE_MAX_CASE_COUNT,
  loadLastBattleDraft,
  saveLastBattleDraft,
  type BattleCaseSlot,
} from '../lib/caseBattlesStorage';
import { requestChargeBattleEntry } from '../lib/uiActions';
import { getCatalogCaseBySlug } from '../lib/caseCatalog';
import { catalogCaseToTier } from '../lib/catalogCaseUi';
import { BattleCasePickerModal } from '../components/casebattles/BattleCasePickerModal';
import { BattleCaseQuantitySelector } from '../components/casebattles/BattleCaseQuantitySelector';
import { BattleLoanModeControl } from '../components/casebattles/BattleLoanModeControl';
import { BattleOptionToggle } from '../components/casebattles/BattleOptionToggle';
import { BattleSideToggle } from '../components/casebattles/BattleSideToggle';
import { BattleRoundsBadge } from '../components/casebattles/BattleRoundsBadge';
import { CoinPrice } from '../components/ui/CoinPrice';
import type { BattleSide } from '../lib/battleSides';

const BATTLE_MODE_OPTIONS: { id: BattleMode; label: string }[] = [
  { id: 'classic', label: 'Classic' },
  { id: 'underdog', label: 'Underdog' },
  { id: 'share', label: 'Share' },
];

interface Props {
  balance: number;
}

function SelectedCaseCard({
  slot,
  maxQuantity,
  onQuantityChange,
  onRemove,
}: {
  slot: BattleCaseSlot;
  maxQuantity: number;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
}) {
  const item = getCatalogCaseBySlug(slot.slug);
  if (!item) return null;
  const tier = catalogCaseToTier(item);
  const quantity = caseSlotQuantity(slot);

  return (
    <div className="relative flex h-auto w-32 shrink-0 flex-col overflow-hidden rounded-lg border border-white/10 bg-[#171a22] sm:w-40 lg:w-48">
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-2 top-2 z-10 rounded bg-black/70 px-1.5 py-0.5 font-display text-[10px] font-black text-white/70 transition hover:text-white"
        aria-label="Remove case"
      >
        ×
      </button>
      <div className="absolute left-2 top-2 z-10 rounded bg-lime-400 px-1.5 py-0.5 font-display text-[10px] font-black text-[#10140f]">
        ×{quantity}
      </div>
      <div className="relative h-48 overflow-hidden bg-[#12101c] sm:h-52 lg:h-56">
        {tier.image ? (
          <img src={tier.image} alt="" className="h-full w-full object-cover object-center" draggable={false} />
        ) : null}
        {slot.joker && (
          <span className="absolute bottom-2 left-2 rounded bg-violet-600/90 px-1.5 py-0.5 font-display text-[8px] font-black uppercase text-white">
            Joker
          </span>
        )}
      </div>
      <div className="space-y-2 border-t border-white/10 px-2 py-2">
        <p className="truncate text-center font-display text-[10px] font-black uppercase tracking-[0.08em] text-white/75">
          {item.name}
        </p>
        <BattleCaseQuantitySelector
          compact
          value={quantity}
          max={maxQuantity}
          onChange={onQuantityChange}
        />
      </div>
    </div>
  );
}

export function CreateCaseBattlePage({ balance }: Props) {
  const { user, openLogin } = useAuth();
  const { photoUrl } = useProfilePhoto(user?.userId);
  const [cases, setCases] = useState<BattleCaseSlot[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [mode, setMode] = useState<BattleMode>('classic');
  const [format, setFormat] = useState<BattleFormat>('1v1');
  const [privacy, setPrivacy] = useState<BattlePrivacy>('public');
  const [loanMode, setLoanMode] = useState(false);
  const [loanPercent, setLoanPercent] = useState(50);
  const [hostSide, setHostSide] = useState<BattleSide>('counter-terrorist');
  const [error, setError] = useState('');

  const totalCost = useMemo(() => battleSlotsTotalCost(cases), [cases]);
  const entryCost = useMemo(
    () => battleLoanEntryCost(totalCost, loanMode, loanPercent),
    [loanMode, loanPercent, totalCost],
  );
  const totalCaseCount = useMemo(() => battleSlotsTotalCount(cases), [cases]);
  const formatMeta = getBattleFormatMeta(format);
  const canCreate = totalCaseCount > 0 && entryCost <= balance && Boolean(user);
  const atCaseLimit = totalCaseCount >= BATTLE_MAX_CASE_COUNT;

  const handleLastBattle = () => {
    if (!user) {
      openLogin();
      return;
    }
    const draft = loadLastBattleDraft(user.userId);
    if (!draft?.cases.length) {
      setError("You don't have a previous battle saved");
      return;
    }
    setCases(consolidateBattleSlots(draft.cases));
    setError('');
  };

  const handleRandomCases = () => {
    const randomCases = pickRandomBattleSlots(balance);
    if (randomCases.length === 0) {
      setError('Not enough balance for a random battle (25%)');
      return;
    }
    setCases(randomCases);
    setError('');
  };

  const handleCreate = () => {
    if (!user) {
      openLogin();
      return;
    }
    if (totalCaseCount === 0) {
      setError('Add at least one case');
      return;
    }
    if (entryCost > balance) {
      setError('You don\'t have enough balance');
      return;
    }
    if (!isBattleFormatAvailable(format)) {
      setError('This battle format is no longer available');
      return;
    }
    if (!requestChargeBattleEntry(entryCost)) {
      setError('You don\'t have enough balance');
      return;
    }

    const battle = buildBattleFromDraft({
      mode,
      format,
      privacy,
      loanMode,
      loanPercent,
      cases,
      maxPlayers: formatMeta.maxPlayers,
      hostSide,
      host: {
        userId: user.userId,
        name: getProfileLabel(user),
        avatarUrl: photoUrl ?? undefined,
        avatarId: resolveAvatarId(user.avatarId, user.email),
      },
    });

    addLiveBattle(battle);
    saveLastBattleDraft(user.userId, { cases, savedAt: Date.now() });
    navigateCaseBattle(battle.id);
  };

  return (
    <div className="relative w-full overflow-hidden px-3 py-5 pb-24 sm:px-4 lg:px-6 xl:px-8">
      <section className="relative mx-auto max-w-[1400px]">
        <button
          type="button"
          onClick={() => navigateCaseBattles()}
          className="mb-4 inline-flex items-center gap-2 font-display text-[11px] font-bold uppercase tracking-[0.12em] text-white/45 transition hover:text-white/75"
        >
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
            <path d="M10.5 3.5 6 8l4.5 4.5-1.1 1.1L3.8 8l5.6-5.6 1.1 1.1Z" />
          </svg>
          Back
        </button>

        <div className="mb-5 flex flex-wrap items-center gap-2">
          <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 text-lime-400" aria-hidden="true">
            <path d="M6 0 12 6 6 12 0 6Z" fill="currentColor" />
          </svg>
          <h1 className="font-display text-lg font-black uppercase tracking-wide text-white sm:text-xl">
            Creating battles
          </h1>
        </div>

        <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-[#12101c]/95">
          <div className="border-b border-white/[0.06] px-4 py-5 sm:px-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="flex min-w-0 flex-1 items-start gap-4">
                <BattleRoundsBadge roundCount={totalCaseCount} mode={mode} />
                <div className="min-w-0 flex-1 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <div className="flex min-w-max items-stretch gap-4">
                    {cases.map((slot, index) => {
                      const quantity = caseSlotQuantity(slot);
                      const maxQuantity = BATTLE_MAX_CASE_COUNT - (totalCaseCount - quantity);

                      return (
                        <SelectedCaseCard
                          key={`${slot.slug}-${slot.joker}`}
                          slot={slot}
                          maxQuantity={maxQuantity}
                          onQuantityChange={nextQuantity => {
                            if (nextQuantity < 1) {
                              setCases(current => current.filter((_, i) => i !== index));
                            } else {
                              setCases(current =>
                                current.map((entry, entryIndex) =>
                                  entryIndex === index ? { ...entry, quantity: nextQuantity } : entry,
                                ),
                              );
                            }
                            setError('');
                          }}
                          onRemove={() => setCases(current => current.filter((_, i) => i !== index))}
                        />
                      );
                    })}

                    <button
                      type="button"
                      onClick={() => setPickerOpen(true)}
                      disabled={atCaseLimit}
                      className={`flex h-[14rem] w-32 shrink-0 flex-col items-center justify-center rounded-lg border border-dashed bg-[#171a22]/70 transition sm:h-[16.5rem] sm:w-40 lg:h-[18rem] lg:w-48 ${
                        atCaseLimit
                          ? 'cursor-not-allowed border-white/10 opacity-40'
                          : 'border-white/15 hover:border-lime-400/40 hover:bg-[#171a22]'
                      }`}
                    >
                      <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-white/15 text-2xl text-white/35">
                        +
                      </span>
                      <span className="font-display text-[11px] font-black uppercase tracking-[0.12em] text-white/55">
                        {atCaseLimit ? 'Maximum 50' : 'Add case'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 flex-col gap-2">
                <button
                  type="button"
                  onClick={handleLastBattle}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-[#171a22] px-4 py-2.5 font-display text-[10px] font-black uppercase tracking-[0.12em] text-white/70 transition hover:text-white"
                >
                  <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
                    <path d="M8 3a5 5 0 1 0 4.9 6h-1.8V8h1.8l2.7 2.7-2.7 2.6H8v-1.8A5 5 0 0 0 8 3Z" />
                  </svg>
                  Last battle
                </button>
                <button
                  type="button"
                  onClick={handleRandomCases}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-[#171a22] px-4 py-2.5 font-display text-[10px] font-black uppercase tracking-[0.12em] text-white/70 transition hover:text-white"
                >
                  <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
                    <path d="M12.5 2.5 14 4 12.5 5.5M3.5 10.5 2 12l1.5 1.5M14 12l-1.5-1.5L11 12l1.5 1.5M4 4 2.5 5.5 4 7M10.5 5.5l-5 5M5.5 5.5h2v2h-2v-2Zm3 3h2v2h-2v-2Z" />
                  </svg>
                  Random cases
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-4 border-b border-white/[0.06] px-4 py-4 sm:grid-cols-2 lg:grid-cols-4 sm:px-6">
            <div>
              <p className="mb-2 font-display text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">
                Select type
              </p>
              <select
                value={format}
                onChange={event => setFormat(event.target.value as BattleFormat)}
                className="h-11 w-full rounded-lg border border-white/10 bg-[#171a22] px-3 font-display text-[11px] font-black uppercase tracking-[0.08em] text-white focus:border-lime-400/40 focus:outline-none"
              >
                {BATTLE_FORMATS.filter(option => isBattleFormatAvailable(option.id)).map(option => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <BattleOptionToggle
              label="Privacy"
              value={privacy}
              onChange={setPrivacy}
              options={[
                { id: 'public', label: 'Public' },
                { id: 'private', label: 'Private' },
              ]}
            />

            <BattleSideToggle value={hostSide} onChange={setHostSide} />

            <BattleLoanModeControl
              loanMode={loanMode}
              loanPercent={loanPercent}
              onLoanModeChange={setLoanMode}
              onLoanPercentChange={setLoanPercent}
            />
          </div>

          <div className="flex flex-col gap-4 px-4 py-4 lg:flex-row lg:items-end lg:gap-5 sm:px-6">
            <div className="shrink-0">
              <p className="font-display text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">
                Battle value
              </p>
              {loanMode && totalCost !== entryCost ? (
                <div className="flex flex-wrap items-center gap-3">
                  <CoinPrice
                    value={totalCost}
                    textClassName="font-display text-2xl font-black text-white/35 line-through decoration-white/35"
                    iconClassName="h-4 w-4 opacity-50"
                  />
                  <CoinPrice
                    value={entryCost}
                    textClassName="font-display text-2xl font-black text-lime-300"
                    iconClassName="h-4 w-4"
                  />
                </div>
              ) : (
                <CoinPrice
                  value={totalCost}
                  textClassName="font-display text-2xl font-black text-lime-300"
                  iconClassName="h-4 w-4"
                />
              )}
              {loanMode && totalCost !== entryCost && (
                <p className="mt-1 font-display text-[10px] font-bold uppercase tracking-[0.1em] text-white/35">
                  Loan {loanPercent}%
                </p>
              )}
              {error && (
                <p className="mt-2 font-display text-[11px] font-bold uppercase tracking-[0.08em] text-red-400">
                  {error}
                </p>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="mb-2 font-display text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">
                Case battle mode
              </p>
              <div className="flex gap-1 rounded-lg border border-white/10 bg-[#171a22] p-1">
                {BATTLE_MODE_OPTIONS.map(option => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setMode(option.id)}
                    className={`min-w-0 flex-1 rounded-md px-2 py-2.5 font-display text-[10px] font-black uppercase tracking-[0.06em] transition sm:px-3 sm:text-[11px] ${
                      mode === option.id ? 'bg-lime-400 text-[#10140f]' : 'text-white/45 hover:text-white/70'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              disabled={!canCreate}
              onClick={handleCreate}
              className={`inline-flex shrink-0 items-center justify-center rounded-lg px-5 py-3 font-display text-[11px] font-black uppercase tracking-[0.12em] transition lg:min-w-[14rem] ${
                canCreate
                  ? 'bg-lime-400 text-[#10140f] hover:bg-lime-300'
                  : 'cursor-not-allowed bg-white/10 text-white/30'
              }`}
            >
              Create case battle
            </button>
          </div>

          <div className="border-t border-white/[0.06] bg-[#0f0d18]/80 px-4 py-3 sm:px-6">
            <p className="font-display text-[11px] leading-relaxed text-white/45">
              {BATTLE_MODE_DESCRIPTIONS[mode]}
            </p>
          </div>
        </div>
      </section>

      <BattleCasePickerModal
        open={pickerOpen}
        balance={balance}
        selectedCases={cases}
        onClose={() => setPickerOpen(false)}
        onChangeSelectedCases={nextCases => {
          setCases(nextCases);
          setError('');
        }}
      />
    </div>
  );
}
