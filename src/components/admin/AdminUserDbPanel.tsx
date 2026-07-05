import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  dbUserExportUrl,
  fetchDbStatus,
  fetchDbUserDetail,
  fetchDbUsers,
  type DbStatus,
  type DbUserEvent,
  type DbUserRecord,
} from '../../lib/userDbApi';

interface Props {
  open: boolean;
  adminEmail: string;
  onClose: () => void;
}

function formatWhen(ts: number): string {
  return new Date(ts).toLocaleString('en-US', { hour12: false });
}

export function AdminUserDbPanel({ open, adminEmail, onClose }: Props) {
  const [users, setUsers] = useState<DbUserRecord[]>([]);
  const [status, setStatus] = useState<DbStatus | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [events, setEvents] = useState<DbUserEvent[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    const load = async () => {
      try {
        const [nextUsers, nextStatus] = await Promise.all([
          fetchDbUsers(adminEmail),
          fetchDbStatus(adminEmail),
        ]);
        setUsers(nextUsers);
        setStatus(nextStatus);
        setError('');
      } catch {
        setError('Could not load user database.');
      }
    };
    void load();
    const id = setInterval(() => { void load(); }, 5000);
    return () => clearInterval(id);
  }, [open, adminEmail]);

  useEffect(() => {
    if (!open || !selectedId) {
      setEvents([]);
      return;
    }
    const load = async () => {
      try {
        const detail = await fetchDbUserDetail(adminEmail, selectedId);
        setEvents(detail.events.slice().reverse());
        setError('');
      } catch {
        setError('Could not load user activity.');
      }
    };
    void load();
  }, [open, adminEmail, selectedId]);

  const selected = users.find(u => u.id === selectedId) ?? null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[125] flex items-center justify-center p-3 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-user-db-title"
            className="relative flex h-[min(86vh,760px)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-gold/25 bg-[#0e1018] shadow-[0_24px_80px_rgba(0,0,0,0.75)]"
            initial={{ scale: 0.94, y: 16, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: 8, opacity: 0 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-gold/15 px-4 py-3">
              <div>
                <h2 id="admin-user-db-title" className="font-display text-base font-bold uppercase tracking-wide text-gold">
                  User Database
                </h2>
                <p className="text-[11px] text-white/45">
                  Live database for everyone who registers on {status?.siteUrl ?? 'bloxupgrader.com'}
                </p>
                {status && (
                  <p className={`mt-1 text-[10px] ${status.storage.ok ? 'text-win' : 'text-risk'}`}>
                    {status.storage.ok
                      ? `${status.registeredEmailCount} emails · ${status.backend === 'supabase' ? 'Supabase' : 'Local files'}`
                      : `Database error — ${status.storage.error ?? 'run scripts/supabase-schema.sql in Supabase SQL Editor'}`}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/50 transition hover:border-white/25 hover:text-white"
              >
                Close
              </button>
            </div>

            {error && (
              <p className="mx-4 mt-3 rounded-lg border border-risk/20 bg-risk/10 px-3 py-2 text-center text-[11px] text-risk">
                {error}
              </p>
            )}

            <div className="grid min-h-0 flex-1 grid-cols-1 gap-0 md:grid-cols-[280px_1fr]">
              <div className="min-h-0 overflow-y-auto border-b border-white/10 p-3 md:border-b-0 md:border-r">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/35">
                  {users.length} users
                </p>
                {users.length === 0 ? (
                  <p className="text-[11px] text-white/40">No users yet. They appear on register/login.</p>
                ) : (
                  <ul className="space-y-1.5">
                    {users.map(user => (
                      <li key={user.id}>
                        <button
                          type="button"
                          onClick={() => setSelectedId(user.id)}
                          className={`w-full rounded-lg border px-3 py-2 text-left transition ${
                            selectedId === user.id
                              ? 'border-gold/40 bg-gold/10'
                              : 'border-white/10 bg-[#141820] hover:border-white/20'
                          }`}
                        >
                          <p className="truncate text-[11px] font-semibold text-white">{user.email}</p>
                          <p className="mt-0.5 text-[10px] text-white/40">
                            {user.eventCount} events · last {formatWhen(user.lastSeenAt)}
                          </p>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="flex min-h-0 flex-col p-3">
                {!selected ? (
                  <p className="text-[11px] text-white/40">Select a user to see their activity log.</p>
                ) : (
                  <>
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 bg-[#141820] px-3 py-2">
                      <div>
                        <p className="text-[12px] font-semibold text-white">{selected.email}</p>
                        <p className="text-[10px] text-white/40">
                          ID {selected.id} · created {formatWhen(selected.createdAt)}
                          {selected.nickname ? ` · ${selected.nickname}` : ''}
                        </p>
                      </div>
                      <a
                        href={dbUserExportUrl(adminEmail, selected.id)}
                        download={`${selected.email.replace('@', '_at_')}.txt`}
                        className="rounded-lg border border-gold/30 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-gold transition hover:border-gold hover:bg-gold/10"
                      >
                        Export .txt
                      </a>
                    </div>

                    <div className="min-h-0 flex-1 overflow-y-auto rounded-lg border border-white/10 bg-black/20 p-2 font-mono text-[10px] leading-relaxed text-white/75">
                      {events.length === 0 ? (
                        <p className="text-white/40">No events recorded yet.</p>
                      ) : (
                        events.map(event => (
                          <p key={event.id} className="border-b border-white/5 py-1 last:border-0">
                            {event.line || `[${formatWhen(event.createdAt)}] ${event.action}`}
                          </p>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
