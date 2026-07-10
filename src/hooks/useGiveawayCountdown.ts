import { useEffect, useState } from 'react';

export interface GiveawayCountdownParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  remainingMs: number;
}

function splitCountdown(remainingMs: number): GiveawayCountdownParts {
  const totalSeconds = Math.max(0, Math.floor(remainingMs / 1000));
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    remainingMs,
  };
}

export function useGiveawayCountdown(endsAt: number | null, active: boolean) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  if (!active || endsAt == null) {
    return splitCountdown(0);
  }

  return splitCountdown(endsAt - now);
}

export function padCountdownUnit(value: number): string {
  return String(value).padStart(2, '0');
}

export function formatGiveawayCountdown(parts: GiveawayCountdownParts): string {
  if (parts.days > 0) {
    return `${padCountdownUnit(parts.days)}:${padCountdownUnit(parts.hours)}:${padCountdownUnit(parts.minutes)}:${padCountdownUnit(parts.seconds)}`;
  }
  return `${padCountdownUnit(parts.hours)}:${padCountdownUnit(parts.minutes)}:${padCountdownUnit(parts.seconds)}`;
}
