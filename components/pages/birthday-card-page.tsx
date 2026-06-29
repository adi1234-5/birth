"use client";

import * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Cake,
  Calendar,
  Clock,
  Gift,
  PartyPopper,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import SwipeButton from "@/components/swipe-button";
import { Card } from "@/components/ui/card";

interface BirthdayCardPageProps {
  onSwipeComplete?: () => void;
}

interface CountdownValue {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface ConfettiPiece {
  id: number;
  color: string;
  left: number;
  top: number;
  rotate: number;
  size: number;
  duration: number;
}

const targetBirthday = new Date("2026-07-01T00:00:00").getTime();

const confettiColors = [
  "#ff6fb4",
  "#a86cff",
  "#65a9ff",
  "#ffd166",
  "#53d7a3",
  "#ff7a7a",
];

function getCountdown(): CountdownValue {
  const distance = Math.max(targetBirthday - Date.now(), 0);

  return {
    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
    hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((distance % (1000 * 60)) / 1000),
  };
}

function makeConfetti(): ConfettiPiece[] {
  return Array.from({ length: 56 }, (_, id) => ({
    id,
    color: confettiColors[id % confettiColors.length],
    left: Math.random() * 100,
    top: Math.random() * 100,
    rotate: Math.random() * 420 - 30,
    size: Math.random() * 8 + 6,
    duration: Math.random() * 0.8 + 1.7,
  }));
}

export default function BirthdayCardPage({
  onSwipeComplete,
}: BirthdayCardPageProps) {
  const name = "Vaishnavi";
  const age = 18;
  const date = "July 1, 2026";
  const message = "Wishing you a day filled with happiness and a year filled with joy!";

  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [countdown, setCountdown] = useState<CountdownValue>(() => getCountdown());

  const isCountdownComplete =
    countdown.days === 0 &&
    countdown.hours === 0 &&
    countdown.minutes === 0 &&
    countdown.seconds === 0;

  const countdownItems = useMemo(
    () => [
      { label: "Days", value: countdown.days },
      { label: "Hours", value: countdown.hours },
      { label: "Minutes", value: countdown.minutes },
      { label: "Seconds", value: countdown.seconds },
    ],
    [countdown],
  );

  useEffect(() => {
    const interval = window.setInterval(() => setCountdown(getCountdown()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;

    setRotation({
      x: -(y / rect.height) * 4.5,
      y: (x / rect.width) * 4.5,
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotation({ x: 0, y: 0 });
  };

  const handleCelebrate = () => {
    setConfetti(makeConfetti());
    // Give confetti a moment to burst, then trigger the page transition
    window.setTimeout(() => {
      onSwipeComplete?.();
    }, 600);
  };

  return (
    <main className="relative flex min-h-dvh w-full items-center justify-center overflow-hidden px-4 py-6 sm:py-8">
      {/* Decorative floating orbs for Page 1 */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <motion.div
          className="absolute -left-2 top-[5px] h-[75px] w-[75px] rounded-full bg-[#f8c9e5]/72"
          animate={{ y: [0, 14, 0], scale: [1, 1.04, 1] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -right-6 top-[48.7%] h-[66px] w-[66px] rounded-full bg-[#c7e0ff]/78"
          animate={{ x: [0, -10, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-[8.1%] right-[2.1%] h-[136px] w-[136px] rounded-full bg-[#e3d6ff]/78"
          animate={{ y: [0, -16, 0], scale: [1, 1.035, 1] }}
          transition={{ duration: 6.2, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <AnimatePresence>
        {confetti.length > 0 && (
          <motion.div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 z-30 overflow-hidden"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {confetti.map((piece) => (
              <motion.span
                key={piece.id}
                className="absolute rounded-[3px]"
                style={{
                  width: piece.size,
                  height: piece.size * 0.72,
                  backgroundColor: piece.color,
                  left: "50%",
                  top: "50%",
                }}
                initial={{ x: 0, y: 0, opacity: 1, scale: 0.5, rotate: 0 }}
                animate={{
                  x: `${piece.left - 50}vw`,
                  y: `${piece.top - 50}vh`,
                  opacity: 0,
                  scale: [0.65, 1, 0.45],
                  rotate: piece.rotate,
                }}
                transition={{ duration: piece.duration, ease: "easeOut" }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.section
        ref={cardRef}
        aria-label={`Birthday card for ${name}`}
        className="relative z-10 w-full max-w-[420px] rounded-[22px]"
        style={{ transformStyle: "preserve-3d", perspective: 1000 }}
        initial={{ opacity: 0, y: 18, scale: 0.985 }}
        animate={{
          opacity: 1,
          y: isHovered ? -8 : 0,
          scale: 1,
          rotateX: rotation.x,
          rotateY: rotation.y,
        }}
        transition={{ type: "spring", stiffness: 270, damping: 24 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
      >
        <Card className="relative min-h-[680px] overflow-hidden border-0 bg-[#bd78f0] shadow-birthday sm:min-h-[722px]">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,#f56cad_0%,#c86cf4_45%,#66a9f6_100%)]" />
          <motion.div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 50% 34%, rgba(255,255,255,0.25), transparent 42%)",
              filter: "blur(28px)",
            }}
            animate={{ opacity: isHovered ? 0.86 : 0.56, scale: isHovered ? 1.09 : 1 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.20)_0%,rgba(255,255,255,0.02)_47%,rgba(255,255,255,0.12)_100%)]"
          />

          <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
            {[18, 34, 57, 73, 88].map((left, index) => (
              <motion.span
                key={left}
                className="absolute h-1 w-1 rounded-full bg-white/45"
                style={{
                  left: `${left}%`,
                  top: `${18 + index * 13}%`,
                }}
                animate={{ y: [0, -8, 0], opacity: [0.2, 0.8, 0.2] }}
                transition={{
                  duration: 2.4 + index * 0.35,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>

          <div className="relative z-10 flex min-h-[680px] flex-col px-[clamp(1.5rem,6vw,1.875rem)] pb-9 pt-[45px] text-center text-white sm:min-h-[722px] sm:px-[30px] sm:pb-[42px] sm:pt-[52px]">
            <motion.div
              className="mx-auto flex h-[76px] w-[76px] items-center justify-center rounded-full bg-white/18 shadow-[0_10px_24px_rgba(99,57,191,0.18)] backdrop-blur-md"
              animate={{ rotate: isHovered ? [0, -8, 8, -4, 0] : 0 }}
              transition={{ duration: 0.55 }}
            >
              <Cake className="h-9 w-9 stroke-[2.4]" aria-hidden="true" />
            </motion.div>

            <motion.div
              className="mt-7"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12, duration: 0.55, ease: "easeOut" }}
            >
              <h1 className="text-[clamp(2rem,7.4vw,2.25rem)] font-extrabold leading-[1.08] tracking-normal">
                Happy Birthday!
              </h1>
              <p className="mt-2 text-[21px] font-bold leading-none text-white/90">
                {name}
              </p>
            </motion.div>

            <motion.div
              className="mt-[29px] flex justify-center"
              initial={{ opacity: 0, scale: 0.76 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.24, type: "spring", stiffness: 260, damping: 18 }}
            >
              <div className="flex h-[44px] min-w-[124px] items-center justify-center gap-2 rounded-full bg-white/26 px-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.20)] backdrop-blur-md">
                <Sparkles className="h-5 w-5" aria-hidden="true" />
                <span className="text-2xl font-extrabold leading-none">{age}</span>
                <Sparkles className="h-5 w-5" aria-hidden="true" />
              </div>
            </motion.div>

            <motion.div
              className="mt-[25px] flex items-center justify-center gap-2 text-sm font-semibold text-white/86"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.34, duration: 0.5 }}
            >
              <Calendar className="h-4 w-4" aria-hidden="true" />
              <span>{date}</span>
            </motion.div>

            <motion.div
              className="mt-[26px]"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.44, duration: 0.5, ease: "easeOut" }}
            >
              <div className="flex items-center justify-center gap-2 text-sm font-extrabold text-white/92">
                <Clock className="h-4 w-4" aria-hidden="true" />
                <span>Countdown to Birthday</span>
              </div>

              <div className="mt-[17px] grid grid-cols-4 gap-2.5 sm:gap-3">
                {countdownItems.map((item, index) => (
                  <motion.div
                    key={item.label}
                    className="flex h-[72px] min-w-0 flex-col items-center justify-center rounded-[13px] bg-white/18 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-md"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      delay: 0.53 + index * 0.07,
                      type: "spring",
                      stiffness: 260,
                      damping: 18,
                    }}
                  >
                    <span className="text-[25px] font-extrabold leading-none">
                      {item.value}
                    </span>
                    <span className="mt-2 text-[12px] font-semibold leading-none text-white/72">
                      {item.label}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.p
              className="mx-auto mt-[27px] max-w-[354px] text-sm font-semibold leading-[1.45] text-white/88"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.86, duration: 0.5, ease: "easeOut" }}
            >
              {message}
            </motion.p>

            <div className="mt-[39px] flex justify-center">
              <SwipeButton onSwipeComplete={handleCelebrate} isLocked={!isCountdownComplete} />
            </div>

            <div className="mt-auto flex items-center justify-around px-9 pt-9 text-white/66">
              {[Gift, Cake, PartyPopper].map((Icon, index) => (
                <motion.span
                  key={index}
                  className="flex h-8 w-8 items-center justify-center"
                  animate={{ y: [0, -9, 0] }}
                  transition={{
                    duration: 2.35,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.28,
                  }}
                >
                  <Icon className="h-[22px] w-[22px]" aria-hidden="true" />
                </motion.span>
              ))}
            </div>
          </div>
        </Card>
      </motion.section>
    </main>
  );
}
