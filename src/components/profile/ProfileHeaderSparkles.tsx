import { useMemo } from 'react';

interface Sparkle {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  opacity: number;
  drift: number;
  star: boolean;
}

function buildSparkles(count: number): Sparkle[] {
  return Array.from({ length: count }, (_, id) => ({
    id,
    left: ((id * 37 + 11) % 97) + 1.5,
    delay: (id * 0.55) % 14,
    duration: 9 + (id % 6) * 1.8,
    size: id % 4 === 0 ? 3 : id % 3 === 0 ? 2.5 : 2,
    opacity: 0.12 + (id % 5) * 0.08,
    drift: ((id % 7) - 3) * 4,
    star: id % 5 === 0,
  }));
}

export function ProfileHeaderSparkles() {
  const sparkles = useMemo(() => buildSparkles(32), []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {sparkles.map(s => (
        <span
          key={s.id}
          className={`profile-sparkle absolute bottom-[-8%] ${s.star ? 'profile-sparkle-star' : 'rounded-full bg-white'}`}
          style={{
            left: `${s.left}%`,
            width: s.star ? undefined : s.size,
            height: s.star ? undefined : s.size,
            opacity: s.opacity,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
            ['--sparkle-drift' as string]: `${s.drift}px`,
            ['--sparkle-opacity' as string]: String(s.opacity),
          }}
        />
      ))}
    </div>
  );
}
