"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface CinematicBackgroundProps {
  /** 0 = light (Page1), 1 = dark navy (Page2), 2 = deep dark (Page3) */
  phase: number;
}

export default function CinematicBackground({ phase }: CinematicBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phaseRef = useRef(phase);
  const targetPhaseRef = useRef(phase);
  const currentPhaseRef = useRef(phase);

  useEffect(() => {
    targetPhaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function syncSize() {
      if (!canvas) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    }
    syncSize();
    window.addEventListener("resize", syncSize);

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
uniform float u_phase;
uniform vec2 u_resolution;

void main() {
    vec2 uv = v_texCoord;
    
    // Phase 0: Light pastel gradient (Page 1)
    vec3 light1 = vec3(0.98, 0.96, 0.98);
    vec3 light2 = vec3(0.95, 0.96, 1.0);
    vec3 lightColor = mix(light1, light2, uv.y + 0.1 * sin(u_time * 0.3));
    // Subtle pastel blobs
    float lb1 = 1.0 - distance(uv, vec2(0.15, 0.15) + 0.05 * vec2(cos(u_time * 0.2), sin(u_time * 0.3)));
    float lb2 = 1.0 - distance(uv, vec2(0.85, 0.85) + 0.05 * vec2(sin(u_time * 0.25), cos(u_time * 0.2)));
    lightColor += vec3(0.97, 0.79, 0.90) * pow(max(0.0, lb1), 5.0) * 0.3;
    lightColor += vec3(0.78, 0.84, 1.0) * pow(max(0.0, lb2), 5.0) * 0.3;
    
    // Phase 1: Deep navy/purple (Page 2)
    vec3 dark1 = vec3(0.02, 0.04, 0.12);
    vec3 dark2 = vec3(0.08, 0.05, 0.15);
    vec3 darkColor = mix(dark1, dark2, uv.y + 0.5 * sin(u_time * 0.2));
    float db1 = 1.0 - distance(uv, vec2(0.2, 0.8) + 0.1 * vec2(cos(u_time * 0.3), sin(u_time * 0.4)));
    float db2 = 1.0 - distance(uv, vec2(0.8, 0.2) + 0.1 * vec2(sin(u_time * 0.5), cos(u_time * 0.2)));
    darkColor += vec3(0.1, 0.05, 0.2) * pow(max(0.0, db1), 4.0);
    darkColor += vec3(0.05, 0.1, 0.2) * pow(max(0.0, db2), 4.0);
    float centerGlow = 1.0 - distance(uv, vec2(0.5, 0.5));
    darkColor += vec3(0.15, 0.05, 0.1) * pow(max(0.0, centerGlow), 3.0);
    
    // Phase 2: Deepest dark (Page 3) 
    vec3 deep1 = vec3(0.047, 0.075, 0.141);
    vec3 deep2 = vec3(0.035, 0.055, 0.12);
    vec3 deepColor = mix(deep1, deep2, uv.y + 0.3 * sin(u_time * 0.15));
    float dp1 = 1.0 - distance(uv, vec2(0.3, 0.7) + 0.08 * vec2(cos(u_time * 0.25), sin(u_time * 0.35)));
    float dp2 = 1.0 - distance(uv, vec2(0.7, 0.3) + 0.08 * vec2(sin(u_time * 0.4), cos(u_time * 0.15)));
    deepColor += vec3(0.08, 0.03, 0.15) * pow(max(0.0, dp1), 4.0);
    deepColor += vec3(0.12, 0.04, 0.08) * pow(max(0.0, dp2), 4.0);
    
    // Smooth interpolation between phases
    vec3 color;
    if (u_phase <= 1.0) {
        color = mix(lightColor, darkColor, u_phase);
    } else {
        color = mix(darkColor, deepColor, u_phase - 1.0);
    }
    
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
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const pos = gl.getAttribLocation(prog, "a_position");
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, "u_time");
    const uPhase = gl.getUniformLocation(prog, "u_phase");
    const uRes = gl.getUniformLocation(prog, "u_resolution");

    let animId: number;
    function render(t: number) {
      if (!gl || !canvas) return;

      // Smooth interpolation of phase
      const target = targetPhaseRef.current;
      const current = currentPhaseRef.current;
      const diff = target - current;
      if (Math.abs(diff) > 0.001) {
        currentPhaseRef.current += diff * 0.02; // Smooth lerp
      } else {
        currentPhaseRef.current = target;
      }

      gl.viewport(0, 0, canvas.width, canvas.height);
      if (uTime) gl.uniform1f(uTime, t * 0.001);
      if (uPhase) gl.uniform1f(uPhase, currentPhaseRef.current);
      if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animId = requestAnimationFrame(render);
    }
    render(0);

    return () => {
      window.removeEventListener("resize", syncSize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0">
      <canvas
        ref={canvasRef}
        style={{ display: "block", width: "100%", height: "100%" }}
      />
      {/* Gradient overlays for aurora effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          opacity: phase >= 1 ? 0.15 : 0,
        }}
        transition={{ duration: 2, ease: "easeInOut" }}
        style={{
          background: "radial-gradient(ellipse at 30% 20%, rgba(124,58,237,0.3), transparent 60%)",
        }}
      />
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          opacity: phase >= 1 ? 0.12 : 0,
        }}
        transition={{ duration: 2, ease: "easeInOut" }}
        style={{
          background: "radial-gradient(ellipse at 70% 80%, rgba(244,114,182,0.25), transparent 60%)",
        }}
      />
    </div>
  );
}
