"use client";

import * as React from "react";
import { useCallback, useRef, useState } from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { Check, ChevronRight } from "lucide-react";

interface SwipeButtonProps {
  onSwipeComplete?: () => void;
  label?: string;
  completedLabel?: string;
}

const HANDLE_SIZE = 48;
const HANDLE_MARGIN = 4;
const COMPLETION_THRESHOLD = 0.85;

export default function SwipeButton({
  onSwipeComplete,
  label = "Swipe to open the gift",
  completedLabel = "Gift opened! Enjoy 🎉",
}: SwipeButtonProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [completed, setCompleted] = useState(false);
  const [trackWidth, setTrackWidth] = useState(0);

  const x = useMotionValue(0);

  const maxDrag = Math.max(trackWidth - HANDLE_SIZE - HANDLE_MARGIN * 2, 0);

  // Background fill opacity tracks drag progress
  const fillOpacity = useTransform(x, [0, maxDrag], [0, 0.28]);
  const textOpacity = useTransform(x, [0, maxDrag * 0.5], [0.78, 0.35]);

  const measureTrack = useCallback(() => {
    if (trackRef.current) {
      setTrackWidth(trackRef.current.offsetWidth);
    }
  }, []);

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (completed) return;

      const progress = x.get() / maxDrag;

      if (progress >= COMPLETION_THRESHOLD) {
        setCompleted(true);
        x.set(maxDrag);
        onSwipeComplete?.();
      } else {
        x.set(0);
      }
    },
    [completed, maxDrag, onSwipeComplete, x],
  );

  const handleDrag = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const newX = Math.max(0, Math.min(info.offset.x, maxDrag));
      x.set(newX);
    },
    [maxDrag, x],
  );

  return (
    <div className="w-full max-w-[420px] px-4 sm:px-0">
      <motion.div
        ref={trackRef}
        className="relative flex h-[56px] items-center overflow-hidden"
        style={{
          borderRadius: 9999,
          background:
            "linear-gradient(135deg, #f56cad 0%, #c86cf4 45%, #66a9f6 100%)",
          boxShadow:
            "0 8px 32px rgba(129,93,236,0.22), inset 0 1px 0 rgba(255,255,255,0.18)",
        }}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.05, duration: 0.5, ease: "easeOut" }}
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
            className="pointer-events-none absolute inset-0 flex select-none items-center justify-center text-[14px] font-semibold text-white sm:text-[15px]"
            style={{ opacity: textOpacity, paddingLeft: HANDLE_SIZE + 12 }}
          >
            {label}
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
          aria-label={completed ? "Gift opened" : "Drag to open gift"}
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
          dragConstraints={{ left: 0, right: maxDrag }}
          dragElastic={0}
          dragMomentum={false}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          whileTap={completed ? {} : { scale: 0.95 }}
          onPointerDown={measureTrack}
          disabled={completed}
        >
          {completed ? (
            <motion.span
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
          ) : (
            <ChevronRight
              className="h-5 w-5 text-[#8e3ef2]"
              strokeWidth={2.8}
              aria-hidden="true"
            />
          )}
        </motion.button>
      </motion.div>
    </div>
  );
}
