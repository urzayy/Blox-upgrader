import { useCallback, useEffect, useRef, useState } from 'react';
import {
  fetchAdminInbox,
  getAdminInboxAttentionCount,
  getTicketType,
  type AdminInboxItem,
  type SupportTicketType,
} from './withdrawChat';
import { getAdminLastReadMap } from './adminChatRead';

export type AdminChatToastKind = 'new_chat' | 'new_message';

export interface AdminChatToast {
  id: string;
  ticketId: string;
  kind: AdminChatToastKind;
  ticketType: SupportTicketType;
  userLabel: string;
  userEmail: string;
  preview: string;
  createdAt: number;
}

interface TicketSnapshot {
  updatedAt: number;
  lastUserMessageAt: number;
}

interface Options {
  enabled: boolean;
  activeTicketId: string | null;
  pollMs?: number;
}

function buildNewChatPreview(item: AdminInboxItem): string {
  const skinCount = item.ticket.skins.length;
  const type = getTicketType(item.ticket);
  if (type === 'help') return 'New help chat';
  if (type === 'deposit') {
    return skinCount > 0
      ? `New deposit chat · ${skinCount} skins`
      : 'New deposit chat';
  }
  return skinCount > 0
    ? `New withdrawal chat · ${skinCount} skins`
    : 'New withdrawal chat';
}

export function useAdminChatNotifications({
  enabled,
  activeTicketId,
  pollMs = 2500,
}: Options) {
  const [toasts, setToasts] = useState<AdminChatToast[]>([]);
  const [attentionCount, setAttentionCount] = useState(0);
  const snapshotRef = useRef<Map<string, TicketSnapshot>>(new Map());
  const initializedRef = useRef(false);
  const activeTicketIdRef = useRef(activeTicketId);
  activeTicketIdRef.current = activeTicketId;

  const dismissToast = useCallback((toastId: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== toastId));
  }, []);

  const pushToast = useCallback((toast: AdminChatToast) => {
    setToasts(prev => {
      const withoutDuplicate = prev.filter(
        existing => !(existing.ticketId === toast.ticketId && existing.kind === toast.kind && existing.preview === toast.preview),
      );
      return [...withoutDuplicate, toast].slice(-4);
    });
  }, []);

  useEffect(() => {
    if (!enabled) {
      initializedRef.current = false;
      snapshotRef.current = new Map();
      setAttentionCount(0);
      setToasts([]);
      return;
    }

    let cancelled = false;

    const poll = async () => {
      try {
        const items = await fetchAdminInbox(getAdminLastReadMap());
        if (cancelled) return;

        setAttentionCount(getAdminInboxAttentionCount(items));

        const nextSnapshot = new Map<string, TicketSnapshot>();
        for (const item of items) {
          nextSnapshot.set(item.ticket.id, {
            updatedAt: item.ticket.updatedAt,
            lastUserMessageAt: item.lastUserMessageAt,
          });
        }

        if (!initializedRef.current) {
          snapshotRef.current = nextSnapshot;
          initializedRef.current = true;
          return;
        }

        const previous = snapshotRef.current;
        for (const item of items) {
          const ticketId = item.ticket.id;
          if (ticketId === activeTicketIdRef.current) continue;

          const current = nextSnapshot.get(ticketId);
          const prior = previous.get(ticketId);
          if (!current) continue;

          if (!prior) {
            pushToast({
              id: `toast_${Date.now()}_${ticketId}_new`,
              ticketId,
              kind: 'new_chat',
              ticketType: getTicketType(item.ticket),
              userLabel: item.ticket.userLabel,
              userEmail: item.ticket.userEmail,
              preview: buildNewChatPreview(item),
              createdAt: Date.now(),
            });
            continue;
          }

          if (item.lastUserMessageAt > prior.lastUserMessageAt) {
            pushToast({
              id: `toast_${Date.now()}_${ticketId}_msg`,
              ticketId,
              kind: 'new_message',
              ticketType: getTicketType(item.ticket),
              userLabel: item.ticket.userLabel,
              userEmail: item.ticket.userEmail,
              preview: item.lastUserMessageText?.trim() || 'New message in chat',
              createdAt: Date.now(),
            });
          }
        }

        snapshotRef.current = nextSnapshot;
      } catch {
        if (!cancelled) setAttentionCount(0);
      }
    };

    void poll();
    const id = window.setInterval(() => { void poll(); }, pollMs);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [enabled, pollMs, pushToast]);

  return {
    toasts,
    attentionCount,
    dismissToast,
  };
}
