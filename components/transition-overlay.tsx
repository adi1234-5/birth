"use client";

import { useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TransitionOverlayProps {
  active: boolean;
  type: "swipe-to-surprise" | "celebrate-to-final";
  onComplete?: () => void;
}

export default function TransitionOverlay({ active, type, onComplete }: TransitionOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hasCompletedRef = useRef(false);

  // Burst effects (sparkles, hearts, fireworks)
  const spawnBurst = useCallback((burstType: "sparkles" | "hearts" | "fireworks") => {
    const container = containerRef.current;
    if (!container) return;

    const count = burstType === "fireworks" ? 60 : burstType === "sparkles" ? 40 : 25;

    for (let i = 0; i < count; i++) {
      const el = document.createElement("div");

      if (burstType === "sparkles") {
        const size = Math.random() * 6 + 3;
        el.style.cssText = `
          position: fixed;
          width: ${size}px;
          height: ${size}px;
          background: ${Math.random() > 0.5 ? "#F472B6" : "#7C3AED"};
          border-radius: 50%;
          box-shadow: 0 0 ${size * 2}px ${size}px ${Math.random() > 0.5 ? "rgba(244,114,182,0.5)" : "rgba(124,58,237,0.5)"};
          pointer-events: none;
          z-index: 60;
          left: 50%;
          top: 50%;
          will-change: transform, opacity;
        `;
      } else if (burstType === "hearts") {
        el.className = "material-symbols-outlined";
        el.innerText = "favorite";
        el.style.cssText = `
          position: fixed;
          font-size: ${Math.random() * 16 + 10}px;
          color: ${Math.random() > 0.3 ? "#F472B6" : "#ff6fb4"};
          pointer-events: none;
          z-index: 60;
          left: ${Math.random() * 100}%;
          bottom: -20px;
          will-change: transform, opacity;
          font-variation-settings: 'FILL' 1;
        `;
      } else {
        // Fireworks
        const colors = ["#F472B6", "#7C3AED", "#66a9f6", "#ffd166", "#ff6fb4", "#a86cff"];
        const size = Math.random() * 8 + 4;
        el.style.cssText = `
          position: fixed;
          width: ${size}px;
          height: ${size * 0.7}px;
          background: ${colors[Math.floor(Math.random() * colors.length)]};
          border-radius: 2px;
          pointer-events: none;
          z-index: 60;
          left: 50%;
          top: 40%;
          will-change: transform, opacity;
        `;
      }

      container.appendChild(el);

      const angle = Math.random() * Math.PI * 2;
      const velocity = burstType === "fireworks" ? (8 + Math.random() * 12) : (3 + Math.random() * 8);
      const vx = Math.cos(angle) * velocity;
      let vy = burstType === "hearts"
        ? -(Math.random() * 3 + 2)
        : Math.sin(angle) * velocity;

      let x = 0, y = 0;
      let opacity = 1;
      const gravity = burstType === "hearts" ? 0 : 0.15;
      const drag = burstType === "hearts" ? 0.99 : 0.98;
      const lifespan = burstType === "hearts" ? 3000 : 2000;
      let life = 0;

      function animate() {
        life += 16;
        x += vx * drag;
        y += vy;
        vy += gravity;
        const progress = life / lifespan;
        opacity = 1 - Math.pow(progress, 2);

        if (burstType === "hearts") {
          // Float upward with gentle sway
          x = Math.sin(life * 0.003) * 30;
        }

        el.style.transform = `translate(${x}px, ${y}px) rotate(${y * 2}deg)`;
        el.style.opacity = `${Math.max(0, opacity)}`;

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          el.remove();
        }
      }
      requestAnimationFrame(animate);
    }
  }, []);

  useEffect(() => {
    if (!active || hasCompletedRef.current) return;

    if (type === "swipe-to-surprise") {
      // Sequence: sparkles → confetti → transition
      spawnBurst("sparkles");
      setTimeout(() => spawnBurst("fireworks"), 400);
      setTimeout(() => {
        hasCompletedRef.current = true;
        onComplete?.();
      }, 1800);
    } else {
      // celebrate-to-final: clean, simple transition — no bursts
      setTimeout(() => {
        hasCompletedRef.current = true;
        onComplete?.();
      }, 300);
    }
  }, [active, type, spawnBurst, onComplete]);

  // Reset when deactivated
  useEffect(() => {
    if (!active) {
      hasCompletedRef.current = false;
    }
  }, [active]);

  return (
    <>
      {/* Burst container */}
      <div
        ref={containerRef}
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 55 }}
      />

      {/* Screen flash effect */}
      <AnimatePresence>
        {active && (
          <motion.div
            className="fixed inset-0 pointer-events-none"
            style={{ zIndex: 50 }}
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 0.25, 0.1, 0],
            }}
            transition={{ duration: 1.2, times: [0, 0.15, 0.4, 1] }}
          >
            <div
              className="absolute inset-0"
              style={{
                background: type === "swipe-to-surprise"
                  ? "radial-gradient(circle at 50% 50%, rgba(244,114,182,0.4), rgba(124,58,237,0.2), transparent)"
                  : "radial-gradient(circle at 50% 60%, rgba(124,58,237,0.4), rgba(244,114,182,0.2), transparent)",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Screen blur vignette */}
      <AnimatePresence>
        {active && (
          <motion.div
            className="fixed inset-0 pointer-events-none"
            style={{ zIndex: 45 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div
              className="absolute inset-0"
              style={{
                background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.3) 100%)",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
