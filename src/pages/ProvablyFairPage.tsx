import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import { navigateApp } from '../lib/appRoute';
import {
  formatFairRoll,
  generateFairSeed,
  getFairPublicSnapshot,
  revealAndRotateServerSeed,
  updateClientSeed,
  verifyFairRollProof,
  type FairRollProof,
  type FairSeedHistoryEntry,
} from '../lib/provablyFair';
import { consumePendingFairVerifyProof, serializeFairProof } from '../lib/fairVerifyNavigation';

type Tab = 'configuration' | 'verify';

function Field({
  label,
  value,
  masked,
  action,
}: {
  label: string;
  value: string;
  masked?: boolean;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#12101c] p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-white/45">{label}</p>
        {action}
      </div>
      <p className={`mt-2 break-all font-mono text-xs ${masked ? 'text-white/35' : 'text-white/80'}`}>
        {value}
      </p>
    </div>
  );
}

export function ProvablyFairPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('configuration');
  const [clientSeedInput, setClientSeedInput] = useState('');
  const [clientSeed, setClientSeed] = useState('');
  const [publicHash, setPublicHash] = useState('');
  const [nonce, setNonce] = useState(0);
  const [seedHistory, setSeedHistory] = useState<FairSeedHistoryEntry[]>([]);
  const [clientSeedHistory, setClientSeedHistory] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [revealedSeed, setRevealedSeed] = useState<FairSeedHistoryEntry | null>(null);

  const [verifyJson, setVerifyJson] = useState('');
  const [verifyResult, setVerifyResult] = useState<{
    valid: boolean;
    message: string;
    proof?: FairRollProof;
  } | null>(null);

  const refreshSnapshot = useCallback(async () => {
    if (!user) return;
    const snapshot = await getFairPublicSnapshot(user.userId);
    setClientSeed(snapshot.clientSeed);
    setClientSeedInput(snapshot.clientSeed);
    setPublicHash(snapshot.publicHash);
    setNonce(snapshot.nonce);
    setSeedHistory(snapshot.seedHistory);
    setClientSeedHistory(snapshot.clientSeedHistory);
  }, [user]);

  useEffect(() => {
    void refreshSnapshot();
  }, [refreshSnapshot]);

  useEffect(() => {
    const pending = consumePendingFairVerifyProof();
    if (!pending) return;

    const json = serializeFairProof(pending);
    setTab('verify');
    setVerifyJson(json);
    setMessage(null);

    void verifyFairRollProof(pending).then(result => {
      setVerifyResult({
        valid: result.valid,
        message: result.message,
        proof: pending,
      });
    });
  }, []);

  const handleUpdateClientSeed = async () => {
    if (!user) return;
    const error = await updateClientSeed(user.userId, clientSeedInput);
    if (error) {
      setMessage(error);
      return;
    }
    setMessage('Client seed updated.');
    await refreshSnapshot();
  };

  const handleRevealServerSeed = async () => {
    if (!user) return;
    const revealed = await revealAndRotateServerSeed(user.userId);
    setRevealedSeed(revealed);
    setMessage('Previous server seed revealed. A new seed pair is now active.');
    await refreshSnapshot();
  };

  const handleVerify = async () => {
    try {
      const parsed = JSON.parse(verifyJson) as FairRollProof;
      const result = await verifyFairRollProof(parsed);
      setVerifyResult({
        valid: result.valid,
        message: result.message,
        proof: parsed,
      });
    } catch {
      setVerifyResult({
        valid: false,
        message: 'Invalid JSON. Paste a full roll proof object.',
      });
    }
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 text-center">
        <h1 className="font-display text-2xl font-black uppercase text-white">Provably Fair</h1>
        <p className="mt-3 text-sm text-white/55">Sign in to manage your seeds and verify drops.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 pb-12 sm:px-6 lg:py-10">
      <button
        type="button"
        onClick={() => navigateApp('main')}
        className="mb-6 inline-flex items-center gap-2 font-display text-xs font-bold uppercase tracking-[0.12em] text-white/40 transition hover:text-white/70"
      >
        ← Back
      </button>

      <header className="mb-6 text-center">
        <h1 className="font-display text-2xl font-black uppercase tracking-[0.08em] text-white sm:text-3xl">
          Provably Fair
        </h1>
        <div className="mt-5 inline-flex rounded-xl border border-white/10 bg-[#12101c] p-1">
          {(['configuration', 'verify'] as const).map(item => (
            <button
              key={item}
              type="button"
              onClick={() => setTab(item)}
              className={`rounded-lg px-5 py-2 font-display text-xs font-bold uppercase tracking-[0.1em] transition ${
                tab === item ? 'bg-win/15 text-win' : 'text-white/45 hover:text-white/70'
              }`}
            >
              {item === 'configuration' ? 'Configuration' : 'Verify drop'}
            </button>
          ))}
        </div>
      </header>

      {message && (
        <div className="mb-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
          {message}
        </div>
      )}

      {tab === 'configuration' ? (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-4">
            <h2 className="font-display text-sm font-bold uppercase tracking-wide text-white/70">
              Current Seeds
            </h2>

            <Field
              label="Client seed"
              value={`Your seed: ${clientSeed}`}
              action={(
                <button
                  type="button"
                  onClick={handleUpdateClientSeed}
                  className="rounded-lg border border-win/35 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-win"
                >
                  Update client seed
                </button>
              )}
            />

            <div className="flex gap-2">
              <input
                value={clientSeedInput}
                onChange={e => setClientSeedInput(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#12101c] px-3 py-2 text-sm text-white outline-none focus:border-win/35"
                placeholder="New client seed"
              />
              <button
                type="button"
                onClick={() => setClientSeedInput(generateFairSeed(8))}
                className="shrink-0 rounded-xl border border-white/10 px-3 text-xs text-white/55 hover:text-white"
              >
                Random
              </button>
            </div>

            {clientSeedHistory.length > 0 && (
              <div className="rounded-xl border border-white/10 bg-[#12101c] p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-win">Seed History</p>
                <ul className="mt-2 space-y-1 text-xs text-white/55">
                  {clientSeedHistory.map(seed => (
                    <li key={seed} className="font-mono">{seed}</li>
                  ))}
                </ul>
              </div>
            )}

            <Field label="Server seed" value="************************" masked />
            <Field label="Secret Salt" value="****************" masked />
            <Field label="Public Hash" value={publicHash} />
            <Field label="Nonce" value={String(nonce)} />

            <button
              type="button"
              onClick={handleRevealServerSeed}
              className="rounded-xl border border-win/35 px-4 py-2.5 font-display text-xs font-black uppercase tracking-[0.1em] text-win"
            >
              Show server seed
            </button>

            {revealedSeed && (
              <div className="rounded-xl border border-win/25 bg-win/10 p-4 text-sm text-white/75">
                <p className="font-display text-xs font-bold uppercase tracking-wide text-win">Revealed server seed</p>
                <p className="mt-2 break-all font-mono text-[11px]">{revealedSeed.serverSeed}</p>
                <p className="mt-2 break-all font-mono text-[11px] text-white/55">Salt: {revealedSeed.secretSalt}</p>
              </div>
            )}

            {seedHistory.length > 0 && (
              <div className="rounded-xl border border-white/10 bg-[#12101c] p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-white/45">Server seed history</p>
                <ul className="mt-2 space-y-2 text-[10px] text-white/55">
                  {seedHistory.map(entry => (
                    <li key={`${entry.serverSeed}-${entry.revealedAt}`} className="break-all font-mono">
                      {entry.serverSeed.slice(0, 12)}… @ nonce {entry.nonceAtReveal}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-white/10 bg-[#12101c] p-5">
            <div className="flex items-center gap-2">
              <span className="text-lg" aria-hidden="true">🛡️</span>
              <h2 className="font-display text-base font-bold text-white">Provably Fair Algorithm</h2>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-white/65">
              Our algorithm ensures that case openings, Case Battles, and upgrades are random and cannot be manipulated by the site or the player.
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-white/65">
              <li>The history of all your case odds and prices.</li>
              <li>The history of all seeds.</li>
              <li>Your hits along with those of other users.</li>
              <li>All game results.</li>
            </ul>
            <h3 className="mt-6 font-display text-sm font-bold text-white/85">
              How does the Provably Fair algorithm work?
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-white/65">
              Before each roll, a public hash is generated from the hidden server seed and secret salt.
              After you rotate the server seed, the previous seed is revealed so you can verify every past roll
              using the <button type="button" onClick={() => setTab('verify')} className="text-win underline">Verify drop</button> tab.
            </p>
          </section>
        </div>
      ) : (
        <section className="mx-auto max-w-3xl space-y-4">
          <h2 className="font-display text-sm font-bold uppercase tracking-wide text-white/70">
            Verify drop
          </h2>
          <p className="text-sm text-white/55">
            Paste a roll proof JSON from any drop to confirm it matches the committed server seed hash and roll values.
          </p>
          <textarea
            value={verifyJson}
            onChange={e => setVerifyJson(e.target.value)}
            rows={12}
            className="w-full rounded-xl border border-white/10 bg-[#12101c] px-4 py-3 font-mono text-xs text-white/80 outline-none focus:border-win/35"
            placeholder='{"clientSeed":"...","serverSeed":"...","nonce":0,...}'
          />
          <button
            type="button"
            onClick={handleVerify}
            className="rounded-xl bg-gradient-to-r from-win/80 to-emerald-400/80 px-5 py-2.5 font-display text-xs font-black uppercase tracking-[0.1em] text-black"
          >
            Verify drop
          </button>

          {verifyResult && (
            <div className={`rounded-xl border px-4 py-4 ${verifyResult.valid ? 'border-win/30 bg-win/10 text-win' : 'border-loss/30 bg-loss/10 text-loss'}`}>
              <p className="font-display text-sm font-bold uppercase">{verifyResult.message}</p>
              {verifyResult.proof && (
                <p className="mt-2 text-sm text-white/70">
                  Roll: {formatFairRoll(verifyResult.proof.roll)} · Nonce: {verifyResult.proof.nonce}
                </p>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
