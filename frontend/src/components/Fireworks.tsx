import React, { useEffect, useRef } from "react";
import "../index.css";

const FireworksCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", resizeCanvas);

    class Firework {
      x: number;
      y: number;
      sx: number;
      sy: number;
      size: number;
      shouldExplode: boolean;
      r: number;
      g: number;
      b: number;

      constructor() {
        this.x = canvas ? Math.random() * canvas.width : 0;
        this.y = canvas ? canvas.height : 0;
        this.sx = Math.random() * 3 - 1.5;
        this.sy = Math.random() * -3 - 3;
        this.size = Math.random() * 2 + 1;
        this.shouldExplode = false;

        const colorVal = Math.round(0xffffff * Math.random());
        this.r = colorVal >> 16;
        this.g = (colorVal >> 8) & 255;
        this.b = colorVal & 255;
      }

      update() {
        if (!canvas) return;
        if (this.sy >= -2 || this.y <= 100 || this.x <= 0 || this.x >= canvas.width) {
          this.shouldExplode = true;
        } else {
          this.sy += 0.01;
        }
        this.x += this.sx;
        this.y += this.sy;
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = `rgb(${this.r},${this.g},${this.b})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    class Particle {
      x: number;
      y: number;
      sx: number;
      sy: number;
      size: number;
      life: number;
      r: number;
      g: number;
      b: number;

      constructor(x: number, y: number, r: number, g: number, b: number) {
        this.x = x;
        this.y = y;
        this.sx = Math.random() * 3 - 1.5;
        this.sy = Math.random() * 3 - 1.5;
        this.size = Math.random() * 2 + 1;
        this.life = 100;
        this.r = r;
        this.g = g;
        this.b = b;
      }

      update() {
        this.x += this.sx;
        this.y += this.sy;
        this.life -= 1;
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = `rgba(${this.r}, ${this.g}, ${this.b}, ${this.life / 100})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const fireworks: Firework[] = [new Firework()];
    const particles: Particle[] = [];

    const animate = () => {
      ctx.fillStyle = "rgba(255, 255, 255, 0.2)"; // white background
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (Math.random() < 0.05) {
        fireworks.push(new Firework());
      }

      for (let i = fireworks.length - 1; i >= 0; i--) {
        fireworks[i].update();
        fireworks[i].draw();

        if (fireworks[i].shouldExplode) {
          for (let j = 0; j < 50; j++) {
            particles.push(
              new Particle(fireworks[i].x, fireworks[i].y, fireworks[i].r, fireworks[i].g, fireworks[i].b)
            );
          }
          fireworks.splice(i, 1);
        }
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw();

        if (particles[i].life <= 0) {
          particles.splice(i, 1);
        }
      }

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return <canvas id="fireworksCanvas" ref={canvasRef}></canvas>;
};

export default FireworksCanvas;
