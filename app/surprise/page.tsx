"use client";

import React, { useEffect, useRef, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function BirthdaySurprise() {
  const router = useRouter();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const shaderCanvasRef = useRef<HTMLCanvasElement>(null);
  const particleContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll Reveal logic
    const observerOptions = {
      threshold: 0.2,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    }, observerOptions);

    document.querySelectorAll(".scroll-reveal").forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = shaderCanvasRef.current;
    if (!canvas) return;

    function syncSize() {
      if (!canvas) return;
      const w = canvas.clientWidth || window.innerWidth;
      const h = canvas.clientHeight || window.innerHeight;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    }
    if (typeof ResizeObserver !== "undefined") {
      new ResizeObserver(syncSize).observe(canvas);
    }
    syncSize();

    const gl = (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    if (!gl) return;
    const vs = `attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;
    const fs = `precision highp float;
varying vec2 v_texCoord;
uniform float u_time;
uniform vec2 u_resolution;

void main() {
    vec2 uv = v_texCoord;
    
    // Background color: Deep navy to dark purple
    vec3 color1 = vec3(0.02, 0.04, 0.12); // Deep Navy
    vec3 color2 = vec3(0.08, 0.05, 0.15); // Dark Purple
    
    vec3 color = mix(color1, color2, uv.y + 0.5 * sin(u_time * 0.2));
    
    // Ambient light blobs
    float blob1 = 1.0 - distance(uv, vec2(0.2, 0.8) + 0.1 * vec2(cos(u_time * 0.3), sin(u_time * 0.4)));
    float blob2 = 1.0 - distance(uv, vec2(0.8, 0.2) + 0.1 * vec2(sin(u_time * 0.5), cos(u_time * 0.2)));
    
    color += vec3(0.1, 0.05, 0.2) * pow(max(0.0, blob1), 4.0); // Purple glow
    color += vec3(0.05, 0.1, 0.2) * pow(max(0.0, blob2), 4.0); // Blue glow
    
    // Subtle Pink glow at center
    float centerGlow = 1.0 - distance(uv, vec2(0.5, 0.5));
    color += vec3(0.15, 0.05, 0.1) * pow(max(0.0, centerGlow), 3.0);
    
    gl_FragColor = vec4(color, 1.0);
}`;
    function cs(type: number, src: string) {
      if (!gl) return null;
      const s = gl.createShader(type);
      if (!s) return null;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    }
    const prog = gl.createProgram();
    if (!prog) return;
    const vertexShader = cs(gl.VERTEX_SHADER, vs);
    const fragmentShader = cs(gl.FRAGMENT_SHADER, fs);
    if (vertexShader) gl.attachShader(prog, vertexShader);
    if (fragmentShader) gl.attachShader(prog, fragmentShader);
    gl.linkProgram(prog);
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );
    const pos = gl.getAttribLocation(prog, "a_position");
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
    const uTime = gl.getUniformLocation(prog, "u_time");
    const uRes = gl.getUniformLocation(prog, "u_resolution");
    const uMouse = gl.getUniformLocation(prog, "u_mouse");

    const mouse = { x: canvas.width / 2, y: canvas.height / 2 };
    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width && rect.height) {
        const nx = (event.clientX - rect.left) / rect.width;
        const ny = 1.0 - (event.clientY - rect.top) / rect.height;
        mouse.x = nx * canvas.width;
        mouse.y = ny * canvas.height;
      }
    };
    window.addEventListener("mousemove", handleMouseMove);

    let animationFrameId: number;
    function render(t: number) {
      if (!gl || !canvas) return;
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (uTime) gl.uniform1f(uTime, t * 0.001);
      if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
      if (uMouse) gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationFrameId = requestAnimationFrame(render);
    }
    render(0);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  useEffect(() => {
    const particleContainer = particleContainerRef.current;
    if (!particleContainer) return;

    const particleTypes = ["star", "favorite", "sparkle"];
    let intervalId: number;

    function createParticle() {
      if (!particleContainer) return;
      const particle = document.createElement("div");
      const isIcon = Math.random() > 0.7;

      if (isIcon) {
        particle.className =
          "material-symbols-outlined fixed pointer-events-none text-soft-pink-glow opacity-0 z-10 transition-opacity duration-1000";
        particle.innerText = particleTypes[Math.floor(Math.random() * 2)]; // Star or Favorite
        particle.style.fontSize = Math.random() * 20 + 10 + "px";
      } else {
        particle.className = "sparkle z-10";
        particle.style.width = Math.random() * 4 + 2 + "px";
        particle.style.height = particle.style.width;
      }

      const startX = Math.random() * window.innerWidth;
      const startY = Math.random() * window.innerHeight;
      const duration = Math.random() * 3 + 2;

      particle.style.left = startX + "px";
      particle.style.top = startY + "px";
      particle.style.setProperty("--duration", duration + "s");

      particleContainer.appendChild(particle);

      if (isIcon) {
        setTimeout(() => {
          if (particle) particle.style.opacity = "0.4";
        }, 10);
        setTimeout(() => {
          if (particle) {
            particle.style.opacity = "0";
            setTimeout(() => particle.remove(), 1000);
          }
        }, duration * 1000);
      } else {
        setTimeout(() => particle.remove(), duration * 1000);
      }
    }

    intervalId = window.setInterval(createParticle, 300);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const handleCelebrate = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = e.currentTarget;
    const colors = ["#F472B6", "#7C3AED", "#E1E0FB", "#FFD8E7", "#0066CC"];
    for (let i = 0; i < 100; i++) {
      const piece = document.createElement("div");
      piece.className = "confetti-piece";
      piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      piece.style.left = "50%";
      piece.style.top = "50%";

      const angle = Math.random() * Math.PI * 2;
      const velocity = 5 + Math.random() * 10;
      const xVel = Math.cos(angle) * velocity;
      let yVel = Math.sin(angle) * velocity;

      document.body.appendChild(piece);

      let posX = window.innerWidth / 2;
      let posY = window.innerHeight / 2;
      let gravity = 0.2;
      let opacity = 1;

      function update() {
        posX += xVel;
        posY += yVel;
        posY += gravity;
        gravity += 0.1;
        opacity -= 0.01;

        piece.style.left = posX + "px";
        piece.style.top = posY + "px";
        piece.style.opacity = opacity.toString();
        piece.style.transform = `rotate(${posY}deg)`;

        if (opacity > 0) {
          requestAnimationFrame(update);
        } else {
          piece.remove();
        }
      }
      requestAnimationFrame(update);
    }

    // Subtle feedback
    btn.style.transform = "scale(0.95)";
    setTimeout(() => (btn.style.transform = "scale(1)"), 100);

    // Add a temporary glow burst
    const burst = document.createElement("div");
    burst.className =
      "fixed inset-0 pointer-events-none z-30 transition-opacity duration-1000 bg-soft-pink-glow/20";
    document.body.appendChild(burst);
    setTimeout(() => {
      burst.style.opacity = "0";
      setTimeout(() => burst.remove(), 1000);
    }, 100);

    // Trigger transition and navigate
    setIsTransitioning(true);
    setTimeout(() => {
      router.push("/final");
    }, 800);
  };

  return (
    <>
      <Head>
        <title>Vaishnavi's 18th Birthday Celebration</title>
      </Head>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@400;500;600&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

        @keyframes fade-up {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
            0%, 100% { transform: translateY(0px) scale(1); }
            50% { transform: translateY(-20px) scale(1.02); }
        }
        @keyframes zoom-in {
            from { transform: scale(0.9); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }
        @keyframes twinkle {
            0%, 100% { opacity: 0.3; transform: scale(0.8); }
            50% { opacity: 1; transform: scale(1.2); }
        }
        
        .animate-fade-up { animation: fade-up 1.2s ease-out forwards; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-zoom-in { animation: zoom-in 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .scroll-reveal { opacity: 0; transform: translateY(20px); transition: all 0.8s ease-out; }
        .scroll-reveal.visible { opacity: 1; transform: translateY(0); }
        
        .glass-card {
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.12);
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
        }

        .confetti-piece {
            position: fixed;
            width: 10px;
            height: 10px;
            pointer-events: none;
            z-index: 100;
        }

        .sparkle {
            position: fixed;
            pointer-events: none;
            background: white;
            border-radius: 50%;
            box-shadow: 0 0 10px 2px rgba(255, 255, 255, 0.8);
            animation: twinkle var(--duration) ease-in-out infinite;
        }

        .bg-deep-navy { background-color: #0A0B1E; }
        .text-on-surface { color: #dce1fb; }
        .text-soft-pink-glow { color: #F472B6; }
        .text-on-surface-variant { color: #c8c5cd; }
        .bg-ethereal-purple { background-color: #7C3AED; }
        .from-ethereal-purple { --tw-gradient-from: #7C3AED; }
        .to-soft-pink-glow { --tw-gradient-to: #F472B6; }
        .via-soft-pink-glow { --tw-gradient-stops: var(--tw-gradient-from), #F472B6, var(--tw-gradient-to); }
        .border-border-highlight { border-color: rgba(255, 255, 255, 0.12); }
        
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
      <AnimatePresence>
        <motion.div 
          className="bg-deep-navy text-on-surface overflow-x-hidden selection:bg-soft-pink-glow/30 min-h-screen relative font-body-md"
          animate={{ 
            opacity: isTransitioning ? 0 : 1,
            filter: isTransitioning ? "blur(10px)" : "blur(0px)",
            scale: isTransitioning ? 1.05 : 1
          }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Global Background Shader */}
          <div className="fixed inset-0 z-0">
            <div className="absolute inset-0 w-full h-full" style={{ display: "block" }}>
              <canvas
                ref={shaderCanvasRef}
                style={{ display: "block", width: "100%", height: "100%" }}
              ></canvas>
            </div>
          </div>

          {/* Particle Container */}
          <div
            ref={particleContainerRef}
            className="fixed inset-0 pointer-events-none z-10"
          ></div>

          {/* Main Content */}
          <main className="relative z-20 pt-32 pb-40 px-margin-mobile md:px-margin-desktop flex flex-col items-center">
            {/* Header Section */}
            <header className="text-center mb-16 space-y-4">
              <p className="animate-fade-up font-label-md text-label-md text-soft-pink-glow tracking-[0.2em] uppercase opacity-0" style={{ animationFillMode: "forwards" }}>
                ✨ A Special Birthday Surprise ✨
              </p>
              <h1 className="animate-fade-up font-display-lg-mobile text-display-lg-mobile md:font-display-lg md:text-display-lg text-on-surface opacity-0" style={{ animationFillMode: "forwards", animationDelay: "0.2s" }}>
                Happy 18th Birthday,<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-br from-white via-soft-pink-glow to-ethereal-purple">
                  Vaishnavi ❤️
                </span>
              </h1>
            </header>

            {/* Hero Image Section */}
            <div
              className="relative group mb-24 animate-zoom-in opacity-0"
              style={{ animationDelay: "0.6s", animationFillMode: "forwards" }}
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-ethereal-purple/20 to-soft-pink-glow/20 rounded-[32px] blur-2xl group-hover:blur-3xl transition-all duration-700"></div>
              <div className="relative glass-card p-4 rounded-[32px] animate-float">
                <div className="overflow-hidden rounded-[24px] border border-border-highlight shadow-[0_0_50px_rgba(244,114,182,0.2)]">
                  <img
                    className="w-full max-w-[500px] aspect-[4/5] object-cover object-center transition-transform duration-700 group-hover:scale-105"
                    alt="A portrait of Vaishnavi"
                    src="/uploaded-photo.jpg"
                  />
                </div>
                {/* Decorative Elements */}
                <div className="absolute -top-6 -right-6 w-20 h-20 glass-card rounded-full flex items-center justify-center border-soft-pink-glow/30 border">
                  <span
                    className="material-symbols-outlined text-soft-pink-glow text-4xl"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    favorite
                  </span>
                </div>
                <div className="absolute -bottom-4 -left-4 px-6 py-2 glass-card rounded-full border-ethereal-purple/30 border">
                  <span className="font-label-md text-label-md text-on-surface">
                    Age 18 • Forever Young
                  </span>
                </div>
              </div>
            </div>

            {/* Heartfelt Message */}
            <section className="max-w-2xl w-full text-center space-y-12 mb-32">
              <div className="scroll-reveal space-y-6">
                <p className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface leading-relaxed italic">
                  "Eighteen years ago, a star was born, and since then, you've lit
                  up every life you've touched."
                </p>
              </div>
              <div className="scroll-reveal glass-card p-8 md:p-12 rounded-[24px] space-y-6 text-on-surface-variant font-body-lg text-body-lg text-left relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <span className="material-symbols-outlined text-8xl">
                    format_quote
                  </span>
                </div>
                <p className="relative z-10">
                  To our dearest Vaishnavi, reaching eighteen is more than just a
                  number; it’s the blossoming of a beautiful journey. You carry with
                  you a grace that inspires and a kindness that heals. Today, we
                  celebrate not just the woman you’ve become, but the incredible
                  heights you are destined to reach.
                </p>
                <p className="relative z-10">
                  As you step into this new chapter, remember that your light is
                  your strength. Never stop chasing the dreams that make your soul
                  dance. You are loved beyond measure, and your potential is as vast
                  as the galaxy itself.
                </p>
                <p className="relative z-10 text-on-surface font-semibold">
                  May your year be filled with as much magic as you bring into our
                  lives every single day. Happy 18th, beautiful!
                </p>
              </div>
            </section>

            {/* Celebration Action */}
            <div className="flex flex-col items-center gap-8 mb-20">
              <motion.button
                className="group relative px-12 py-5 bg-gradient-to-r from-ethereal-purple to-soft-pink-glow rounded-full overflow-hidden transition-all duration-300 shadow-[0_0_30px_rgba(124,58,237,0.5)] hover:shadow-[0_0_50px_rgba(244,114,182,0.6)] border-0"
                onClick={handleCelebrate}
                whileTap={{ scale: 0.95 }}
                disabled={isTransitioning}
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <span className="relative font-label-md text-label-md text-white flex items-center gap-3">
                  Celebrate&nbsp;
                  <span className="material-symbols-outlined">celebration</span>
                </span>
              </motion.button>
              <p className="font-body-md text-body-md text-on-surface-variant/60">
                Click to start the magic
              </p>
            </div>
          </main>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
