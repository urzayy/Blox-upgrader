import { useCallback, useEffect, useState } from 'react';
import { fetchProfilePhoto } from '../lib/profilePhotoApi';
import { subscribeProfilePhotoUpdated } from '../lib/profilePhotoEvents';

export function useProfilePhoto(userId: string | null | undefined) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!userId) {
      setPhotoUrl(null);
      return;
    }
    setLoading(true);
    try {
      const photo = await fetchProfilePhoto(userId);
      setPhotoUrl(photo?.dataUrl ?? null);
    } catch {
      setPhotoUrl(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => subscribeProfilePhotoUpdated(() => { void refresh(); }), [refresh]);

  return { photoUrl, loading, refresh };
}
