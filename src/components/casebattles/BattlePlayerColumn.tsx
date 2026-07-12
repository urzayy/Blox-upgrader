import type { BattleMode, BattlePlayer } from '../../lib/caseBattles';
import { BATTLE_MODE_META } from '../../lib/caseBattles';
import { botShortName } from '../../lib/caseBattleBots';
import type { BattlePlayerOutcome } from '../../lib/caseBattleOutcome';
import { getBattleColumnDensity, getBattleReelSize } from '../../lib/battleArenaDensity';
import { useAuth } from '../../context/AuthContext';
import { useProfilePhoto } from '../../hooks/useProfilePhoto';
import { resolveAvatarId } from '../../lib/profileAvatars';
import { FreeCaseReelOpener } from '../freecases/FreeCaseReelOpener';
import type { BattleRoundSession } from './BattleRoundOpener';
import { BattleFinishPanel } from './BattleFinishPanel';
import { BattleDropGrid } from './BattleDropGrid';
import { BattlePlayerAvatar } from './BattlePlayerAvatar';
import { BattleRarityDiamond, skinRarityAccent } from './BattleRarityDiamond';
import { CoinPrice } from '../ui/CoinPrice';
import { SkinImage } from '../skins/SkinImage';

interface Props {
  player: BattlePlayer | null;
  slotIndex: number;
  maxPlayers: number;
  mode: BattleMode;
  canManage: boolean;
  canJoin?: boolean;
  joinCost?: number;
  canAffordJoin?: boolean;
  onJoinBattle?: () => void;
  roundSession?: BattleRoundSession;
  caseSlug?: string;
  caseLabel?: string;
  isLeadingPlayer?: boolean;
  battleFinished?: boolean;
  finishOutcome?: BattlePlayerOutcome;
  onRoundReveal?: () => void;
  onAddRandomBot: () => void;
  onSelectBot: () => void;
  onRemovePlayer?: () => void;
}

function modeAccentBorder(mode: BattleMode): string {
  return BATTLE_MODE_META[mode].border;
}

function modeAccentText(mode: BattleMode): string {
  return BATTLE_MODE_META[mode].text;
}

export function BattlePlayerColumn({
  player,
  slotIndex,
  maxPlayers,
  mode,
  canManage,
  canJoin = false,
  joinCost = 0,
  canAffordJoin = true,
  onJoinBattle,
  roundSession,
  caseSlug,
  caseLabel,
  isLeadingPlayer = false,
  battleFinished = false,
  finishOutcome,
  onRoundReveal,
  onAddRandomBot,
  onSelectBot,
  onRemovePlayer,
}: Props) {
  const { user } = useAuth();
  const density = getBattleColumnDensity(maxPlayers);
  const reelSize = getBattleReelSize(maxPlayers);
  const isSelf = Boolean(user && player && player.id === user.userId && !player.isBot);
  const { photoUrl: selfPhotoUrl } = useProfilePhoto(isSelf ? user?.userId : null);
  const accentBorder = modeAccentBorder(mode);
  const accentText = modeAccentText(mode);

  if (!player) {
    return (
      <div className={`flex flex-col overflow-hidden rounded-xl border border-dashed border-white/12 bg-[#0f0d18]/80 ${density.emptyMinHeight}`}>
        <div className="flex items-center justify-between px-3 py-2">
          <span className="font-display text-[10px] font-bold uppercase tracking-[0.14em] text-white/25">
            Slot {slotIndex + 1}
          </span>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 pb-6">
          {canJoin ? (
            <div className="flex w-full max-w-[14rem] flex-col items-center gap-3">
              <p className="text-center font-display text-[11px] font-bold uppercase tracking-[0.12em] text-white/45">
                Slot available
              </p>
              <button
                type="button"
                onClick={onJoinBattle}
                disabled={!canAffordJoin}
                className={`w-full rounded-lg border px-4 py-3 font-display text-[11px] font-black uppercase tracking-[0.1em] transition ${
                  canAffordJoin
                    ? `${accentBorder} bg-lime-400/15 ${accentText} hover:bg-lime-400/25`
                    : 'cursor-not-allowed border-white/10 bg-white/[0.03] text-white/30'
                }`}
              >
                Join battle
              </button>
              <CoinPrice
                value={joinCost}
                textClassName={`font-display text-sm font-black ${canAffordJoin ? accentText : 'text-white/35'}`}
                iconClassName="h-3.5 w-3.5"
              />
              {!canAffordJoin && (
                <p className="text-center font-display text-[10px] font-bold uppercase tracking-[0.1em] text-red-300/80">
                  Insufficient balance
                </p>
              )}
            </div>
          ) : (
            <>
              <p className="text-center font-display text-[11px] font-bold uppercase tracking-[0.12em] text-white/35">
                Waiting for player
              </p>

              {canManage && (
                <div className="flex w-full max-w-[12rem] flex-col gap-2">
                  <button
                    type="button"
                    onClick={onAddRandomBot}
                    className={`rounded-lg border px-3 py-2.5 font-display text-[10px] font-black uppercase tracking-[0.1em] transition hover:bg-white/[0.04] ${accentBorder} ${accentText}`}
                  >
                    Random bot
                  </button>
                  <button
                    type="button"
                    onClick={onSelectBot}
                    className="rounded-lg border border-white/10 bg-[#171a22] px-3 py-2.5 font-display text-[10px] font-black uppercase tracking-[0.1em] text-white/70 transition hover:text-white"
                  >
                    Select bot
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  const displayName = player.isBot ? botShortName(player.name) : player.name;
  const showLeadingGlow = isLeadingPlayer && !battleFinished;
  const profilePhotoUrl = isSelf ? selfPhotoUrl : player.avatarUrl ?? null;
  const profileAvatarId = isSelf && user
    ? resolveAvatarId(user.avatarId, user.email)
    : player.avatarId;
  const isRolling = Boolean(roundSession && caseSlug) && !battleFinished;
  const showFinish = battleFinished && finishOutcome;
  const drops = player.drops ?? [];
  const latestDrop = drops.length > 0 ? drops[drops.length - 1] : null;
  const previousDrops = latestDrop ? drops.slice(0, -1) : drops;

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-xl border bg-[#0f0d18]/90 ${density.columnMinHeight} ${
        showLeadingGlow
          ? 'border-lime-400/45 shadow-[0_0_24px_rgba(132,204,22,0.12)]'
          : 'border-white/10'
      }`}
    >
      <div className={`flex items-center justify-between ${maxPlayers >= 6 ? 'px-1.5 py-0.5' : 'px-2 py-1 sm:px-3 sm:py-1.5'}`}>
        {canManage && player.isBot && onRemovePlayer ? (
          <button
            type="button"
            onClick={onRemovePlayer}
            className="font-display text-xs font-black text-red-400/70 transition hover:text-red-300 sm:text-sm"
            aria-label="Remove bot"
          >
            −
          </button>
        ) : (
          <span className="font-display text-xs font-black text-white/10 sm:text-sm">−</span>
        )}
        <span className="font-display text-xs font-black text-white/10 sm:text-sm">−</span>
      </div>

      <div className={`relative flex flex-1 flex-col items-center justify-center px-1 py-0.5 sm:px-2 ${density.stageMinHeight}`}>
        {showFinish ? (
          <BattleFinishPanel
            player={player}
            outcome={finishOutcome}
            profilePhotoUrl={profilePhotoUrl}
            profileAvatarId={profileAvatarId}
            compact={maxPlayers > 2}
            density={density}
          />
        ) : isRolling && roundSession && caseSlug && caseLabel ? (
          <div className="relative flex w-full flex-col items-center">
            {drops.length > 0 && (
              <div className="mb-1 flex max-w-full flex-wrap items-center justify-center gap-1 opacity-45">
                {drops.slice(-4).map((skin, index) => {
                  const accent = skinRarityAccent(skin);
                  return (
                    <div
                      key={`rolling-${skin.id}-${index}`}
                      className={`relative overflow-hidden rounded-md border bg-[#12101c]/70 ${density.dropThumb}`}
                      style={{ borderColor: `${accent.color}30` }}
                    >
                      <SkinImage src={skin.image} alt={skin.name} className="h-full w-full object-contain p-0.5" />
                    </div>
                  );
                })}
              </div>
            )}

            <div className="relative w-full">
              <div className="relative mx-auto w-full max-w-full">
                <FreeCaseReelOpener
                  active
                  caseSlug={caseSlug}
                  result={roundSession.result}
                  grantedSkin={roundSession.grantedSkin}
                  caseLabel={caseLabel}
                  turbo={false}
                  soundOn={slotIndex === 0}
                  royalSoundOn={Boolean(
                    roundSession?.result?.isRoyalSpin && roundSession?.result?.royalReel,
                  )}
                  size={reelSize}
                  orientation="vertical"
                  embedded
                  compact
                  showHeader={false}
                  showRevealActions={false}
                  onReveal={() => onRoundReveal?.()}
                  onSell={() => undefined}
                  onUpgrade={() => undefined}
                />
              </div>
            </div>
          </div>
        ) : latestDrop ? (
          <div className="flex w-full flex-col items-center gap-1.5">
            <div className={`relative flex aspect-square w-full flex-col items-center justify-center ${density.heroMaxWidth}`}>
              <div className="relative flex h-[52%] w-full items-center justify-center">
                <BattleRarityDiamond skin={latestDrop} size="hero" />
                <SkinImage
                  src={latestDrop.image}
                  alt={latestDrop.name}
                  className="relative z-10 h-[88%] w-[92%] object-contain"
                  zoom={0.78}
                />
              </div>
            </div>

            {previousDrops.length > 0 && (
              <div className="flex max-w-full flex-wrap items-center justify-center gap-1">
                {previousDrops.map((skin, index) => {
                  const accent = skinRarityAccent(skin);
                  return (
                    <div
                      key={`${skin.id}-${index}`}
                      className={`relative overflow-hidden rounded-md border bg-[#12101c]/80 opacity-70 ${density.dropPrev}`}
                      style={{ borderColor: `${accent.color}28` }}
                    >
                      <BattleRarityDiamond skin={skin} size="mini" className="opacity-80" />
                      <SkinImage
                        src={skin.image}
                        alt={skin.name}
                        className="relative z-10 h-full w-full object-contain p-0.5"
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className={`relative aspect-square w-full ${density.heroMaxWidth}`}>
            <BattleRarityDiamond size="hero" />
          </div>
        )}
      </div>

      <div
        className={`border-t px-2 sm:px-3 ${density.footerPy} ${
          showLeadingGlow
            ? 'border-lime-400/20 bg-lime-400/[0.04]'
            : 'border-white/10 bg-[#12101c]/80'
        }`}
      >
        <div className="flex items-center gap-1.5 sm:gap-2">
          <BattlePlayerAvatar
            player={player}
            size="sm"
            showSide={maxPlayers < 6}
            profilePhotoUrl={profilePhotoUrl}
            profileAvatarId={profileAvatarId}
          />

          <div className="min-w-0 flex-1">
            <span className={`truncate font-display font-black text-white ${density.nameText}`}>{displayName}</span>
          </div>

          <CoinPrice
            value={player.totalValue ?? 0}
            textClassName={`font-display font-black tabular-nums ${density.valueText} ${showLeadingGlow ? 'text-lime-300' : 'text-white/75'}`}
            iconClassName="h-3 w-3"
          />
        </div>
        {density.showDropGrid && drops.length > 0 ? (
          <BattleDropGrid skins={drops} compact={maxPlayers > 2} />
        ) : drops.length > 0 ? (
          <div className="mt-1.5 flex gap-1 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {drops.map((skin, index) => {
              const accent = skinRarityAccent(skin);
              return (
                <div
                  key={`${skin.id}-${index}`}
                  className={`relative shrink-0 overflow-hidden rounded border bg-[#12101c]/80 ${density.dropThumb}`}
                  style={{ borderColor: `${accent.color}35` }}
                  title={skin.name}
                >
                  <SkinImage src={skin.image} alt={skin.name} className="h-full w-full object-contain p-0.5" />
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
