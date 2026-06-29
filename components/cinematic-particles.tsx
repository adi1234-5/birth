"use client";

import { useEffect, useRef, useCallback } from "react";

interface Particle {
  el: HTMLElement;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  type: "dot" | "star" | "heart";
}

interface CinematicParticlesProps {
  intensity?: number; // 1 = normal, 2 = high (during transitions)
}

export default function CinematicParticles({ intensity = 1 }: CinematicParticlesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const frameRef = useRef<number>(0);
  const intensityRef = useRef(intensity);

  useEffect(() => {
    intensityRef.current = intensity;
  }, [intensity]);

  const createParticle = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const type = Math.random() > 0.6 ? (Math.random() > 0.5 ? "star" : "heart") : "dot";
    const el = document.createElement("div");

    if (type === "dot") {
      const size = Math.random() * 4 + 2;
      el.style.cssText = `
        position: fixed;
        width: ${size}px;
        height: ${size}px;
        background: white;
        border-radius: 50%;
        box-shadow: 0 0 ${size * 3}px ${size}px rgba(255,255,255,0.3);
        pointer-events: none;
        z-index: 5;
        will-change: transform, opacity;
      `;
    } else {
      el.className = "material-symbols-outlined";
      el.innerText = type === "star" ? "star" : "favorite";
      const color = Math.random() > 0.5 ? "#F472B6" : "#7C3AED";
      const fontSize = Math.random() * 14 + 8;
      el.style.cssText = `
        position: fixed;
        font-size: ${fontSize}px;
        color: ${color};
        pointer-events: none;
        z-index: 5;
        will-change: transform, opacity;
        font-variation-settings: 'FILL' 1;
      `;
    }

    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight;
    const maxLife = Math.random() * 4000 + 3000;

    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.opacity = "0";

    container.appendChild(el);

    const particle: Particle = {
      el,
      x,
      y,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -Math.random() * 0.5 - 0.1,
      life: 0,
      maxLife,
      size: type === "dot" ? Math.random() * 4 + 2 : Math.random() * 14 + 8,
      type,
    };

    particlesRef.current.push(particle);
  }, []);

  useEffect(() => {
    // Seed initial particles
    for (let i = 0; i < 20; i++) {
      createParticle();
    }

    let lastSpawn = performance.now();
    const spawnInterval = () => 1000 / (intensityRef.current * 2);

    function tick() {
      const now = performance.now();

      // Spawn new particles
      if (now - lastSpawn > spawnInterval()) {
        createParticle();
        lastSpawn = now;
      }

      // Update existing
      particlesRef.current = particlesRef.current.filter((p) => {
        p.life += 16;
        const progress = p.life / p.maxLife;

        if (progress >= 1) {
          p.el.remove();
          return false;
        }

        p.x += p.vx;
        p.y += p.vy;

        // Fade in/out curve
        let opacity: number;
        if (progress < 0.15) {
          opacity = progress / 0.15;
        } else if (progress > 0.7) {
          opacity = (1 - progress) / 0.3;
        } else {
          opacity = 1;
        }
        opacity *= (p.type === "dot" ? 0.4 : 0.25);

        // Gentle twinkle
        const twinkle = Math.sin(p.life * 0.003) * 0.15 + 0.85;
        opacity *= twinkle;

        p.el.style.transform = `translate(${p.vx * p.life * 0.05}px, ${p.vy * p.life * 0.05}px) scale(${0.8 + Math.sin(p.life * 0.002) * 0.2})`;
        p.el.style.opacity = `${Math.max(0, opacity)}`;

        return true;
      });

      frameRef.current = requestAnimationFrame(tick);
    }

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameRef.current);
      particlesRef.current.forEach((p) => p.el.remove());
      particlesRef.current = [];
    };
  }, [createParticle]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 5 }}
    />
  );
}
