import type { BattleMode, BattlePlayer } from '../../lib/caseBattles';
import { resolveBotAvatarUrl } from '../../lib/caseBattleBots';
import type { ProfileAvatarId } from '../../lib/profileAvatars';
import { ProfilePhotoImage } from '../ui/ProfilePhotoImage';

interface Props {
  players: BattlePlayer[];
  maxPlayers: number;
  mode: BattleMode;
}

function PlayerAvatar({ player }: { player: BattlePlayer }) {
  const initial = player.name.slice(0, 1).toUpperCase();
  const avatarId = player.avatarId ?? (1 as ProfileAvatarId);
  const botAvatarUrl = player.isBot ? resolveBotAvatarUrl(player.id, player.avatarUrl) : undefined;
  const imageUrl = botAvatarUrl ?? player.avatarUrl;

  return (
    <div className="relative">
      {player.isHost && (
        <span
          className="absolute -top-2 left-1/2 z-10 -translate-x-1/2 text-[10px] leading-none"
          aria-label="Host"
          title="Host"
        >
          👑
        </span>
      )}
      <div
        className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border-2 border-[#12101c] bg-[#252a38] font-display text-xs font-black text-white shadow-[0_4px_12px_rgba(0,0,0,0.35)]"
        style={{ backgroundColor: imageUrl || player.avatarId ? '#12101c' : player.color }}
        title={player.name}
      >
        {!player.isBot && player.avatarId ? (
          <ProfilePhotoImage
            photoUrl={player.avatarUrl ?? null}
            avatarId={avatarId}
            size={36}
            fill
            className="h-full w-full"
          />
        ) : imageUrl ? (
          <img src={imageUrl} alt="" className="h-full w-full object-cover" draggable={false} />
        ) : (
          initial
        )}
      </div>
    </div>
  );
}

export function BattlePlayersCell({ players, maxPlayers, mode }: Props) {
  const ringClass =
    mode === 'underdog'
      ? 'ring-violet-400/45'
      : mode === 'share'
        ? 'ring-sky-400/45'
        : mode === 'jackpot'
          ? 'ring-amber-400/45'
          : mode === 'crazy-jackpot'
            ? 'ring-red-400/45'
            : 'ring-lime-400/45';

  const hasTeams = players.some(player => player.team != null);
  const teamOne = players.filter(player => player.team === 1);
  const teamTwo = players.filter(player => player.team === 2);
  const soloPlayers = hasTeams ? [] : players;

  return (
    <div className="flex flex-col items-start gap-2">
      <span className="font-display text-sm font-black tabular-nums text-white/80">
        {players.length} / {maxPlayers}
      </span>

      {hasTeams ? (
        <div className="flex flex-wrap items-center gap-3">
          {[teamOne, teamTwo].map((team, teamIndex) => (
            <div
              key={teamIndex}
              className={`flex items-center -space-x-2 rounded-full px-1 py-1 ring-1 ${ringClass}`}
            >
              {team.map(player => (
                <PlayerAvatar key={player.id} player={player} />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center -space-x-2">
          {soloPlayers.map(player => (
            <PlayerAvatar key={player.id} player={player} />
          ))}
        </div>
      )}
    </div>
  );
}
