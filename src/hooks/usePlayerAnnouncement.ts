import { useCallback, useEffect, useState } from 'react';
import { fetchActiveAnnouncement, type PlayerAnnouncement } from '../lib/announcementApi';
import {
  announcementUserKey,
  dismissAnnouncement,
  isAnnouncementDismissed,
} from '../lib/announcementDismissal';

interface UsePlayerAnnouncementOptions {
  userId: string | null | undefined;
  enabled?: boolean;
}

export function usePlayerAnnouncement({ userId, enabled = true }: UsePlayerAnnouncementOptions) {
  const [announcement, setAnnouncement] = useState<PlayerAnnouncement | null>(null);
  const [open, setOpen] = useState(false);

  const syncAnnouncement = useCallback(async () => {
    if (!enabled) return;
    try {
      const active = await fetchActiveAnnouncement();
      if (!active) {
        setAnnouncement(null);
        setOpen(false);
        return;
      }

      const userKey = announcementUserKey(userId);
      if (isAnnouncementDismissed(userKey, active.id)) {
        setAnnouncement(null);
        setOpen(false);
        return;
      }

      setAnnouncement(active);
      setOpen(true);
    } catch {
      // Ignore fetch errors — announcement is non-critical.
    }
  }, [enabled, userId]);

  useEffect(() => {
    void syncAnnouncement();
    if (!enabled) return undefined;
    const id = window.setInterval(() => { void syncAnnouncement(); }, 60_000);
    return () => window.clearInterval(id);
  }, [enabled, syncAnnouncement]);

  const dismiss = useCallback(() => {
    if (!announcement) {
      setOpen(false);
      return;
    }
    dismissAnnouncement(announcementUserKey(userId), announcement.id);
    setOpen(false);
    setAnnouncement(null);
  }, [announcement, userId]);

  return { announcement, open, dismiss };
}
