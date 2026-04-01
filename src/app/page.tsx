"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useEffect, useCallback } from "react";

/* ─── Star Dust — canvas particle system ─── */
function StarDust() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -1, y: -1 });

  interface Particle {
    x: number;
    y: number;
    size: number;
    baseOpacity: number;
    opacity: number;
    vx: number;
    vy: number;
    phase: number;
    phaseSpeed: number;
    hue: number;
    lightness: number;
    chroma: number;
    drift: number;
  }

  const initParticles = useCallback((w: number, h: number) => {
    const count = Math.min(Math.floor((w * h) / 2200), 500);
    const particles: Particle[] = [];

    for (let i = 0; i < count; i++) {
      // Starlight palette: warm white(80), gold(65), cool silver(240), faint rose(15)
      const presets = [
        { hue: 80, lightness: 90, chroma: 0.02 },   // warm white star
        { hue: 65, lightness: 85, chroma: 0.06 },   // gold star
        { hue: 240, lightness: 88, chroma: 0.02 },  // cool silver
        { hue: 15, lightness: 82, chroma: 0.04 },   // faint rose
        { hue: 80, lightness: 95, chroma: 0.01 },   // pure starlight
      ];
      const preset = presets[Math.floor(Math.random() * presets.length)];

      // ~6% are bright stars
      const isStar = Math.random() < 0.06;

      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        size: isStar ? Math.random() * 2.5 + 1.5 : Math.random() * 1.5 + 0.3,
        baseOpacity: isStar ? Math.random() * 0.5 + 0.4 : Math.random() * 0.4 + 0.05,
        opacity: 0,
        vx: (Math.random() - 0.5) * 0.06,
        vy: (Math.random() - 0.5) * 0.04,
        phase: Math.random() * Math.PI * 2,
        phaseSpeed: isStar ? Math.random() * 0.003 + 0.001 : Math.random() * 0.006 + 0.002,
        hue: preset.hue,
        lightness: preset.lightness + (Math.random() * 6 - 3),
        chroma: preset.chroma,
        drift: Math.random() * Math.PI * 2,
      });
    }
    return particles;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.scale(dpr, dpr);
      particlesRef.current = initParticles(window.innerWidth, window.innerHeight);
    };

    resize();
    window.addEventListener("resize", resize);

    const onMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", onMouse);

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const draw = () => {
      if (prefersReduced) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      for (const p of particlesRef.current) {
        // Organic drift
        p.drift += 0.0015;
        p.x += p.vx + Math.sin(p.drift) * 0.05;
        p.y += p.vy + Math.cos(p.drift * 0.7) * 0.03;

        // Twinkling
        p.phase += p.phaseSpeed;
        p.opacity = p.baseOpacity * (0.4 + 0.6 * Math.sin(p.phase));

        // Mouse: gentle attraction + brighten (stars are drawn to warmth)
        if (mx >= 0) {
          const dx = p.x - mx;
          const dy = p.y - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150 && dist > 5) {
            const force = ((150 - dist) / 150) * 0.15;
            p.x -= (dx / dist) * force;
            p.y -= (dy / dist) * force;
            p.opacity = Math.min(p.opacity * 2, 0.9);
          }
        }

        // Wrap edges
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;

        // Draw — crisp center with soft glow
        const grad = ctx.createRadialGradient(
          p.x, p.y, 0,
          p.x, p.y, p.size * 3
        );
        grad.addColorStop(
          0,
          `oklch(${p.lightness}% ${p.chroma} ${p.hue} / ${p.opacity})`
        );
        grad.addColorStop(
          0.3,
          `oklch(${p.lightness}% ${p.chroma} ${p.hue} / ${p.opacity * 0.5})`
        );
        grad.addColorStop(
          1,
          `oklch(${p.lightness}% ${p.chroma} ${p.hue} / 0)`
        );
        ctx.beginPath();
        ctx.fillStyle = grad;
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    animationRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouse);
    };
  }, [initParticles]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
      aria-hidden="true"
    />
  );
}

/* ─── Motion presets ─── */
const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.8, ease: [0.25, 1, 0.5, 1] },
};

const fadeIn = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 1, ease: [0.25, 1, 0.5, 1] },
};

const stagger = (i: number) => ({
  ...fadeUp,
  transition: { ...fadeUp.transition, delay: i * 0.12 },
});

/* ─── Navigation ─── */
function Nav() {
  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-5"
      style={{
        background: "oklch(12% 0.015 270 / 0.8)",
        backdropFilter: "blur(12px)",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.3 }}
    >
      <a
        href="#"
        className="text-sm tracking-[0.25em] uppercase"
        style={{
          fontFamily: "'Instrument Sans', sans-serif",
          fontWeight: 500,
          color: "var(--color-star-soft)",
        }}
      >
        Reverie
      </a>
      <div
        className="hidden md:flex gap-10 text-sm"
        style={{
          fontFamily: "'Instrument Sans', sans-serif",
          fontWeight: 400,
          color: "var(--color-moon-faint)",
        }}
      >
        {[
          { label: "故事", href: "#story" },
          { label: "功能", href: "#features" },
          { label: "记忆回廊", href: "#corridor" },
          { label: "关于", href: "#about" },
        ].map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="transition-colors"
            style={{ transitionDuration: "var(--duration-fast)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--color-moon)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--color-moon-faint)")
            }
          >
            {item.label}
          </a>
        ))}
      </div>
    </motion.nav>
  );
}

/* ─── Hero ─── */
function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <motion.section
      ref={ref}
      className="relative min-h-screen flex flex-col justify-end pb-20 md:pb-32 px-6 md:px-16"
      style={{ opacity }}
    >
      {/* Subtle warm radial glow near the bottom — like a distant nebula */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 25% 70%, oklch(25% 0.04 15 / 0.2), transparent 70%)",
        }}
      />

      <div className="relative max-w-4xl">
        <motion.p
          className="text-sm tracking-[0.3em] uppercase mb-6"
          style={{
            fontFamily: "'Instrument Sans', sans-serif",
            fontWeight: 500,
            color: "var(--color-star-faint)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          A Dream Journal
        </motion.p>

        <motion.h1
          style={{ color: "var(--color-moon)" }}
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.7, ease: [0.25, 1, 0.5, 1] }}
        >
          每张照片背后
          <br />
          <span style={{ color: "var(--color-star)" }}>都有一个</span>
          <br />
          未被讲述的故事
        </motion.h1>

        <motion.p
          className="mt-8 max-w-md text-lg"
          style={{ color: "var(--color-moon-soft)", lineHeight: 1.9 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
        >
          让 AI 倾听你的情绪，
          <br />
          编织成梦境般的日记。
        </motion.p>

        <motion.a
          href="#story"
          className="inline-block mt-12 px-6 py-3 text-sm tracking-wider transition-all"
          style={{
            fontFamily: "'Instrument Sans', sans-serif",
            fontWeight: 500,
            color: "var(--color-star-soft)",
            borderBottom: "1.5px solid var(--color-star-faint)",
            transitionDuration: "var(--duration-normal)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--color-star)";
            e.currentTarget.style.borderColor = "var(--color-star)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--color-star-soft)";
            e.currentTarget.style.borderColor = "var(--color-star-faint)";
          }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.6, ease: [0.25, 1, 0.5, 1] }}
        >
          探索 ↓
        </motion.a>
      </div>

      {/* Decorative vertical line — like a falling star trail */}
      <motion.div
        className="absolute right-12 top-1/4 hidden md:block"
        style={{
          width: "1px",
          height: "30vh",
          background:
            "linear-gradient(to bottom, transparent, var(--color-star-faint), transparent)",
        }}
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 1.5, delay: 1, ease: [0.25, 1, 0.5, 1] }}
      />
    </motion.section>
  );
}

/* ─── Story section ─── */
function Story() {
  return (
    <section
      id="story"
      className="py-24 md:py-40 px-6 md:px-16"
      style={{ background: "var(--color-deep)" }}
    >
      <div className="max-w-6xl mx-auto grid md:grid-cols-12 gap-8 md:gap-16">
        <motion.div className="md:col-span-5" {...fadeUp}>
          <p
            className="text-xs tracking-[0.4em] uppercase mb-4"
            style={{
              fontFamily: "'Instrument Sans', sans-serif",
              fontWeight: 500,
              color: "var(--color-star-soft)",
            }}
          >
            Our Story
          </p>
          <h2 style={{ color: "var(--color-moon)" }}>
            照片不只是
            <em style={{ fontStyle: "italic", color: "var(--color-star)" }}>
              像素
            </em>
            的排列
          </h2>
        </motion.div>

        <motion.div
          className="md:col-span-6 md:col-start-7 flex flex-col justify-center"
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.15 }}
        >
          <p style={{ color: "var(--color-moon-soft)" }}>
            它们是情感的容器，是时间的切片，是你某个下午心跳加速的证据。
          </p>
          <p className="mt-6" style={{ color: "var(--color-moon-soft)" }}>
            Reverie
            不会冰冷地分析你的照片。它会坐下来，安静地听你说——
            那个午后发生了什么，那个微笑意味着什么，那场告别后来怎样了。
          </p>
          <p className="mt-6" style={{ color: "var(--color-moon-soft)" }}>
            然后，它把这些碎片编织成一篇只属于你的日记。
          </p>
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Feature data ─── */
const features = [
  {
    number: "01",
    subtitle: "Upload & Recall",
    title: "上传照片",
    description:
      "将你珍视的瞬间交给 Reverie。AI 会感知画面中的光影、色彩和情绪氛围——不是冷冰冰的识别，而是有温度的感受。",
  },
  {
    number: "02",
    subtitle: "Converse",
    title: "对话回忆",
    description:
      "和 AI 聊聊照片背后的故事。它不会评判，只会温柔地陪你回忆。有时候，说出来，就是治愈的开始。",
  },
  {
    number: "03",
    subtitle: "Dream Weaving",
    title: "编织日记",
    description:
      "AI 将你的情绪与故事编织成一篇梦境般的日记。文字如月光洒落纸面，轻柔而真实。",
  },
  {
    number: "04",
    subtitle: "Memory Corridor",
    title: "记忆回廊",
    description:
      "所有日记汇聚于此。时间在这里变得柔软，随时可以重新走进那些被温柔保管的瞬间。",
  },
];

/* ─── Features ─── */
function Features() {
  return (
    <section id="features" className="py-24 md:py-40 px-6 md:px-16">
      <div className="max-w-5xl mx-auto">
        <motion.p
          className="text-xs tracking-[0.4em] uppercase mb-4"
          style={{
            fontFamily: "'Instrument Sans', sans-serif",
            fontWeight: 500,
            color: "var(--color-star-soft)",
          }}
          {...fadeIn}
        >
          How It Works
        </motion.p>
        <motion.h2
          className="mb-20 md:mb-28"
          style={{ color: "var(--color-moon)", maxWidth: "16ch" }}
          {...fadeUp}
        >
          四步，从照片到梦境
        </motion.h2>

        <div className="space-y-20 md:space-y-28">
          {features.map((f, i) => (
            <motion.div
              key={f.number}
              className={`grid md:grid-cols-12 gap-6 md:gap-12 items-start ${
                i % 2 !== 0 ? "md:text-right" : ""
              }`}
              {...stagger(i)}
            >
              {/* Number */}
              <div
                className={`md:col-span-2 ${
                  i % 2 !== 0 ? "md:col-start-11 md:order-2" : ""
                }`}
              >
                <span
                  className="text-6xl md:text-7xl"
                  style={{
                    color: "var(--color-surface-raised)",
                    lineHeight: 1,
                    fontWeight: 300,
                  }}
                >
                  {f.number}
                </span>
              </div>

              {/* Content */}
              <div
                className={`md:col-span-7 ${
                  i % 2 !== 0
                    ? "md:col-start-2 md:order-1"
                    : "md:col-start-4"
                }`}
              >
                <p
                  className="text-xs tracking-[0.3em] uppercase mb-3"
                  style={{
                    fontFamily: "'Instrument Sans', sans-serif",
                    fontWeight: 400,
                    color: "var(--color-moon-faint)",
                  }}
                >
                  {f.subtitle}
                </p>
                <h3 className="mb-4" style={{ color: "var(--color-moon)" }}>
                  {f.title}
                </h3>
                <p
                  className="max-w-lg"
                  style={{
                    color: "var(--color-moon-soft)",
                    ...(i % 2 !== 0 ? { marginLeft: "auto" } : {}),
                  }}
                >
                  {f.description}
                </p>

                {/* Decorative line */}
                <div
                  className="mt-8"
                  style={{
                    width: "48px",
                    height: "1px",
                    background: "var(--color-star-faint)",
                    ...(i % 2 !== 0 ? { marginLeft: "auto" } : {}),
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Memory Corridor ─── */
function MemoryCorridor() {
  return (
    <section
      id="corridor"
      className="py-24 md:py-40 px-6 md:px-16"
      style={{ background: "var(--color-deep)" }}
    >
      <div className="max-w-4xl mx-auto">
        <motion.div className="grid md:grid-cols-12 gap-8" {...fadeUp}>
          <div className="md:col-span-8">
            <p
              className="text-xs tracking-[0.4em] uppercase mb-4"
              style={{
                fontFamily: "'Instrument Sans', sans-serif",
                fontWeight: 500,
                color: "var(--color-lavender)",
              }}
            >
              The Memory Corridor
            </p>
            <h2 style={{ color: "var(--color-moon)" }}>记忆回廊</h2>
            <p
              className="mt-8"
              style={{ color: "var(--color-moon-soft)", maxWidth: "50ch" }}
            >
              在这里，时间以另一种方式流动。每一篇日记都是一颗星辰，串联成属于你的银河。轻触任何一颗，便能重返那个梦境。
            </p>
          </div>
        </motion.div>

        {/* Abstract diary entries — like constellations */}
        <motion.div
          className="mt-16 md:mt-24 grid grid-cols-3 md:grid-cols-5 gap-3 md:gap-4"
          {...fadeIn}
          transition={{ ...fadeIn.transition, delay: 0.3 }}
        >
          {[
            { h: "160px", accent: "var(--color-rose-soft)" },
            { h: "200px", accent: "var(--color-star-faint)" },
            { h: "140px", accent: "var(--color-lavender-faint)" },
            { h: "180px", accent: "var(--color-rose-soft)" },
            { h: "150px", accent: "var(--color-star-faint)" },
          ].map((card, i) => (
            <motion.div
              key={i}
              className="rounded-sm"
              style={{
                height: card.h,
                background: "var(--color-surface)",
                borderTop: `1px solid ${card.accent}`,
              }}
              whileHover={{
                y: -4,
                transition: { duration: 0.4, ease: [0.25, 1, 0.5, 1] },
              }}
            >
              {/* Abstract text lines */}
              <div className="p-4 pt-6 space-y-2">
                <div
                  className="rounded-full"
                  style={{
                    height: "2px",
                    width: "60%",
                    background: "var(--color-moon-faint)",
                    opacity: 0.3,
                  }}
                />
                <div
                  className="rounded-full"
                  style={{
                    height: "2px",
                    width: "80%",
                    background: "var(--color-moon-faint)",
                    opacity: 0.2,
                  }}
                />
                <div
                  className="rounded-full"
                  style={{
                    height: "2px",
                    width: "45%",
                    background: "var(--color-moon-faint)",
                    opacity: 0.15,
                  }}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ─── About ─── */
function About() {
  return (
    <section id="about" className="py-24 md:py-40 px-6 md:px-16">
      <div className="max-w-3xl mx-auto">
        <motion.div {...fadeUp}>
          <p
            className="text-xs tracking-[0.4em] uppercase mb-4"
            style={{
              fontFamily: "'Instrument Sans', sans-serif",
              fontWeight: 500,
              color: "var(--color-star-soft)",
            }}
          >
            About
          </p>
          <h2 className="mb-10" style={{ color: "var(--color-moon)" }}>
            关于 Reverie
          </h2>
        </motion.div>

        <motion.div
          className="space-y-6"
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.15 }}
        >
          <p style={{ color: "var(--color-moon-soft)" }}>
            Reverie 诞生于一个简单的信念：
            <em style={{ fontStyle: "italic", color: "var(--color-moon)" }}>
              每个人的情绪都值得被记录。
            </em>
          </p>
          <p style={{ color: "var(--color-moon-soft)" }}>
            我们相信照片不只是像素的排列，而是情感的容器。通过 AI
            的温柔对话，我们帮助你发现照片背后被遗忘的故事，将它们编织成独一无二的日记，存放在专属于你的记忆回廊中。
          </p>
          <p style={{ color: "var(--color-moon-faint)" }}>
            不是冰冷的技术，而是有温度的陪伴。
          </p>
        </motion.div>

        <motion.div
          className="mt-16"
          style={{
            width: "32px",
            height: "1px",
            background: "var(--color-star-faint)",
          }}
          {...fadeIn}
        />
      </div>
    </section>
  );
}

/* ─── Footer ─── */
function Footer() {
  return (
    <footer
      className="relative py-16 px-6 md:px-16"
      style={{
        zIndex: 2,
        borderTop: "1px solid var(--color-surface-raised)",
        background: "var(--color-night)",
      }}
    >
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <p
          className="text-sm tracking-[0.2em]"
          style={{
            fontFamily: "'Instrument Sans', sans-serif",
            fontWeight: 400,
            color: "var(--color-moon-faint)",
          }}
        >
          Reverie Diary
        </p>
        <p
          className="text-xs"
          style={{ color: "var(--color-moon-faint)", opacity: 0.5 }}
        >
          © 2026 Reverie. All dreams reserved.
        </p>
      </div>
    </footer>
  );
}

/* ─── Page ─── */
export default function Home() {
  return (
    <>
      <StarDust />
      <Nav />
      <main className="relative" style={{ zIndex: 2 }}>
        <Hero />
        <Story />
        <Features />
        <MemoryCorridor />
        <About />
      </main>
      <Footer />
    </>
  );
}
