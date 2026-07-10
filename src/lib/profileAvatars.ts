export type ProfileAvatarId = 1 | 2 | 3;

export const PROFILE_AVATAR_IDS: ProfileAvatarId[] = [1, 2, 3];

export function pickRandomAvatarId(): ProfileAvatarId {
  return PROFILE_AVATAR_IDS[Math.floor(Math.random() * PROFILE_AVATAR_IDS.length)]!;
}

/** Stable avatar for accounts created before avatars existed. */
export function avatarIdFromEmail(email: string): ProfileAvatarId {
  let hash = 0;
  const normalized = email.trim().toLowerCase();
  for (let i = 0; i < normalized.length; i += 1) {
    hash = (hash * 31 + normalized.charCodeAt(i)) >>> 0;
  }
  return PROFILE_AVATAR_IDS[hash % PROFILE_AVATAR_IDS.length]!;
}

export function resolveAvatarId(
  avatarId: ProfileAvatarId | undefined,
  email: string,
): ProfileAvatarId {
  if (avatarId === 1 || avatarId === 2 || avatarId === 3) return avatarId;
  return avatarIdFromEmail(email);
}
