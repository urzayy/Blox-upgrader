import type { ProfileAvatarId } from '../../lib/profileAvatars';
import { ProfileAvatar } from './ProfileAvatar';

interface Props {
  photoUrl: string | null;
  avatarId: ProfileAvatarId;
  size: number;
  alt?: string;
  className?: string;
  fill?: boolean;
}

export function ProfilePhotoImage({
  photoUrl,
  avatarId,
  size,
  alt = '',
  className = '',
  fill = false,
}: Props) {
  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={alt}
        className={`shrink-0 rounded-full object-cover ${className}`}
        style={fill ? undefined : { width: size, height: size }}
      />
    );
  }

  if (fill) {
    return (
      <div className={`flex h-full w-full items-center justify-center ${className}`}>
        <ProfileAvatar avatarId={avatarId} size={size} />
      </div>
    );
  }

  return <ProfileAvatar avatarId={avatarId} size={size} className={className} />;
}
