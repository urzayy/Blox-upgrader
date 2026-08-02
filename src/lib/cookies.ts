const DEFAULT_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

function encode(value: string): string {
  return encodeURIComponent(value);
}

function decode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function setCookie(name: string, value: string, maxAgeSeconds = DEFAULT_MAX_AGE_SECONDS): void {
  if (typeof document === 'undefined') return;
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=${encode(value)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax${secure}`;
}

export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const prefix = `${name}=`;
  const match = document.cookie.split(';').map(part => part.trim()).find(part => part.startsWith(prefix));
  if (!match) return null;
  return decode(match.slice(prefix.length));
}

export function removeCookie(name: string): void {
  if (typeof document === 'undefined') return;
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
}

export const SESSION_COOKIE = 'blox_session';
export const ESSENTIAL_COOKIE_FLAG = 'blox_essential_cookies';

export function setEssentialCookiesEnabled(): void {
  setCookie(ESSENTIAL_COOKIE_FLAG, '1');
}

export function hasEssentialCookiesEnabled(): boolean {
  return getCookie(ESSENTIAL_COOKIE_FLAG) === '1';
}
