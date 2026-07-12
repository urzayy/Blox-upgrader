import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useAuth } from '../context/AuthContext';

import { navigateCaseBattles } from '../lib/appRoute';

import {

  addBotToBattle,

  addHumanPlayerToBattle,

  BATTLE_MODE_META,

  canJoinBattle,

  getBattleSlots,

  getNextOpenBattleSlot,

  isBattleParticipant,

  removePlayerFromBattle,

  type CaseBattle,

} from '../lib/caseBattles';

import {

  battlePlayerFromBot,

  getAvailableBots,

  getBattleBotById,

  pickRandomAvailableBot,

} from '../lib/caseBattleBots';

import {

  getBattleRoundCaseSlug,

  isBattleFinished,

} from '../lib/caseBattleRuntime';

import { removeLiveBattle, updateLiveBattle } from '../lib/caseBattlesStorage';

import { getCatalogCaseBySlug } from '../lib/caseCatalog';

import { getJokerCasePrice } from '../lib/freeCaseLoot';

import { sfx } from '../lib/audio';

import { defaultBotSideForSlot, getBattleSideTotals, getBattleSideWinner } from '../lib/battleSides';

import { resolveBattleOutcomes, getBattleLeadingPlayerIds } from '../lib/caseBattleOutcome';

import { trySettleBattleEconomy, isUserBattleEconomySettled } from '../lib/caseBattleEconomy';

import { buildRoundSessionsFromPending } from '../lib/caseBattleRoundView';

import { requestChargeBattleEntry, requestRefundBattleEntry } from '../lib/uiActions';

import { useLiveCaseBattle } from '../hooks/useLiveCaseBattle';

import { useProfilePhoto } from '../hooks/useProfilePhoto';

import { resolveAvatarId } from '../lib/profileAvatars';

import { BattleArenaGrid } from '../components/casebattles/BattleArenaGrid';

import { BattleBotPickerModal } from '../components/casebattles/BattleBotPickerModal';

import { BattleCaseRoundStrip } from '../components/casebattles/BattleCaseRoundStrip';

import { BattlePlayerColumn } from '../components/casebattles/BattlePlayerColumn';

import type { BattleRoundSession } from '../components/casebattles/BattleRoundOpener';

import { BattleRoundsBadge } from '../components/casebattles/BattleRoundsBadge';

import { CoinPrice } from '../components/ui/CoinPrice';



interface Props {

  battleId: string;

  balance: number;

}



function resolveBattleCasesWithJoker(battle: CaseBattle) {

  return battle.caseSlugs

    .map((slug, index) => {

      const item = getCatalogCaseBySlug(slug);

      if (!item) return null;

      const joker = battle.jokerFlags[index] ?? false;

      const price = joker ? getJokerCasePrice(slug) : item.price;

      return { ...item, battlePrice: price, joker };

    })

    .filter((item): item is NonNullable<typeof item> => Boolean(item));

}



export function CaseBattleDetailPage({ battleId, balance }: Props) {

  const { user } = useAuth();

  const { photoUrl } = useProfilePhoto(user?.userId);

  const battle = useLiveCaseBattle(battleId);

  const [botPickerOpen, setBotPickerOpen] = useState(false);

  const [pickerSlotIndex, setPickerSlotIndex] = useState<number | null>(null);

  const [forcedReveals, setForcedReveals] = useState<Set<string>>(new Set());

  const [now, setNow] = useState(() => Date.now());

  const [joinError, setJoinError] = useState('');

  const battleFinishedSoundRef = useRef<string | null>(null);



  const cases = useMemo(() => (battle ? resolveBattleCasesWithJoker(battle) : []), [battle]);

  const modeMeta = battle ? BATTLE_MODE_META[battle.mode] : BATTLE_MODE_META.classic;

  const isHost = Boolean(user && battle && battle.createdByUserId === user.userId);

  const isParticipant = Boolean(battle && isBattleParticipant(battle, user?.userId));

  const isSpectator = Boolean(battle && user && !isParticipant);

  const canJoinAsSpectator = Boolean(

    isSpectator && battle && battle.status === 'waiting' && canJoinBattle(battle),

  );

  const canCancelBattle = isParticipant && battle?.status === 'waiting';

  const canManageBots = isHost && battle?.status === 'waiting';

  const isOpeningRound = Boolean(battle?.pendingRound);

  const activeRoundSlug = battle ? getBattleRoundCaseSlug(battle) : null;

  const activeRoundCase = activeRoundSlug ? getCatalogCaseBySlug(activeRoundSlug) : null;

  const activeRoundJoker = battle?.jokerFlags[battle.currentRound] ?? false;



  const usedBotIds = useMemo(

    () => battle?.players.filter(player => player.isBot).map(player => player.id) ?? [],

    [battle],

  );

  const availableBots = useMemo(() => getAvailableBots(usedBotIds), [usedBotIds]);



  const slots = useMemo(() => (battle ? getBattleSlots(battle) : []), [battle]);

  const nextOpenSlot = battle ? getNextOpenBattleSlot(battle) : 0;



  useEffect(() => {

    if (!battle?.pendingRound) return;

    const intervalId = window.setInterval(() => setNow(Date.now()), 100);

    return () => window.clearInterval(intervalId);

  }, [battle?.pendingRound?.startedAt, battle?.pendingRound?.roundIndex]);



  useEffect(() => {

    setForcedReveals(new Set());

  }, [battle?.pendingRound?.startedAt, battle?.pendingRound?.roundIndex]);



  const roundSessions = useMemo((): BattleRoundSession[] => {

    if (!battle?.pendingRound) return [];



    return buildRoundSessionsFromPending(battle.pendingRound, now).map(session => ({

      ...session,

      revealed: session.revealed || forcedReveals.has(session.id),

    }));

  }, [battle?.pendingRound, forcedReveals, now]);



  const sideTotals = useMemo(

    () =>

      battle

        ? getBattleSideTotals(battle.players, battle.maxPlayers)

        : { 'counter-terrorist': 0, terrorist: 0 },

    [battle],

  );



  const winningSide = useMemo(() => {
    if (!battle || battle.players.length < 2 || battle.status === 'finished') return null;
    return getBattleSideWinner(sideTotals);
  }, [battle, sideTotals]);



  const leadingPlayerIds = useMemo(() => {

    if (!battle || battle.players.length < 2 || battle.status === 'finished') return new Set<string>();

    if (isOpeningRound) return new Set<string>();

    return getBattleLeadingPlayerIds(battle);

  }, [battle, isOpeningRound]);



  const battleOutcomes = useMemo(() => {

    if (!battle || battle.status !== 'finished') return null;

    return resolveBattleOutcomes(battle);

  }, [battle]);



  const sessionByPlayerId = useMemo(() => {

    const map = new Map<string, BattleRoundSession>();

    roundSessions.forEach(session => map.set(session.playerId, session));

    return map;

  }, [roundSessions]);



  const activeCaseLabel = activeRoundCase

    ? `${activeRoundCase.name}${activeRoundJoker ? ' · Joker' : ''}`

    : '';



  const persistBattle = useCallback(

    (updater: (current: CaseBattle) => CaseBattle | null) => {

      if (!battle) return;

      const nextBattle = updater(battle);

      if (!nextBattle) return;

      const saved = updateLiveBattle(battle.id, () => nextBattle);

      if (!saved) setJoinError('Could not update battle.');

    },

    [battle],

  );



  useEffect(() => {

    if (!battle || !user || !isParticipant) return;



    const selfPlayer = battle.players.find(player => player.id === user.userId && !player.isBot);

    if (!selfPlayer) return;



    const avatarId = resolveAvatarId(user.avatarId, user.email);

    const nextAvatarUrl = photoUrl ?? undefined;

    if (selfPlayer.avatarUrl === nextAvatarUrl && selfPlayer.avatarId === avatarId) return;



    persistBattle(current => ({

      ...current,

      players: current.players.map(player =>

        player.id === user.userId

          ? { ...player, avatarUrl: nextAvatarUrl, avatarId }

          : player,

      ),

    }));

  }, [battle?.id, isParticipant, persistBattle, photoUrl, user]);



  useEffect(() => {

    if (!battle || battle.status !== 'finished') return;

    if (isOpeningRound) return;

    if (battleFinishedSoundRef.current === battle.id) return;



    battleFinishedSoundRef.current = battle.id;

    sfx.battleFinished();

  }, [battle?.id, battle?.status, isOpeningRound]);



  useEffect(() => {
    if (!battle || battle.status !== 'finished' || !user) return;
    if (isUserBattleEconomySettled(battle, user.userId)) return;
    if (isOpeningRound) return;

    trySettleBattleEconomy(battle, user.userId);
  }, [battle, isOpeningRound, user]);



  const handleReveal = (sessionId: string) => {

    setForcedReveals(current => new Set([...current, sessionId]));

  };



  const addBotAtSlot = (slotIndex: number, botId: string) => {

    if (!battle) return;

    const bot = getBattleBotById(botId);

    if (!bot || usedBotIds.includes(bot.id)) return;



    persistBattle(current => {

      if (slotIndex !== getNextOpenBattleSlot(current)) return null;



      const hostSide = current.players.find(player => player.isHost)?.side ?? 'counter-terrorist';

      const side = defaultBotSideForSlot(hostSide, slotIndex, current.maxPlayers);

      const splitIndex = Math.floor(current.maxPlayers / 2);

      const team =

        current.format === '2v2' || current.format === '3v3'

          ? slotIndex < splitIndex

            ? 1

            : 2

          : undefined;



      return addBotToBattle(

        current,

        battlePlayerFromBot(bot, { team, side, slotIndex }),

      );

    });

  };



  const handleAddRandomBot = (slotIndex: number) => {

    const bot = pickRandomAvailableBot(usedBotIds);

    if (!bot) return;

    addBotAtSlot(slotIndex, bot.id);

  };



  const handleSelectBot = (slotIndex: number) => {

    setPickerSlotIndex(slotIndex);

    setBotPickerOpen(true);

  };



  const handleRemovePlayer = (playerId: string) => {

    persistBattle(current => removePlayerFromBattle(current, playerId));

  };



  const handleJoinBattle = () => {

    if (!battle || !user || !canJoinAsSpectator) return;



    setJoinError('');

    if (balance < battle.cost) {

      setJoinError("You don't have enough balance to join.");

      return;

    }



    if (!requestChargeBattleEntry(battle.cost)) {

      setJoinError('Could not charge battle entry.');

      return;

    }



    const avatarId = resolveAvatarId(user.avatarId, user.email);

    const displayName = user.email.split('@')[0] || 'Player';



    persistBattle(current =>

      addHumanPlayerToBattle(current, {

        userId: user.userId,

        name: displayName,

        avatarUrl: photoUrl ?? undefined,

        avatarId,

        slotIndex: nextOpenSlot,

      }),

    );

  };



  const handleCancelBattle = () => {

    if (!battle || !canCancelBattle) return;

    const refundAmount = battle.hostEntryPaid ?? battle.cost;

    if (isHost && refundAmount > 0) {
      requestRefundBattleEntry(refundAmount);
    }

    removeLiveBattle(battle.id);
    navigateCaseBattles();
  };



  if (!battle) {

    return (

      <div className="mx-auto max-w-3xl px-4 py-16 text-center">

        <h1 className="font-display text-xl font-black uppercase tracking-wide text-white">

          Battle not found

        </h1>

        <button

          type="button"

          onClick={() => navigateCaseBattles()}

          className="mt-6 rounded-md border border-white/10 px-4 py-2 font-display text-xs font-black uppercase tracking-[0.12em] text-white/70 transition hover:text-white"

        >

          Back to battles

        </button>

      </div>

    );

  }



  const showLoanBoost = battle.loanMode && battle.loanPercent > 0;

  const roundLabel =

    battle.status === 'finished' || isBattleFinished(battle)

      ? `${cases.length} de ${cases.length}`

      : `${Math.min(battle.currentRound + (isOpeningRound ? 0 : 1), cases.length)} de ${cases.length}`;



  return (

    <div className="relative w-full overflow-hidden px-3 py-5 pb-24 sm:px-4 lg:px-6 xl:px-8">

      <section className={`relative mx-auto ${battle.maxPlayers >= 6 ? 'max-w-[1600px]' : 'max-w-[1400px]'}`}>

        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">

          <button

            type="button"

            onClick={() => navigateCaseBattles()}

            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-[#171a22] text-white/60 transition hover:text-white"

            aria-label="Back"

          >

            ←

          </button>



          <div className="text-center">

            <h1 className="font-display text-lg font-black uppercase tracking-[0.14em] text-white sm:text-xl">

              Case Battle

            </h1>

            {isSpectator && (

              <p className="mt-1 font-display text-[10px] font-bold uppercase tracking-[0.14em] text-white/35">

                Spectator mode

              </p>

            )}

          </div>



          <div className="min-w-[8.5rem] text-right">

            {canCancelBattle ? (

              <button

                type="button"

                onClick={handleCancelBattle}

                className="rounded-lg border border-red-400/35 bg-red-400/10 px-3 py-2 font-display text-[10px] font-black uppercase tracking-[0.12em] text-red-300 transition hover:border-red-400/55 hover:bg-red-400/15 hover:text-red-200"

              >

                Cancel battle

              </button>

            ) : isSpectator ? (

              <div className="inline-flex rounded-lg border border-sky-400/30 bg-sky-400/10 px-3 py-2 font-display text-[10px] font-black uppercase tracking-[0.12em] text-sky-200">

                Watching battle

              </div>

            ) : null}

          </div>

        </div>



        {joinError && (

          <p className="mb-4 rounded-lg border border-red-400/25 bg-red-400/10 px-4 py-2 text-center font-display text-[11px] font-bold uppercase tracking-[0.1em] text-red-300">

            {joinError}

          </p>

        )}



        <div className="mb-5 overflow-hidden rounded-xl border border-white/[0.06] bg-[#171a22]/90">

          <div className="grid gap-4 px-4 py-4 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center sm:px-5">

            <div className="flex items-center gap-3">

              <BattleRoundsBadge roundCount={cases.length} mode={battle.mode} />

              <div>

                <p className="font-display text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">

                  Rondas

                </p>

                <p className="font-display text-sm font-black text-white">{roundLabel}</p>

              </div>

            </div>



            <div className="min-w-0">

              <BattleCaseRoundStrip

                cases={cases}

                currentRound={battle.currentRound}

                status={battle.status}

                mode={battle.mode}

                isOpeningRound={isOpeningRound}

              />

            </div>



            <div className="text-right">

              <p className="font-display text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">

                Battle value

              </p>

              {showLoanBoost && (battle.fullCost ?? battle.cost) !== battle.cost ? (

                <div className="flex flex-wrap items-center justify-end gap-2">

                  <CoinPrice

                    value={battle.fullCost ?? battle.cost}

                    textClassName="font-display text-base font-black text-white/35 line-through"

                    iconClassName="h-3 w-3 opacity-50"

                  />

                  <CoinPrice

                    value={battle.cost}

                    textClassName={`font-display text-xl font-black ${modeMeta.text}`}

                    iconClassName="h-4 w-4"

                  />

                </div>

              ) : (

                <CoinPrice

                  value={battle.cost}

                  textClassName={`font-display text-xl font-black ${modeMeta.text}`}

                  iconClassName="h-4 w-4"

                />

              )}

            </div>

          </div>

        </div>



        <BattleArenaGrid

          format={battle.format}

          maxPlayers={battle.maxPlayers}

          sideTotals={sideTotals}

          winningSide={winningSide}

          centerContent={

            <>

              <span

                className={`rounded-md px-2.5 py-1 font-display text-[10px] font-black uppercase tracking-[0.12em] ${modeMeta.bg} text-[#10140f]`}

              >

                {modeMeta.label}

              </span>

              {battle.status === 'in_progress' && (

                <span className="font-display text-[10px] font-black uppercase tracking-[0.12em] text-lime-300">

                  En curso

                </span>

              )}

              {battle.status === 'waiting' && (

                <span className="font-display text-[10px] font-black uppercase tracking-[0.12em] text-white/45">

                  Waiting for players

                </span>

              )}

              {battle.status === 'finished' && (

                <span className="font-display text-[10px] font-black uppercase tracking-[0.12em] text-white/45">

                  Finalizada

                </span>

              )}

            </>

          }

        >

          {index => {

            const player = slots[index] ?? null;

            const roundSession = player ? sessionByPlayerId.get(player.id) : undefined;

            const isLeadingPlayer = Boolean(player && leadingPlayerIds.has(player.id));

            const canJoinSlot = canJoinAsSpectator && !player && index === nextOpenSlot;



            return (

              <BattlePlayerColumn

                key={player?.id ?? `empty-${index}`}

                player={player}

                slotIndex={index}

                maxPlayers={battle.maxPlayers}

                mode={battle.mode}

                canManage={canManageBots && !player && index === nextOpenSlot}

                canJoin={canJoinSlot}

                joinCost={battle.cost}

                canAffordJoin={balance >= battle.cost}

                onJoinBattle={handleJoinBattle}

                roundSession={roundSession}

                caseSlug={isOpeningRound ? activeRoundSlug ?? undefined : undefined}

                caseLabel={isOpeningRound ? activeCaseLabel : undefined}

                isLeadingPlayer={isLeadingPlayer}

                battleFinished={battle.status === 'finished'}

                finishOutcome={player ? battleOutcomes?.get(player.id) : undefined}

                onRoundReveal={

                  roundSession ? () => handleReveal(roundSession.id) : undefined

                }

                onAddRandomBot={() => handleAddRandomBot(index)}

                onSelectBot={() => handleSelectBot(index)}

                onRemovePlayer={player?.isBot ? () => handleRemovePlayer(player.id) : undefined}

              />

            );

          }}

        </BattleArenaGrid>

      </section>



      <BattleBotPickerModal

        open={botPickerOpen}

        bots={availableBots}

        onClose={() => {

          setBotPickerOpen(false);

          setPickerSlotIndex(null);

        }}

        onSelect={bot => {

          if (pickerSlotIndex == null) return;

          addBotAtSlot(pickerSlotIndex, bot.id);

          setPickerSlotIndex(null);

        }}

      />

    </div>

  );

}


