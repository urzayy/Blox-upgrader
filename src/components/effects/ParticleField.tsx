import { useEffect, useRef } from 'react';

export function ParticleField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = Math.floor(window.innerWidth);
      canvas.height = Math.floor(window.innerHeight);
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    const pts = Array.from({ length: 24 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.2 + 0.4,
      vx: (Math.random() - 0.5) * 0.15,
      vy: -Math.random() * 0.25 - 0.04,
      a: Math.random() * 0.2 + 0.04,
    }));

    let raf = 0;
    let running = true;

    const draw = () => {
      if (!running) return;

      if (!document.hidden) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (const p of pts) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.y < 0) {
            p.y = canvas.height;
            p.x = Math.random() * canvas.width;
          }
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(176,108,255,${p.a})`;
          ctx.fill();
        }
      }

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 opacity-40"
    />
  );
}
