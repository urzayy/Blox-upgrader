import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sortSkinsByPriceDesc, type Skin } from '../../data/skins';
import { inventoryTotal } from '../../lib/inventory';
import { fetchPlayerStateByEmail, syncPlayerState, type PlayerStateSnapshot } from '../../lib/playerStateApi';
import { isValidGrantEmail, normalizeGrantEmail } from '../../lib/inventoryGrants';
import { avatarIdFromEmail } from '../../lib/profileAvatars';
import { useProfilePhoto } from '../../hooks/useProfilePhoto';
import { CoinPrice } from '../ui/CoinPrice';
import { SkinImage } from '../skins/SkinImage';
import { ProfilePhotoImage } from '../ui/ProfilePhotoImage';

interface Props {
  open: boolean;
  adminEmail: string;
  initialEmail?: string;
  localSession?: {
    userId: string;
    email: string;
    balance: number;
    inventory: Skin[];
  } | null;
  onClose: () => void;
}

export function AdminSeePanel({ open, adminEmail, initialEmail = '', localSession, onClose }: Props) {
  const [targetEmail, setTargetEmail] = useState('');
  const [state, setState] = useState<PlayerStateSnapshot | null>(null);
  const [searchedEmail, setSearchedEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { photoUrl } = useProfilePhoto(state?.userId);

  const sortedInventory = useMemo(
    () => sortSkinsByPriceDesc(state?.inventory ?? []),
    [state?.inventory],
  );

  const loadPlayer = useCallback(async (rawEmail: string) => {
    const email = normalizeGrantEmail(rawEmail);
    if (!isValidGrantEmail(email)) {
      setError('Enter a valid email address.');
      setState(null);
      setSearchedEmail('');
      return;
    }

    setLoading(true);
    setError('');
    try {
      if (
        localSession
        && normalizeGrantEmail(localSession.email) === email
      ) {
        await syncPlayerState({
          userId: localSession.userId,
          email: localSession.email,
          balance: localSession.balance,
          inventory: localSession.inventory,
        });
      }

      const next = await fetchPlayerStateByEmail(adminEmail, email);
      setSearchedEmail(email);
      if (next) {
        setState(next);
        return;
      }

      if (
        localSession
        && normalizeGrantEmail(localSession.email) === email
      ) {
        setState({
          userId: localSession.userId,
          email: normalizeGrantEmail(localSession.email),
          balance: localSession.balance,
          inventory: localSession.inventory,
          updatedAt: Date.now(),
        });
        setError('Showing inventory from this browser. Not yet synced to server.');
        return;
      }

      setState(null);
      setError("This player hasn't synced yet. They must visit the site at least once.");
    } catch (err) {
      if (
        localSession
        && normalizeGrantEmail(localSession.email) === email
      ) {
        setSearchedEmail(email);
        setState({
          userId: localSession.userId,
          email: normalizeGrantEmail(localSession.email),
          balance: localSession.balance,
          inventory: localSession.inventory,
          updatedAt: Date.now(),
        });
        setError(
          err instanceof Error && err.message.includes('column')
            ? 'Supabase not configured. Showing local inventory from this browser.'
            : 'Server unavailable. Showing local inventory from this browser.',
        );
        return;
      }
      setError(
        err instanceof Error
          ? (err.message.includes('column') || err.message.includes('schema cache')
            ? 'Inventory SQL must be run in Supabase. Until then, you will only see players who have visited recently.'
            : err.message)
          : 'Could not load player state.',
      );
      setState(null);
      setSearchedEmail('');
    } finally {
      setLoading(false);
    }
  }, [adminEmail, localSession]);

  useEffect(() => {
    if (!open) {
      setTargetEmail('');
      setState(null);
      setSearchedEmail('');
      setLoading(false);
      setError('');
      return;
    }

    const preset = initialEmail.trim();
    if (preset) {
      setTargetEmail(preset);
      void loadPlayer(preset);
    }
  }, [open, initialEmail, loadPlayer]);

  const displayName = searchedEmail ? searchedEmail.split('@')[0] : '';
  const avatarId = searchedEmail ? avatarIdFromEmail(searchedEmail) : 1;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[125] flex items-end justify-center p-0 sm:items-center sm:p-4"
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
            aria-labelledby="admin-see-title"
            className="relative flex max-h-[min(88vh,680px)] w-full max-w-md flex-col overflow-hidden rounded-t-2xl border border-white/15 bg-[#0c0a14] shadow-[0_24px_80px_rgba(0,0,0,0.75)] sm:rounded-2xl"
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 16, opacity: 0 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
              <div>
                <h2 id="admin-see-title" className="font-display text-sm font-bold uppercase tracking-wide text-white">
                  Player account
                </h2>
                <p className="text-[10px] text-white/40">Read-only view — as if you were in their profile</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/50 transition hover:border-white/25 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="shrink-0 border-b border-white/10 px-4 py-3">
              <div className="flex gap-2">
                <input
                  type="email"
                  value={targetEmail}
                  onChange={e => setTargetEmail(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') void loadPlayer(targetEmail);
                  }}
                  placeholder="player@email.com"
                  className="input-filter min-w-0 flex-1 text-sm"
                />
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => { void loadPlayer(targetEmail); }}
                  className="shrink-0 rounded-lg border border-violet-500/35 bg-violet-500/10 px-3 py-2 font-display text-[10px] font-bold uppercase tracking-wide text-violet-200 transition hover:bg-violet-500/20 disabled:opacity-40"
                >
                  {loading ? '…' : 'View'}
                </button>
              </div>
              {error && (
                <p className="mt-2 rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-[10px] leading-relaxed text-amber-200/90">
                  {error}
                </p>
              )}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-3">
              {state && searchedEmail && (
                <>
                  <section className="mb-3 overflow-hidden rounded-xl border border-white/[0.08] bg-[#141024]/95">
                    <div className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-3">
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full border border-violet-500/30 bg-[#1a1530]">
                        <ProfilePhotoImage
                          photoUrl={photoUrl}
                          avatarId={avatarId}
                          size={56}
                          alt={displayName}
                          fill
                          className="h-full w-full"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-display text-base font-bold text-white">{displayName}</p>
                        <p className="truncate text-[10px] text-white/45">{searchedEmail}</p>
                        <p className="mt-1 text-[9px] uppercase tracking-wide text-violet-300/70">Viewing as player</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-px bg-white/[0.04]">
                      <StatCell label="Balance">
                        <CoinPrice value={state.balance} textClassName="font-display text-xs font-bold text-gold" />
                      </StatCell>
                      <StatCell label="Inventory">
                        <CoinPrice
                          value={inventoryTotal(state.inventory)}
                          textClassName="font-display text-xs font-bold text-gold"
                        />
                      </StatCell>
                      <StatCell label="Skins">
                        <span className="font-display text-xs font-bold text-white">{state.inventory.length}</span>
                      </StatCell>
                    </div>

                    {state.updatedAt > 0 && (
                      <p className="border-t border-white/[0.06] px-4 py-2 text-center text-[9px] text-white/30">
                        Last sync {new Date(state.updatedAt).toLocaleString('en-US', { hour12: false })}
                      </p>
                    )}
                  </section>

                  <section className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#141024]/95">
                    <div className="border-b border-white/[0.06] px-4 py-2.5">
                      <h3 className="font-display text-[11px] font-bold uppercase tracking-wide text-white/70">
                        Inventory · {state.inventory.length} items
                      </h3>
                    </div>

                    {sortedInventory.length === 0 ? (
                      <p className="py-10 text-center text-sm text-white/35">Empty inventory.</p>
                    ) : (
                      <div className="grid grid-cols-[repeat(auto-fill,minmax(88px,1fr))] gap-2 p-3">
                        {sortedInventory.map(skin => (
                          <ReadonlySkinCard key={skin.id} skin={skin} />
                        ))}
                      </div>
                    )}
                  </section>
                </>
              )}

              {!state && !loading && !error && (
                <p className="py-14 text-center text-sm text-white/35">
                  Enter an email to peek at their account.
                </p>
              )}

              {loading && !state && (
                <p className="py-14 text-center text-sm text-white/35">Loading account…</p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function StatCell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="bg-[#100d1a] px-3 py-2.5 text-center">
      <p className="text-[8px] font-bold uppercase tracking-wide text-white/35">{label}</p>
      <div className="mt-1 flex justify-center">{children}</div>
    </div>
  );
}

function ReadonlySkinCard({ skin }: { skin: Skin }) {
  return (
    <div className="relative aspect-[4/5] overflow-hidden rounded-lg border border-white/10 bg-[#141820]">
      <div className="absolute right-1 top-1 z-10 rounded-md border border-white/10 bg-black/60 px-1 py-0.5">
        <CoinPrice value={skin.price} iconClassName="h-2.5 w-2.5" textClassName="text-[8px] font-bold text-gold font-display" />
      </div>
      <div className="absolute inset-x-0 top-1 bottom-10">
        <SkinImage src={skin.image} alt={skin.name} zoom={1.12} />
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/75 to-transparent px-2 pb-2 pt-8">
        <p className="truncate text-[9px] font-semibold text-white">{skin.name}</p>
        <p className="truncate text-[8px] text-white/40">{skin.wear}</p>
      </div>
    </div>
  );
}
