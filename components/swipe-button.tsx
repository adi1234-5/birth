"use client";

import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  AnimatePresence,
  animate,
  PanInfo,
} from "framer-motion";
import { Check, ChevronRight, Lock } from "lucide-react";

interface SwipeButtonProps {
  onSwipeComplete?: () => void;
  label?: string;
  completedLabel?: string;
  isLocked?: boolean;
}

const HANDLE_SIZE = 48;
const HANDLE_MARGIN = 4;
const COMPLETION_THRESHOLD = 0.85;
const LOCKED_MAX_PROGRESS = 0.25;

export default function SwipeButton({
  onSwipeComplete,
  label = "Swipe to open the gift",
  completedLabel = "Gift opened! Enjoy 🎉",
  isLocked = false,
}: SwipeButtonProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [completed, setCompleted] = useState(false);
  const [trackWidth, setTrackWidth] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false);
  const [wasLocked, setWasLocked] = useState(isLocked);
  const [justUnlocked, setJustUnlocked] = useState(false);
  const tooltipTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const x = useMotionValue(0);

  const maxDrag = Math.max(trackWidth - HANDLE_SIZE - HANDLE_MARGIN * 2, 0);
  const lockedMaxDrag = maxDrag * LOCKED_MAX_PROGRESS;

  // Background fill opacity tracks drag progress
  const fillOpacity = useTransform(x, [0, maxDrag], [0, 0.28]);
  const textOpacity = useTransform(x, [0, maxDrag * 0.5], [0.78, 0.35]);

  // Detect unlock transition
  useEffect(() => {
    if (wasLocked && !isLocked) {
      setJustUnlocked(true);

      // Sparkle effect on unlock
      if (trackRef.current) {
        spawnSparkles(trackRef.current);
      }

      const timeout = setTimeout(() => setJustUnlocked(false), 1200);
      return () => clearTimeout(timeout);
    }
    setWasLocked(isLocked);
  }, [isLocked, wasLocked]);

  const measureTrack = useCallback(() => {
    if (trackRef.current) {
      setTrackWidth(trackRef.current.offsetWidth);
    }
  }, []);

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (completed) return;

      const progress = x.get() / maxDrag;

      if (isLocked) {
        // Locked: spring back smoothly, show tooltip
        animate(x, 0, { type: "spring", stiffness: 180, damping: 20 });
        setShowTooltip(true);

        if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
        tooltipTimeoutRef.current = setTimeout(() => {
          setShowTooltip(false);
        }, 2000);
      } else if (progress >= COMPLETION_THRESHOLD) {
        // Unlocked: complete the swipe
        setCompleted(true);
        animate(x, maxDrag, { type: "spring", stiffness: 300, damping: 25 });

        // Sparkle effect on completion
        if (trackRef.current) {
          spawnSparkles(trackRef.current);
        }

        // Delay the callback slightly for the success animation to play
        setTimeout(() => {
          onSwipeComplete?.();
        }, 400);
      } else {
        // Unlocked but didn't reach threshold: spring back
        animate(x, 0, { type: "spring", stiffness: 180, damping: 20 });
      }
    },
    [completed, maxDrag, onSwipeComplete, x, isLocked],
  );

  const handleDrag = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const effectiveMax = isLocked ? lockedMaxDrag : maxDrag;
      const newX = Math.max(0, Math.min(info.offset.x, effectiveMax));
      x.set(newX);
    },
    [maxDrag, lockedMaxDrag, x, isLocked],
  );

  // Cleanup tooltip timeout on unmount
  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
    };
  }, []);

  // Determine displayed label
  const displayLabel = isLocked
    ? "⏳ Wait for Your Special Day"
    : "🎂 Swipe to Celebrate";

  return (
    <div className="relative w-full max-w-[420px] px-4 sm:px-0">
      {/* Premium glassmorphism chat bubble */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{
              duration: 0.6,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="pointer-events-none absolute z-50"
            style={{
              bottom: "calc(100% + 16px)",
              left: "50%",
              willChange: "transform, opacity",
              backfaceVisibility: "hidden",
            }}
            onAnimationComplete={() => {
              // Spawn a tiny sparkle near the bubble once it appears
              const el = document.querySelector("[data-chat-bubble]");
              if (el) spawnBubbleSparkle(el as HTMLElement);
            }}
          >
            {/* Centering wrapper — isolated from Framer Motion transforms */}
            <div
              style={{
                transform: "translateX(-50%)",
                width: "max-content",
                maxWidth: "min(300px, 90vw)",
              }}
            >
              <div
                data-chat-bubble
                className="relative overflow-hidden"
                style={{
                  borderRadius: 20,
                  background: "rgba(255, 255, 255, 0.12)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  border: "1px solid rgba(255, 255, 255, 0.18)",
                  boxShadow: [
                    "0 8px 32px rgba(0,0,0,0.25)",
                    "0 0 20px 2px rgba(200,108,244,0.12)",
                    "0 0 0 0.5px rgba(255,255,255,0.08)",
                    "inset 0 1px 0 rgba(255,255,255,0.15)",
                  ].join(", "),
                  padding: "12px 16px",
                }}
              >
                {/* Subtle inner shimmer */}
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "50%",
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 100%)",
                    borderRadius: "20px 20px 0 0",
                    pointerEvents: "none",
                  }}
                />

                <p
                  className="relative text-center text-[13px] font-medium leading-relaxed text-white"
                  style={{ textShadow: "0 1px 3px rgba(0,0,0,0.3)" }}
                >
                  🎁 Your birthday surprise will unlock when the countdown ends.
                </p>
              </div>

              {/* Chat-style tail pointing down */}
              <div
                aria-hidden="true"
                className="absolute left-1/2"
                style={{
                  bottom: -6,
                  transform: "translateX(-50%)",
                  width: 16,
                  height: 8,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: 12,
                    height: 12,
                    margin: "0 auto",
                    background: "rgba(255, 255, 255, 0.12)",
                    border: "1px solid rgba(255, 255, 255, 0.18)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    transform: "rotate(45deg) translateY(-4px)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                  }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        ref={trackRef}
        className="relative flex h-[56px] items-center overflow-hidden"
        style={{
          borderRadius: 9999,
          background:
            "linear-gradient(135deg, #f56cad 0%, #c86cf4 45%, #66a9f6 100%)",
          boxShadow: justUnlocked
            ? "0 8px 32px rgba(129,93,236,0.22), 0 0 30px 8px rgba(200,108,244,0.3), inset 0 1px 0 rgba(255,255,255,0.18)"
            : "0 8px 32px rgba(129,93,236,0.22), inset 0 1px 0 rgba(255,255,255,0.18)",
        }}
        initial={{ opacity: 0, y: 14 }}
        animate={{
          opacity: 1,
          y: 0,
          boxShadow: justUnlocked
            ? [
                "0 8px 32px rgba(129,93,236,0.22), inset 0 1px 0 rgba(255,255,255,0.18)",
                "0 8px 32px rgba(129,93,236,0.22), 0 0 30px 8px rgba(200,108,244,0.35), inset 0 1px 0 rgba(255,255,255,0.18)",
                "0 8px 32px rgba(129,93,236,0.22), inset 0 1px 0 rgba(255,255,255,0.18)",
              ]
            : undefined,
        }}
        transition={
          justUnlocked
            ? { boxShadow: { duration: 1.2, ease: "easeInOut" }, delay: 0, duration: 0.5, ease: "easeOut" }
            : { delay: 1.05, duration: 0.5, ease: "easeOut" }
        }
        onViewportEnter={measureTrack}
      >
        {/* Inner glow overlay */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 120% at 20% 50%, rgba(255,255,255,0.14), transparent 60%)",
          }}
        />

        {/* Fill progress overlay */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            opacity: fillOpacity,
            background:
              "linear-gradient(90deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.08) 100%)",
            borderRadius: 9999,
          }}
        />

        {/* Label */}
        {!completed && (
          <motion.span
            className="pointer-events-none absolute inset-0 flex select-none items-center justify-center text-[13px] font-semibold text-white sm:text-[14px]"
            style={{ opacity: textOpacity, paddingLeft: HANDLE_SIZE + 12 }}
          >
            {displayLabel}
          </motion.span>
        )}

        {/* Completed label */}
        {completed && (
          <motion.span
            className="pointer-events-none absolute inset-0 flex select-none items-center justify-center text-[14px] font-semibold text-white sm:text-[15px]"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 0.95, scale: 1 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            {completedLabel}
          </motion.span>
        )}

        {/* Draggable Handle */}
        <motion.button
          aria-label={
            completed
              ? "Gift opened"
              : isLocked
                ? "Locked until birthday"
                : "Drag to celebrate"
          }
          className="relative z-10 flex cursor-grab items-center justify-center rounded-full active:cursor-grabbing"
          style={{
            width: HANDLE_SIZE,
            height: HANDLE_SIZE,
            marginLeft: HANDLE_MARGIN,
            x,
            background: completed
              ? "linear-gradient(135deg, #f56cad, #c86cf4)"
              : "white",
            boxShadow: completed
              ? "0 4px 16px rgba(200,108,244,0.35)"
              : "0 4px 16px rgba(0,0,0,0.12)",
          }}
          drag={completed ? false : "x"}
          dragConstraints={{
            left: 0,
            right: isLocked ? lockedMaxDrag : maxDrag,
          }}
          dragElastic={0}
          dragMomentum={false}
          dragTransition={{
            bounceStiffness: 180,
            bounceDamping: 20,
          }}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          whileTap={completed ? {} : { scale: 0.95 }}
          onPointerDown={measureTrack}
          disabled={completed}
          animate={
            justUnlocked
              ? { scale: [1, 1.12, 1], transition: { duration: 0.6, ease: "easeInOut" } }
              : {}
          }
        >
          <AnimatePresence mode="wait">
            {completed ? (
              <motion.span
                key="check"
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 340,
                  damping: 18,
                  delay: 0.08,
                }}
              >
                <Check
                  className="h-5 w-5 text-white"
                  strokeWidth={3}
                  aria-hidden="true"
                />
              </motion.span>
            ) : isLocked ? (
              <motion.span
                key="lock"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <Lock
                  className="h-4.5 w-4.5 text-[#8e3ef2]"
                  strokeWidth={2.4}
                  aria-hidden="true"
                />
              </motion.span>
            ) : (
              <motion.span
                key="chevron"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <ChevronRight
                  className="h-5 w-5 text-[#8e3ef2]"
                  strokeWidth={2.8}
                  aria-hidden="true"
                />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </motion.div>
    </div>
  );
}

/** Spawn small sparkle particles around the button track */
function spawnSparkles(container: HTMLElement) {
  const rect = container.getBoundingClientRect();
  const count = 12;
  const colors = ["#f56cad", "#c86cf4", "#66a9f6", "#ffffff"];

  for (let i = 0; i < count; i++) {
    const sparkle = document.createElement("div");
    const size = Math.random() * 5 + 3;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
    const velocity = 2 + Math.random() * 3;

    sparkle.style.cssText = `
      position: fixed;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border-radius: 50%;
      pointer-events: none;
      z-index: 50;
      left: ${rect.left + rect.width / 2}px;
      top: ${rect.top + rect.height / 2}px;
      box-shadow: 0 0 ${size * 2}px ${size}px ${color}40;
      will-change: transform, opacity;
    `;

    document.body.appendChild(sparkle);

    let px = 0;
    let py = 0;
    let opacity = 1;
    const vx = Math.cos(angle) * velocity;
    const vy = Math.sin(angle) * velocity;

    function animate() {
      px += vx;
      py += vy;
      opacity -= 0.025;

      sparkle.style.transform = `translate(${px}px, ${py}px) scale(${Math.max(0, opacity)})`;
      sparkle.style.opacity = `${Math.max(0, opacity)}`;

      if (opacity > 0) {
        requestAnimationFrame(animate);
      } else {
        sparkle.remove();
      }
    }
    requestAnimationFrame(animate);
  }
}

/** Spawn a tiny sparkle near the chat bubble */
function spawnBubbleSparkle(container: HTMLElement) {
  const rect = container.getBoundingClientRect();
  const count = 6;
  const colors = ["rgba(255,255,255,0.8)", "rgba(200,108,244,0.7)", "rgba(102,169,246,0.7)"];

  for (let i = 0; i < count; i++) {
    const sparkle = document.createElement("div");
    const size = Math.random() * 4 + 2;
    const color = colors[Math.floor(Math.random() * colors.length)];

    // Distribute sparkles around the bubble edges
    const edge = Math.random();
    let startX: number, startY: number;
    if (edge < 0.25) {
      startX = rect.left + Math.random() * rect.width;
      startY = rect.top;
    } else if (edge < 0.5) {
      startX = rect.right;
      startY = rect.top + Math.random() * rect.height;
    } else if (edge < 0.75) {
      startX = rect.left + Math.random() * rect.width;
      startY = rect.bottom;
    } else {
      startX = rect.left;
      startY = rect.top + Math.random() * rect.height;
    }

    sparkle.style.cssText = `
      position: fixed;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border-radius: 50%;
      pointer-events: none;
      z-index: 60;
      left: ${startX}px;
      top: ${startY}px;
      box-shadow: 0 0 ${size * 3}px ${size}px ${color};
      will-change: transform, opacity;
    `;

    document.body.appendChild(sparkle);

    const angle = Math.random() * Math.PI * 2;
    const speed = 1 + Math.random() * 2;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    let opacity = 1;

    function animateSparkle() {
      opacity -= 0.03;
      const dx = vx * (1 - opacity) * 20;
      const dy = vy * (1 - opacity) * 20;

      sparkle.style.transform = `translate(${dx}px, ${dy}px) scale(${Math.max(0, opacity)})`;
      sparkle.style.opacity = `${Math.max(0, opacity)}`;

      if (opacity > 0) {
        requestAnimationFrame(animateSparkle);
      } else {
        sparkle.remove();
      }
    }
    requestAnimationFrame(animateSparkle);
  }
}
