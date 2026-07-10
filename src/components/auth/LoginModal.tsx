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
      setError(result.error ?? 'No se pudo iniciar sesión.');
      if (isNewEmail(email)) setShowSignupChecks(true);
    }
  };

  return (
    <AnimatePresence>
      {loginOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            aria-label="Cerrar"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={closeLogin}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="login-title"
            className="relative w-full max-w-md rounded-2xl border border-gold/20 bg-panel p-6 shadow-[0_24px_80px_rgba(0,0,0,0.6)]"
            initial={{ scale: 0.92, y: 16, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          >
            <button
              type="button"
              onClick={closeLogin}
              className="absolute right-4 top-4 text-white/30 transition hover:text-white/70"
              aria-label="Cerrar"
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
              Login
            </h2>
            <p className="mt-1 text-sm text-white/45">
              Accede a BloxUpgrader.com con tu correo y contraseña. Si no tienes cuenta, se creará automáticamente.
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-white/50">
                  Correo electrónico
                </span>
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="input-filter w-full text-sm"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-white/50">
                  Contraseña
                </span>
                <input
                  type="password"
                  autoComplete={showSignupChecks ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="input-filter w-full text-sm"
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
                      Nueva cuenta — confirma antes de registrarte:
                    </p>

                    <Checkbox
                      id="accept-age"
                      checked={acceptedAge}
                      onChange={setAcceptedAge}
                      label="I accept I am 18 year old +"
                    />
                    <Checkbox
                      id="accept-terms"
                      checked={acceptedTerms}
                      onChange={setAcceptedTerms}
                      label="I accept terms and services"
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
                className="w-full rounded-xl bg-gold py-3 font-display text-sm font-black uppercase tracking-wide text-black shadow-[0_4px_24px_rgba(255,204,0,0.35)] transition hover:brightness-110 disabled:opacity-50"
              >
                {loading ? 'Entrando...' : showSignupChecks ? 'Crear cuenta y entrar' : 'Entrar'}
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
