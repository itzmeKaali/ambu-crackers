import React, { useEffect, useRef } from "react";

const FireworksCursor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const particles: any[] = [];

    // 🎨 Balanced color palette (bright but not heavy on eyes)
    const colors = [
      "#FF5252", "#FFD740", "#69F0AE", "#40C4FF",
      "#E040FB", "#FFAB40", "#FFF176", "#82B1FF"
    ];

    // 🔥 Firework explosion
    function createFirework(x: number, y: number) {
      // Scale particle count based on device width
      const particleCount =
        width < 500 ? 12 : width < 1024 ? 20 : 35;

      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount;
        const speed = Math.random() * 4 + 2; // lower speed for mobile
        const size = Math.random() * 1.5 + 1;

        particles.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1,
          size,
          color: colors[Math.floor(Math.random() * colors.length)],
          trail: [],
        });
      }
    }

    // 🎆 Main animation loop
    function animate() {
      if (!ctx) return;

      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        // Trail (very light for mobile)
        if (width > 768) {
          p.trail.push({ x: p.x, y: p.y, alpha: p.alpha });
          if (p.trail.length > 6) p.trail.shift();
        }

        // Update physics
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.04; // gravity
        p.vx *= 0.985;
        p.vy *= 0.985;
        p.alpha -= 0.02;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        // Draw trail (desktop only)
        if (width > 768) {
          for (let t = 0; t < p.trail.length; t++) {
            const trail = p.trail[t];
            ctx.globalAlpha = trail.alpha * 0.2;
            ctx.beginPath();
            ctx.arc(trail.x, trail.y, p.size * 0.5, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
          }
        }

        // Draw particle
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      requestAnimationFrame(animate);
    }
    animate();

    // ✅ Works on all devices
    function handleFirework(e: MouseEvent | TouchEvent) {
      let x: number, y: number;
      if ("touches" in e && e.touches.length > 0) {
        x = e.touches[0].clientX;
        y = e.touches[0].clientY;
      } else {
        const m = e as MouseEvent;
        x = m.clientX;
        y = m.clientY;
      }
      createFirework(x, y);
    }

    window.addEventListener("click", handleFirework);
    window.addEventListener("touchstart", handleFirework);

    window.addEventListener("resize", () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    });

    return () => {
      window.removeEventListener("click", handleFirework);
      window.removeEventListener("touchstart", handleFirework);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 9999,
      }}
    />
  );
};

export default FireworksCursor;
