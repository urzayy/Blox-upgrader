import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  loadSession,
  loginOrRegister,
  logout as clearSession,
  findAccountByEmail,
  getProfileLabel,
  pushAccountToServer,
  updateNickname as saveNickname,
  isAdmin as checkIsAdmin,
  type Session,
} from '../lib/auth';
import { appendUserLog, initUserLogFile } from '../lib/userActivityLog';
import { fetchAccountBanStatus } from '../lib/accountBanApi';

interface AuthContextValue {
  user: Session | null;
  profileLabel: string;
  isAdmin: boolean;
  loginOpen: boolean;
  openLogin: () => void;
  closeLogin: () => void;
  login: (
    email: string,
    password: string,
    opts: { acceptedAge: boolean; acceptedTerms: boolean },
  ) => Promise<{ ok: boolean; error?: string; isNewAccount?: boolean }>;
  logout: () => void;
  isNewEmail: (email: string) => boolean;
  setNickname: (nickname: string) => { ok: boolean; error?: string };
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const restoredSessionRef = useRef(false);
  const [user, setUser] = useState<Session | null>(() => {
    const session = loadSession();
    if (session) restoredSessionRef.current = true;
    return session;
  });
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    void (async () => {
      const banStatus = await fetchAccountBanStatus(user.email);
      if (banStatus.banned) {
        clearSession();
        setUser(null);
        setLoginOpen(true);
        return;
      }
      await pushAccountToServer(user.userId);
      initUserLogFile({ userId: user.userId, email: user.email });
      if (restoredSessionRef.current) {
        restoredSessionRef.current = false;
        appendUserLog(
          { userId: user.userId, email: user.email },
          'AUTH.session_restore',
          { email: user.email },
        );
      }
    })();
  }, [user]);

  const openLogin = useCallback(() => setLoginOpen(true), []);
  const closeLogin = useCallback(() => setLoginOpen(false), []);

  const login = useCallback(async (
    email: string,
    password: string,
    opts: { acceptedAge: boolean; acceptedTerms: boolean },
  ) => {
    const result = await loginOrRegister(email, password, opts);
    if (result.ok && result.session) {
      initUserLogFile(
        { userId: result.session.userId, email: result.session.email },
        result.isNewAccount,
      );
      appendUserLog(
        { userId: result.session.userId, email: result.session.email },
        result.isNewAccount ? 'AUTH.register' : 'AUTH.login',
        { email: result.session.email },
      );
      setUser(result.session);
      setLoginOpen(false);
    }
    return result;
  }, []);

  const logout = useCallback(() => {
    if (user) {
      appendUserLog({ userId: user.userId, email: user.email }, 'AUTH.logout', { email: user.email });
    }
    clearSession();
    setUser(null);
  }, [user]);

  const isNewEmail = useCallback((email: string) => {
    if (!email.trim()) return false;
    return !findAccountByEmail(email);
  }, []);

  const setNickname = useCallback((nickname: string) => {
    if (!user) return { ok: false, error: 'You are not signed in.' };
    const result = saveNickname(user.userId, nickname);
    if (result.ok && result.session) {
      appendUserLog(
        { userId: result.session.userId, email: result.session.email },
        'PROFILE.nickname',
        { nickname: nickname.trim() || '(empty — shows email)' },
      );
      setUser(result.session);
    }
    return result;
  }, [user]);

  const profileLabel = user ? getProfileLabel(user) : '';
  const isAdmin = checkIsAdmin(user);

  const value = useMemo(() => ({
    user,
    profileLabel,
    isAdmin,
    loginOpen,
    openLogin,
    closeLogin,
    login,
    logout,
    isNewEmail,
    setNickname,
  }), [user, profileLabel, isAdmin, loginOpen, openLogin, closeLogin, login, logout, isNewEmail, setNickname]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
