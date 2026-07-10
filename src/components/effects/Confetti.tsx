import { useEffect, useRef } from 'react';

export function Confetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#B56BFF', '#FFAA00', '#FFFFFF', '#FF6600', '#FFE566'];
    let particles = Array.from({ length: 180 }, () => ({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * 100,
      w: 4 + Math.random() * 6,
      h: 3 + Math.random() * 5,
      c: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 6,
      vy: 2 + Math.random() * 6,
      rot: Math.random() * 360,
      rv: (Math.random() - 0.5) * 14,
    }));

    let raf: number;
    const frame = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.07; p.rot += p.rv;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot * Math.PI / 180);
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      particles = particles.filter(p => p.y < canvas.height + 30);
      if (particles.length) raf = requestAnimationFrame(frame);
    };
    frame();
    return () => cancelAnimationFrame(raf);
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-[120]" />;
}
