import { useEffect } from 'react';
import { useDocumentVisible } from './useDocumentVisible';
import { sendPresenceHeartbeat } from '../lib/presenceApi';
import { getPresenceVisitorId } from '../lib/presenceVisitorId';

const HEARTBEAT_MS = 20_000;

/** Production-only heartbeat so the header "online" count reflects real visitors. */
export function usePresenceHeartbeat(userId: string | null | undefined): void {
  const documentVisible = useDocumentVisible();

  useEffect(() => {
    if (import.meta.env.DEV || !documentVisible) return;

    const visitorId = getPresenceVisitorId();
    const ping = () => {
      void sendPresenceHeartbeat({
        userId: userId ?? undefined,
        visitorId,
      });
    };

    ping();
    const id = window.setInterval(ping, HEARTBEAT_MS);
    return () => clearInterval(id);
  }, [userId, documentVisible]);
}
