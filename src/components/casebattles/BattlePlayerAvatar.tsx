import type { BattlePlayer } from '../../lib/caseBattles';
import { botShortName, resolveBotAvatarUrl } from '../../lib/caseBattleBots';
import { BATTLE_SIDE_META } from '../../lib/battleSides';
import type { ProfileAvatarId } from '../../lib/profileAvatars';
import { ProfilePhotoImage } from '../ui/ProfilePhotoImage';

type AvatarSize = 'sm' | 'lg';

const SIZE_CLASS: Record<AvatarSize, { avatar: string; side: string; bot: string; crown: string; photo: number }> = {
  sm: {
    avatar: 'h-10 w-10 border-2',
    side: 'h-5 w-5 border-2',
    bot: 'px-1 py-0.5 text-[8px]',
    crown: 'text-[10px] -top-2',
    photo: 40,
  },
  lg: {
    avatar: 'h-28 w-28 border-4 sm:h-32 sm:w-32',
    side: 'h-8 w-8 border-[3px] sm:h-9 sm:w-9',
    bot: 'px-1.5 py-0.5 text-[9px]',
    crown: 'text-lg -top-3',
    photo: 128,
  },
};

interface Props {
  player: BattlePlayer;
  size?: AvatarSize;
  showSide?: boolean;
  showHostCrown?: boolean;
  showWinCrown?: boolean;
  winnerGlow?: boolean;
  className?: string;
  profilePhotoUrl?: string | null;
  profileAvatarId?: ProfileAvatarId;
}

export function BattlePlayerAvatar({
  player,
  size = 'sm',
  showSide = true,
  showHostCrown = true,
  showWinCrown = false,
  winnerGlow = false,
  className = '',
  profilePhotoUrl,
  profileAvatarId,
}: Props) {
  const dims = SIZE_CLASS[size];
  const displayName = player.isBot ? botShortName(player.name) : player.name;
  const initial = displayName.slice(0, 1).toUpperCase();
  const sideMeta = player.side ? BATTLE_SIDE_META[player.side] : null;
  const resolvedAvatarId = profileAvatarId ?? player.avatarId;
  const botAvatarUrl = player.isBot ? resolveBotAvatarUrl(player.id, player.avatarUrl) : undefined;
  const resolvedPhotoUrl = profilePhotoUrl ?? player.avatarUrl ?? botAvatarUrl ?? null;
  const showProfileImage = !player.isBot && (resolvedPhotoUrl || resolvedAvatarId);
  const showBotImage = player.isBot && Boolean(botAvatarUrl ?? player.avatarUrl);

  return (
    <div className={`relative shrink-0 ${className}`}>
      {(showWinCrown || (showHostCrown && player.isHost)) && (
        <span
          className={`absolute left-1/2 z-30 -translate-x-1/2 leading-none ${dims.crown}`}
        >
          👑
        </span>
      )}

      {winnerGlow && (
        <div className="pointer-events-none absolute inset-0 scale-125 rounded-full bg-[radial-gradient(circle,rgba(132,204,22,0.28),transparent_68%)]" />
      )}

      <div
        className={`relative flex items-center justify-center overflow-hidden rounded-full font-display font-black text-white ${dims.avatar} ${
          winnerGlow
            ? 'border-lime-400/80 shadow-[0_0_36px_rgba(132,204,22,0.45)]'
            : 'border-[#12101c]'
        } ${size === 'lg' ? 'text-4xl sm:text-5xl' : 'text-sm'}`}
        style={{ backgroundColor: showProfileImage || showBotImage || player.avatarUrl ? '#12101c' : player.color }}
      >
        {showProfileImage && resolvedAvatarId ? (
          <ProfilePhotoImage
            photoUrl={resolvedPhotoUrl}
            avatarId={resolvedAvatarId}
            size={dims.photo}
            fill
            className="h-full w-full"
          />
        ) : showBotImage || player.avatarUrl || botAvatarUrl ? (
          <img src={botAvatarUrl ?? player.avatarUrl ?? ''} alt="" className="h-full w-full object-cover" draggable={false} />
        ) : (
          initial
        )}
      </div>

      {showSide && sideMeta && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 z-20 flex items-center justify-center overflow-hidden rounded-full border-[#12101c] bg-[#12101c] ${dims.side}`}
          title={sideMeta.label}
        >
          <img src={sideMeta.image} alt="" className="h-full w-full object-cover" draggable={false} />
        </span>
      )}

      {player.isBot && (
        <span
          className={`absolute -bottom-1 -left-1 z-20 rounded font-display font-black uppercase text-white ${dims.bot}`}
          style={{ backgroundColor: player.botBadgeColor ?? '#2563eb' }}
        >
          Bot
        </span>
      )}
    </div>
  );
}
