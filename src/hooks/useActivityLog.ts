import { useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { appendUserLog, type LogUser } from '../lib/userActivityLog';

export function useActivityLog() {
  const { user } = useAuth();

  const logUser: LogUser | null = user
    ? { userId: user.userId, email: user.email }
    : null;

  const log = useCallback((
    action: string,
    details?: Record<string, string | number | boolean | null | undefined>,
  ) => {
    appendUserLog(logUser, action, details);
  }, [logUser]);

  return { log, logUser };
}
