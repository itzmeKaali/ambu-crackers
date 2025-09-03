import React, { useEffect, useRef } from 'react';

const FireworksCursor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Firework particle logic
    const particles: any[] = [];
    function createFirework(x: number, y: number) {
      const colors = [
        '#ff5252', '#ffd740', '#69f0ae', '#40c4ff', '#e040fb', '#fff', '#ffab40'
      ];
      for (let i = 0; i < 40; i++) {
        const angle = (Math.PI * 2 * i) / 40;
        const speed = Math.random() * 15+ 9;
        const size = Math.random() * 2 + 2;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          size,
          trail: [],
        });
      }
    }

    function animate() {
      if (!ctx) return;
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'lighter';

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        // Save trail
        p.trail.push({ x: p.x, y: p.y, alpha: p.alpha });
        if (p.trail.length > 10) p.trail.shift();

        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.04 + Math.random() * 0.02; // gravity
        p.vx *= 0.98; // air resistance
        p.vy *= 0.98;
        p.alpha -= 0.012 + Math.random() * 0.008;
        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }
        if (ctx) {
          // Draw trail
          for (let t = 0; t < p.trail.length; t++) {
            const trail = p.trail[t];
            ctx.globalAlpha = trail.alpha * 0.4;
            ctx.beginPath();
            ctx.arc(trail.x, trail.y, p.size * 0.7, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
          }
          // Draw particle
          ctx.globalAlpha = p.alpha;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 12;
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.globalAlpha = 1;
        }
      }
      requestAnimationFrame(animate);
    }
    animate();

    function handleClick(e: MouseEvent) {
      createFirework(e.clientX, e.clientY);
    }
    window.addEventListener('click', handleClick);
    window.addEventListener('resize', () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    });
    return () => {
      window.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  );
};

export default FireworksCursor;
