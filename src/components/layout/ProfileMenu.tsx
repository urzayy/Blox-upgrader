import { useAuth } from '../../context/AuthContext';
import { DEV_CLEAN_HEADER_LAYOUT } from '../../lib/devCleanHeaderLayout';
import { cleanHeaderChip } from '../../lib/cleanHeaderClasses';
import { navigateApp } from '../../lib/appRoute';
import { useAppRoute } from '../../hooks/useAppRoute';
import { useProfilePhoto } from '../../hooks/useProfilePhoto';
import { resolveAvatarId } from '../../lib/profileAvatars';
import { ProfilePhotoImage } from '../ui/ProfilePhotoImage';

export function ProfileMenu() {
  const { user } = useAuth();
  const route = useAppRoute();
  const { photoUrl } = useProfilePhoto(user?.userId);

  if (!user) return null;

  const avatarId = resolveAvatarId(user.avatarId, user.email);
  const displayName = user.nickname?.trim() || user.email.split('@')[0];
  const active = route === 'profile';
  const photoSize = DEV_CLEAN_HEADER_LAYOUT ? 38 : 42;
  const buttonSize = DEV_CLEAN_HEADER_LAYOUT ? 'h-11 w-11' : 'h-12 w-12';

  return (
    <button
      type="button"
      onClick={() => navigateApp('profile')}
      title={`Perfil — ${displayName}`}
      aria-label={`Open profile for ${displayName}`}
      aria-current={active ? 'page' : undefined}
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full border transition ${buttonSize} ${
        DEV_CLEAN_HEADER_LAYOUT
          ? `p-0.5 ${cleanHeaderChip(active)}`
          : active
            ? 'border-white/25 bg-[#1c2130]'
            : 'border-white/10 bg-[#161a24] hover:border-gold/30'
      }`}
    >
      <ProfilePhotoImage
        photoUrl={photoUrl}
        avatarId={avatarId}
        size={photoSize}
        alt={displayName}
      />
    </button>
  );
}
