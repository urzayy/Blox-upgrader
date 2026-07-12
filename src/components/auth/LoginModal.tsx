import { useEffect, useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

export function LoginModal() {
  const { loginOpen, closeLogin, login, isNewEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptedAge, setAcceptedAge] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSignupChecks, setShowSignupChecks] = useState(false);

  useEffect(() => {
    if (!loginOpen) {
      setEmail('');
      setPassword('');
      setAcceptedAge(false);
      setAcceptedTerms(false);
      setError('');
      setLoading(false);
      setShowSignupChecks(false);
    }
  }, [loginOpen]);

  useEffect(() => {
    if (!email.trim()) {
      setShowSignupChecks(false);
      return;
    }
    setShowSignupChecks(isNewEmail(email));
  }, [email, isNewEmail]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password, { acceptedAge, acceptedTerms });

    setLoading(false);
    if (!result.ok) {
      setError(result.error ?? 'Could not log in.');
      if (isNewEmail(email)) setShowSignupChecks(true);
    }
  };

  return (
    <AnimatePresence>
      {loginOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={closeLogin}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="login-title"
            className="relative max-h-[92dvh] w-full overflow-y-auto rounded-t-2xl border border-gold/20 bg-panel p-6 shadow-[0_24px_80px_rgba(0,0,0,0.6)] sm:max-w-md sm:rounded-2xl"
            initial={{ scale: 0.92, y: 16, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          >
            <button
              type="button"
              onClick={closeLogin}
              className="absolute right-4 top-4 text-white/30 transition hover:text-white/70"
              aria-label="Close"
            >
              ✕
            </button>

            <img
              src="/logo.png"
              alt="BloxUpgrader.com"
              className="mx-auto mb-4 h-16 w-auto object-contain"
              width={64}
              height={54}
            />

            <h2 id="login-title" className="font-display text-xl font-bold tracking-wide text-white">
              Log in
            </h2>
            <p className="mt-1 text-sm text-white/45">
              Sign in to BloxUpgrader.com with your email and password. If you do not have an account, one will be created automatically.
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-white/50">
                  Email
                </span>
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="input-filter w-full text-base sm:text-sm"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-white/50">
                  Password
                </span>
                <input
                  type="password"
                  autoComplete={showSignupChecks ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="input-filter w-full text-base sm:text-sm"
                  required
                  minLength={6}
                />
              </label>

              <AnimatePresence>
                {showSignupChecks && (
                  <motion.div
                    className="space-y-3 rounded-xl border border-gold/15 bg-elevated/60 p-3"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    <p className="text-[11px] font-medium text-gold/90">
                      New account — confirm before signing up:
                    </p>

                    <Checkbox
                      id="accept-age"
                      checked={acceptedAge}
                      onChange={setAcceptedAge}
                      label="I confirm I am 18 years or older"
                    />
                    <Checkbox
                      id="accept-terms"
                      checked={acceptedTerms}
                      onChange={setAcceptedTerms}
                      label="I accept the terms of service"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {error && (
                <p className="rounded-lg border border-risk/30 bg-risk/10 px-3 py-2 text-sm text-risk">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="min-h-[48px] w-full rounded-xl bg-gradient-to-r from-[#9333ea] via-[#b56bff] to-[#a855f7] py-3 font-display text-sm font-black uppercase tracking-wide text-white shadow-[0_4px_24px_rgba(176,108,255,0.35)] transition hover:brightness-110 disabled:opacity-50"
              >
                {loading ? 'Signing in...' : showSignupChecks ? 'Create account & log in' : 'Log in'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Checkbox({
  id,
  checked,
  onChange,
  label,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-3">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/20 bg-deep accent-gold"
      />
      <span className="text-sm leading-snug text-white/75">{label}</span>
    </label>
  );
}
