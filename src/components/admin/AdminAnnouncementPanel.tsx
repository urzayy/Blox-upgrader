import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  clearAnnouncement,
  fetchAdminAnnouncement,
  publishAnnouncement,
  type PlayerAnnouncement,
} from '../../lib/announcementApi';

interface Props {
  open: boolean;
  adminEmail: string;
  onClose: () => void;
}

export function AdminAnnouncementPanel({ open, adminEmail, onClose }: Props) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [active, setActive] = useState<PlayerAnnouncement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!open) {
      setTitle('');
      setMessage('');
      setLoading(false);
      setError('');
      setSuccess('');
      return;
    }

    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const current = await fetchAdminAnnouncement(adminEmail);
        if (!cancelled) setActive(current);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Could not load active announcement.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => { cancelled = true; };
  }, [open, adminEmail]);

  const canPublish = title.trim().length > 0 && message.trim().length > 0 && !loading;

  const handlePublish = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const announcement = await publishAnnouncement(adminEmail, title, message);
      setActive(announcement);
      setTitle('');
      setMessage('');
      setSuccess('Announcement published. All players will see it on entry (until they dismiss it).');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not publish announcement.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await clearAnnouncement(adminEmail);
      setActive(null);
      setSuccess('Announcement deactivated. It will no longer be shown.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not deactivate announcement.');
    } finally {
      setLoading(false);
    }
  };

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
            aria-labelledby="admin-announcement-title"
            className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-sky-400/35 bg-[#0c0a14] shadow-[0_24px_80px_rgba(0,0,0,0.75)]"
            initial={{ scale: 0.94, y: 16, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: 8, opacity: 0 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b border-sky-400/20 bg-sky-500/10 px-4 py-3">
              <div>
                <h2 id="admin-announcement-title" className="font-display text-base font-bold uppercase tracking-wide text-sky-300">
                  Global notice
                </h2>
                <p className="text-[11px] text-white/45">
                  Popup for all players on entry. Shown only once per announcement.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/50 transition hover:border-white/25 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 px-4 py-4">
              {active && (
                <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-white/40">Active now</p>
                  <p className="mt-1 font-display text-sm font-bold text-white">{active.title}</p>
                  <p className="mt-1 line-clamp-3 text-xs text-white/50">{active.message}</p>
                </div>
              )}

              <div>
                <label className="mb-1 block text-[10px] uppercase tracking-wide text-white/40">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  maxLength={120}
                  placeholder="e.g. Scheduled maintenance"
                  className="input-filter w-full text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-[10px] uppercase tracking-wide text-white/40">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  maxLength={2000}
                  rows={5}
                  placeholder="Write the message players will see..."
                  className="input-filter w-full resize-y text-sm"
                />
              </div>

              {error && (
                <p className="rounded-lg border border-risk/30 bg-risk/10 px-3 py-2 text-xs text-risk">
                  {error}
                </p>
              )}
              {success && (
                <p className="rounded-lg border border-win/30 bg-win/10 px-3 py-2 text-xs text-win">
                  {success}
                </p>
              )}

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  disabled={!canPublish}
                  onClick={() => { void handlePublish(); }}
                  className="rounded-lg border border-sky-400/40 bg-sky-500/15 px-4 py-2 text-xs font-bold uppercase tracking-wide text-sky-200 transition hover:bg-sky-500/25 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {loading ? 'Saving...' : 'Publish announcement'}
                </button>
                {active && (
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => { void handleClear(); }}
                    className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white/60 transition hover:border-white/25 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Deactivate
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
