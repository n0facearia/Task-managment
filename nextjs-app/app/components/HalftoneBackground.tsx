"use client";

import { useEffect, useRef, useCallback } from "react";

const DOT_SPACING_X = 12;
const DOT_SPACING_Y = 14;
const MOUSE_RADIUS = 150;
const BASE_RADIUS = 1.5;
const MAX_RADIUS = 4;
const BASE_OPACITY = 0.04;
const MAX_OPACITY = 0.15;
const BG_COLOR = "#1c1c1c";

export default function HalftoneBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const animFrameRef = useRef<number>(0);
  const needsRedrawRef = useRef(true);

  const drawHalftone = useCallback((canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;

    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, w, h);

    const { x: mx, y: my } = mouseRef.current;
    const cols = Math.ceil(w / DOT_SPACING_X) + 1;
    const rows = Math.ceil(h / DOT_SPACING_Y) + 1;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * DOT_SPACING_X + DOT_SPACING_X / 2;
        const y = row * DOT_SPACING_Y + DOT_SPACING_Y / 2;

        const dx = x - mx;
        const dy = y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let radius = BASE_RADIUS;
        let opacity = BASE_OPACITY;

        if (dist < MOUSE_RADIUS) {
          const falloff = 1 - (dist / MOUSE_RADIUS) ** 2;
          const eased = falloff * falloff;
          radius = BASE_RADIUS + (MAX_RADIUS - BASE_RADIUS) * eased;
          opacity = BASE_OPACITY + (MAX_OPACITY - BASE_OPACITY) * eased;
        }

        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }, []);

  const animate = useCallback(() => {
    if (!needsRedrawRef.current) {
      animFrameRef.current = requestAnimationFrame(animate);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    drawHalftone(canvas, ctx);
    needsRedrawRef.current = false;
    animFrameRef.current = requestAnimationFrame(animate);
  }, [drawHalftone]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      needsRedrawRef.current = true;
    };

    const handleResize = () => {
      needsRedrawRef.current = true;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        drawHalftone(canvas, ctx);
        needsRedrawRef.current = false;
      }
    }

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [animate, drawHalftone]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        pointerEvents: "none",
        willChange: "transform",
      }}
    />
  );
}
