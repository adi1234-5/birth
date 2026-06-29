"use client";

import React, { useEffect, useRef } from "react";
import Head from "next/head";
import { motion } from "framer-motion";

export default function FinalBirthdayWishes() {
  const particleContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll Reveal effect for sequential cards if page was longer
    const observerOptions = {
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-fade-up");
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    document.querySelectorAll(".glass-card").forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // Simple Atmospheric Particle Generator
    const container = particleContainerRef.current;
    if (!container) return;
    
    const icons = ["star", "favorite", "circle"];
    const count = 30;

    for (let i = 0; i < count; i++) {
      const particle = document.createElement("span");
      const isIcon = Math.random() > 0.5;

      if (isIcon) {
        particle.className =
          "material-symbols-outlined absolute text-[10px] pointer-events-none opacity-20 animate-twinkle";
        particle.innerText = icons[Math.floor(Math.random() * icons.length)];
        particle.style.color = Math.random() > 0.5 ? "#F472B6" : "#7C3AED";
      } else {
        particle.className =
          "absolute rounded-full pointer-events-none opacity-30 animate-twinkle";
        const size = Math.random() * 4 + 2;
        particle.style.width = size + "px";
        particle.style.height = size + "px";
        particle.style.backgroundColor = "white";
        particle.style.boxShadow = "0 0 10px 2px white";
      }

      particle.style.left = Math.random() * 100 + "%";
      particle.style.top = Math.random() * 100 + "%";
      particle.style.animationDelay = Math.random() * 5 + "s";
      particle.style.animationDuration = Math.random() * 3 + 2 + "s";

      container.appendChild(particle);
    }
  }, []);

  return (
    <>
      <Head>
        <title>Happy Birthday Vaishnavi</title>
      </Head>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@400;500;600&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

        @keyframes fadeUp {
            from { opacity: 0; transform: translateY(20px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes float {
            0%, 100% { transform: translateY(0px) translateX(0px); }
            50% { transform: translateY(-15px) translateX(5px); }
        }

        @keyframes heartBeat {
            0%, 100% { transform: scale(1); }
            15% { transform: scale(1.2); }
            30% { transform: scale(1); }
            45% { transform: scale(1.15); }
            60% { transform: scale(1); }
        }

        @keyframes twinkle {
            0%, 100% { opacity: 0.2; transform: scale(0.8); }
            50% { opacity: 1; transform: scale(1.1); }
        }

        .animate-fade-up { animation: fadeUp 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; opacity: 0; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-heartbeat { animation: heartBeat 2s ease-in-out infinite; }
        .animate-twinkle { animation: twinkle 3s ease-in-out infinite; }

        .glass-card {
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.12);
            box-shadow: inset 0 0 20px rgba(124, 58, 237, 0.1);
        }

        .gradient-text {
            background: linear-gradient(to right, #F472B6, #7C3AED);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .stagger-1 { animation-delay: 0.2s; }
        .stagger-2 { animation-delay: 0.4s; }
        .stagger-3 { animation-delay: 0.6s; }
        .stagger-4 { animation-delay: 0.8s; }
        .stagger-5 { animation-delay: 1.0s; }
        
        .bg-background { background-color: #0c1324; }
        .text-on-surface { color: #dce1fb; }
        .text-on-surface-variant { color: #c8c5cd; }
        .text-primary { color: #c5c4df; }
        .text-error { color: #ffb4ab; }
        .border-l-ethereal-purple { border-left-color: #7C3AED; }
        
        .font-display-lg { font-family: 'Playfair Display', serif; }
        .font-headline-lg { font-family: 'Playfair Display', serif; }
        .font-body-lg { font-family: 'Inter', sans-serif; }
        .font-label-md { font-family: 'Inter', sans-serif; }
        .font-body-md { font-family: 'Inter', sans-serif; }

        .text-display-lg { font-size: 72px; line-height: 80px; letter-spacing: -0.02em; font-weight: 700; }
        .text-display-lg-mobile { font-size: 48px; line-height: 56px; letter-spacing: -0.02em; font-weight: 700; }
        .text-headline-lg { font-size: 32px; line-height: 40px; font-weight: 600; }
        .text-body-lg { font-size: 18px; line-height: 28px; font-weight: 400; }
        .text-label-md { font-size: 14px; line-height: 20px; letter-spacing: 0.05em; font-weight: 500; }
        .text-body-md { font-size: 16px; line-height: 24px; font-weight: 400; }

        .px-margin-mobile { padding-left: 20px; padding-right: 20px; }
        .px-margin-desktop { padding-left: 64px; padding-right: 64px; }
      `}} />
      <motion.div
        className="bg-background text-on-surface selection:bg-ethereal-purple selection:text-white overflow-x-hidden min-h-screen relative font-body-md"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Atmospheric Foundation */}
        <div className="fixed inset-0 z-0">
          {/* Floating Particles Layer */}
          <div
            className="absolute inset-0 pointer-events-none"
            id="particle-container"
            ref={particleContainerRef}
          ></div>
        </div>

        {/* Main Content Canvas */}
        <main className="relative z-10 pt-24 pb-32 px-margin-mobile md:px-margin-desktop max-w-container-max-width mx-auto flex flex-col items-center">
          {/* Main Heading */}
          <h1 className="font-display-lg-mobile text-display-lg-mobile md:font-display-lg md:text-display-lg text-center mb-12 animate-fade-up stagger-1">
            <span className="block">🎉 Happy Birthday</span>
            <span className="gradient-text drop-shadow-[0_0_15px_rgba(244,114,182,0.4)]">
              Once Again! 🎉
            </span>
          </h1>
          
          {/* Primary Message Card */}
          <section className="glass-card rounded-[2rem] p-8 md:p-12 mb-8 w-full max-w-3xl animate-fade-up stagger-2">
            <h2 className="font-headline-lg text-headline-lg text-center mb-8 flex items-center justify-center gap-3">
              A Message From Me....
            </h2>
            <div className="space-y-6 font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
              <p className="animate-fade-up stagger-3">
                Dear Vaishnavi, as you step into this beautiful new chapter of
                your life, I wanted to take a moment to celebrate the incredible
                person you are. Your presence brings a unique light into the world
                that is rare and precious.
              </p>
              <p className="animate-fade-up stagger-4">
                May this year be filled with unexpected joys, deep laughter, and
                the kind of moments that take your breath away. You deserve every
                ounce of happiness that the universe has to offer.
              </p>
              <p className="animate-fade-up stagger-5">
                Thank you for being you. Happy 18th, Vaishnavi! Let's make this
                day unforgettable.
              </p>
            </div>
          </section>
          
          {/* Final Quote Card */}
          <section
            className="glass-card rounded-2xl p-6 md:p-8 mb-12 w-full max-w-xl text-center border-l-4 border-l-ethereal-purple animate-fade-up"
            style={{ animationDelay: "1.2s", animationFillMode: "forwards" }}
          >
            <p className="italic font-headline-lg text-headline-lg text-primary opacity-90">
              "The best is yet to come. Keep smiling, keep dreaming, and enjoy
              every beautiful moment of life."
            </p>
          </section>
          
          {/* Closing Identity */}
          <div
            className="flex flex-col items-center gap-4 mb-16 animate-fade-up"
            style={{ animationDelay: "1.4s", animationFillMode: "forwards" }}
          >
            <div className="flex items-center gap-2 font-label-md text-label-md tracking-widest text-on-surface-variant">
              MADE WITH
              <span
                className="material-symbols-outlined text-error animate-heartbeat"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                favorite
              </span>
              ESPECIALLY FOR VAISHNAVI
            </div>
            <div className="font-headline-lg text-headline-lg gradient-text font-bold">
              Happy Birthday 🎂
            </div>
          </div>
        </main>
      </motion.div>
    </>
  );
}
