import type { ProfileAvatarId } from '../../lib/profileAvatars';

const AVATAR_STYLES: Record<ProfileAvatarId, { circle: string; icon: string }> = {
  1: { circle: '#dce4ef', icon: '#5a6478' },
  2: { circle: '#d8efe4', icon: '#4a6b5c' },
  3: { circle: '#ebe0f5', icon: '#6a5a7d' },
};

interface Props {
  avatarId: ProfileAvatarId;
  size?: number;
  className?: string;
}

export function ProfileAvatar({ avatarId, size = 32, className = '' }: Props) {
  const palette = AVATAR_STYLES[avatarId];

  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      aria-hidden="true"
      className={`shrink-0 rounded-full ${className}`}
    >
      <circle cx="24" cy="24" r="24" fill={palette.circle} />
      <circle cx="24" cy="18" r="7" fill="none" stroke={palette.icon} strokeWidth="2.5" />
      <path
        d="M11 38c2.8-7.2 8.4-11 13-11s10.2 3.8 13 11"
        fill="none"
        stroke={palette.icon}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
