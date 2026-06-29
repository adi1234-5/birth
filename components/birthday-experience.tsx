"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CinematicBackground from "@/components/cinematic-background";
import CinematicParticles from "@/components/cinematic-particles";
import TransitionOverlay from "@/components/transition-overlay";
import BirthdayCardPage from "@/components/pages/birthday-card-page";
import SurprisePage from "@/components/pages/surprise-page";
import FinalPage from "@/components/pages/final-page";

type PageKey = "card" | "surprise" | "final";

const pageExitVariants = {
  card: {
    opacity: 0,
    scale: 1.05,
    filter: "blur(12px)",
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
  },
  surprise: {
    opacity: 0,
    scale: 1.08,
    filter: "blur(14px)",
    y: -40,
    transition: { duration: 1, ease: [0.16, 1, 0.3, 1] },
  },
  final: {
    opacity: 0,
    transition: { duration: 0.5 },
  },
};

const pageEnterVariants = {
  card: {
    opacity: 0,
    scale: 0.95,
    filter: "blur(8px)",
  },
  surprise: {
    opacity: 0,
    scale: 0.92,
    y: 60,
    filter: "blur(10px)",
  },
  final: {
    opacity: 0,
    y: 80,
    scale: 0.95,
    filter: "blur(8px)",
  },
};

const pageAnimateVariants = {
  card: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  surprise: {
    opacity: 1,
    scale: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 1.0,
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: 0.15,
    },
  },
  final: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 1.0,
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: 0.12,
    },
  },
};

export default function BirthdayExperience() {
  const [currentPage, setCurrentPage] = useState<PageKey>("card");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionType, setTransitionType] = useState<"swipe-to-surprise" | "celebrate-to-final">("swipe-to-surprise");
  const [backgroundPhase, setBackgroundPhase] = useState(0);
  const [particleIntensity, setParticleIntensity] = useState(1);
  const [pendingPage, setPendingPage] = useState<PageKey | null>(null);

  const handleSwipeComplete = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTransitionType("swipe-to-surprise");
    setParticleIntensity(3);

    // Start background transition immediately
    setBackgroundPhase(1);
    setPendingPage("surprise");
  }, [isTransitioning]);

  const handleCelebrate = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTransitionType("celebrate-to-final");
    setParticleIntensity(3);

    // Start background transition immediately
    setBackgroundPhase(2);
    setPendingPage("final");
  }, [isTransitioning]);

  const handleTransitionComplete = useCallback(() => {
    if (pendingPage) {
      setCurrentPage(pendingPage);
      setPendingPage(null);

      // Reset after new page mounts
      setTimeout(() => {
        setIsTransitioning(false);
        setParticleIntensity(1);
      }, 200);
    }
  }, [pendingPage]);

  return (
    <div className="relative min-h-dvh w-full overflow-hidden">
      {/* Persistent cinematic background */}
      <CinematicBackground phase={backgroundPhase} />

      {/* Persistent particle system */}
      <CinematicParticles intensity={particleIntensity} />

      {/* Transition effects overlay */}
      <TransitionOverlay
        active={isTransitioning}
        type={transitionType}
        onComplete={handleTransitionComplete}
      />

      {/* Page content with AnimatePresence */}
      <AnimatePresence mode="wait">
        {currentPage === "card" && (
          <motion.div
            key="page-card"
            initial={pageEnterVariants.card}
            animate={isTransitioning ? pageExitVariants.card : pageAnimateVariants.card}
            exit={pageExitVariants.card}
            className="relative z-10"
            style={{ willChange: "transform, opacity, filter" }}
          >
            <BirthdayCardPage onSwipeComplete={handleSwipeComplete} />
          </motion.div>
        )}

        {currentPage === "surprise" && (
          <motion.div
            key="page-surprise"
            initial={pageEnterVariants.surprise}
            animate={isTransitioning ? pageExitVariants.surprise : pageAnimateVariants.surprise}
            exit={pageExitVariants.surprise}
            className="relative z-10"
            style={{ willChange: "transform, opacity, filter" }}
          >
            <SurprisePage onCelebrate={handleCelebrate} />
          </motion.div>
        )}

        {currentPage === "final" && (
          <motion.div
            key="page-final"
            initial={pageEnterVariants.final}
            animate={pageAnimateVariants.final}
            exit={pageExitVariants.final}
            className="relative z-10"
            style={{ willChange: "transform, opacity, filter" }}
          >
            <FinalPage />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
