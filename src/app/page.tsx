"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useEffect, useCallback } from "react";

/* ─── Dream Dust — organic canvas particle system ─── */
function DreamDust() {
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
    phase: number;       // for breathing/pulsing
    phaseSpeed: number;
    hue: number;         // warm hues: rose, gold, cream
    lightness: number;
    drift: number;       // perlin-like horizontal drift
  }

  const initParticles = useCallback((w: number, h: number) => {
    const count = Math.min(Math.floor((w * h) / 2800), 450);
    const particles: Particle[] = [];

    for (let i = 0; i < count; i++) {
      // Warm palette: rose(10), gold(45), warm white(60)
      const hueChoices = [10, 25, 40, 45, 55, 60];
      const hue = hueChoices[Math.floor(Math.random() * hueChoices.length)];

      // ~5% are "fireflies" — larger, brighter, slower pulse
      const isFirefly = Math.random() < 0.05;

      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        size: isFirefly ? Math.random() * 3 + 2.5 : Math.random() * 2.5 + 0.6,
        baseOpacity: isFirefly ? Math.random() * 0.3 + 0.25 : Math.random() * 0.35 + 0.08,
        opacity: 0,
        vx: (Math.random() - 0.5) * (isFirefly ? 0.08 : 0.15),
        vy: (Math.random() - 0.5) * 0.1 - 0.05,
        phase: Math.random() * Math.PI * 2,
        phaseSpeed: isFirefly ? Math.random() * 0.004 + 0.001 : Math.random() * 0.008 + 0.003,
        hue: isFirefly ? 45 : hue,           // fireflies are golden
        lightness: isFirefly ? 88 : Math.random() * 20 + 70,
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

    // Check reduced motion
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let time = 0;
    const draw = () => {
      if (prefersReduced) return;
      time += 1;
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      for (const p of particlesRef.current) {
        // Organic drift
        p.drift += 0.002;
        p.x += p.vx + Math.sin(p.drift) * 0.08;
        p.y += p.vy + Math.cos(p.drift * 0.7) * 0.04;

        // Breathing opacity
        p.phase += p.phaseSpeed;
        p.opacity = p.baseOpacity * (0.5 + 0.5 * Math.sin(p.phase));

        // Mouse proximity — gentle push away
        if (mx >= 0) {
          const dx = p.x - mx;
          const dy = p.y - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            const force = (120 - dist) / 120 * 0.3;
            p.x += (dx / dist) * force;
            p.y += (dy / dist) * force;
            // Brighten near cursor
            p.opacity = Math.min(p.opacity * 1.8, 0.5);
          }
        }

        // Wrap around edges
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;

        // Draw — soft radial glow
        ctx.beginPath();
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2.5);
        gradient.addColorStop(0, `oklch(${p.lightness}% 0.04 ${p.hue} / ${p.opacity})`);
        gradient.addColorStop(1, `oklch(${p.lightness}% 0.04 ${p.hue} / 0)`);
        ctx.fillStyle = gradient;
        ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
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
        background: "oklch(96% 0.01 75 / 0.85)",
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
          color: "var(--color-ink-soft)",
        }}
      >
        Reverie
      </a>
      <div
        className="hidden md:flex gap-10 text-sm"
        style={{
          fontFamily: "'Instrument Sans', sans-serif",
          fontWeight: 400,
          color: "var(--color-ink-faint)",
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
              (e.currentTarget.style.color = "var(--color-ink)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--color-ink-faint)")
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
      {/* Soft radial warmth — not a gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 30% 60%, oklch(92% 0.03 10 / 0.3), transparent 70%)",
        }}
      />

      <div className="relative max-w-4xl">
        <motion.p
          className="text-sm tracking-[0.3em] uppercase mb-6"
          style={{
            fontFamily: "'Instrument Sans', sans-serif",
            fontWeight: 500,
            color: "var(--color-ink-faint)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          A Dream Journal
        </motion.p>

        <motion.h1
          style={{ color: "var(--color-ink)" }}
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.7, ease: [0.25, 1, 0.5, 1] }}
        >
          每张照片背后
          <br />
          <span style={{ color: "var(--color-rose)" }}>
            都有一个
          </span>
          <br />
          未被讲述的故事
        </motion.h1>

        <motion.p
          className="mt-8 max-w-md text-lg"
          style={{ color: "var(--color-ink-soft)", lineHeight: 1.9 }}
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
            color: "var(--color-ink)",
            borderBottom: "1.5px solid var(--color-ink)",
            transitionDuration: "var(--duration-normal)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--color-rose)";
            e.currentTarget.style.borderColor = "var(--color-rose)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--color-ink)";
            e.currentTarget.style.borderColor = "var(--color-ink)";
          }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.6, ease: [0.25, 1, 0.5, 1] }}
        >
          探索 ↓
        </motion.a>
      </div>

      {/* Decorative vertical line */}
      <motion.div
        className="absolute right-12 top-1/4 hidden md:block"
        style={{
          width: "1px",
          height: "30vh",
          background:
            "linear-gradient(to bottom, transparent, var(--color-sand), transparent)",
        }}
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 1.5, delay: 1, ease: [0.25, 1, 0.5, 1] }}
      />
    </motion.section>
  );
}

/* ─── Story section — left-aligned editorial ─── */
function Story() {
  return (
    <section
      id="story"
      className="py-24 md:py-40 px-6 md:px-16"
      style={{ background: "var(--color-warm-white)" }}
    >
      <div className="max-w-6xl mx-auto grid md:grid-cols-12 gap-8 md:gap-16">
        {/* Left column — large type */}
        <motion.div className="md:col-span-5" {...fadeUp}>
          <p
            className="text-xs tracking-[0.4em] uppercase mb-4"
            style={{
              fontFamily: "'Instrument Sans', sans-serif",
              fontWeight: 500,
              color: "var(--color-rose)",
            }}
          >
            Our Story
          </p>
          <h2 style={{ color: "var(--color-ink)" }}>
            照片不只是
            <em style={{ fontStyle: "italic", color: "var(--color-rose)" }}>
              像素
            </em>
            的排列
          </h2>
        </motion.div>

        {/* Right column — body text */}
        <motion.div
          className="md:col-span-6 md:col-start-7 flex flex-col justify-center"
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.15 }}
        >
          <p style={{ color: "var(--color-ink-soft)" }}>
            它们是情感的容器，是时间的切片，是你某个下午心跳加速的证据。
          </p>
          <p className="mt-6" style={{ color: "var(--color-ink-soft)" }}>
            Reverie 不会冰冷地分析你的照片。它会坐下来，安静地听你说——
            那个午后发生了什么，那个微笑意味着什么，那场告别后来怎样了。
          </p>
          <p className="mt-6" style={{ color: "var(--color-ink-soft)" }}>
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
    title: "上传照片",
    subtitle: "Upload & Recall",
    description:
      "将你珍视的瞬间交给 Reverie。AI 会感知画面中的光影、色彩和情绪氛围——不是冷冰冰的识别，而是有温度的感受。",
  },
  {
    number: "02",
    title: "对话回忆",
    subtitle: "Converse",
    description:
      "和 AI 聊聊照片背后的故事。它不会评判，只会温柔地陪你回忆。有时候，说出来，就是治愈的开始。",
  },
  {
    number: "03",
    title: "编织日记",
    subtitle: "Dream Weaving",
    description:
      "AI 将你的情绪与故事编织成一篇梦境般的日记。文字如月光洒落纸面，轻柔而真实。",
  },
  {
    number: "04",
    title: "记忆回廊",
    subtitle: "Memory Corridor",
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
            color: "var(--color-rose)",
          }}
          {...fadeIn}
        >
          How It Works
        </motion.p>
        <motion.h2
          className="mb-20 md:mb-28"
          style={{ color: "var(--color-ink)", maxWidth: "16ch" }}
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
              {/* Number — large, decorative */}
              <div
                className={`md:col-span-2 ${
                  i % 2 !== 0 ? "md:col-start-11 md:order-2" : ""
                }`}
              >
                <span
                  className="text-6xl md:text-7xl font-light"
                  style={{ color: "var(--color-sand)", lineHeight: 1 }}
                >
                  {f.number}
                </span>
              </div>

              {/* Content */}
              <div
                className={`md:col-span-7 ${
                  i % 2 !== 0 ? "md:col-start-2 md:order-1" : "md:col-start-4"
                }`}
              >
                <p
                  className="text-xs tracking-[0.3em] uppercase mb-3"
                  style={{
                    fontFamily: "'Instrument Sans', sans-serif",
                    fontWeight: 400,
                    color: "var(--color-ink-faint)",
                  }}
                >
                  {f.subtitle}
                </p>
                <h3 className="mb-4" style={{ color: "var(--color-ink)" }}>
                  {f.title}
                </h3>
                <p
                  className="max-w-lg"
                  style={{
                    color: "var(--color-ink-soft)",
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
                    background: "var(--color-rose-soft)",
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
      style={{ background: "var(--color-parchment)" }}
    >
      <div className="max-w-4xl mx-auto">
        <motion.div className="grid md:grid-cols-12 gap-8" {...fadeUp}>
          <div className="md:col-span-8">
            <p
              className="text-xs tracking-[0.4em] uppercase mb-4"
              style={{
                fontFamily: "'Instrument Sans', sans-serif",
                fontWeight: 500,
                color: "var(--color-sage)",
              }}
            >
              The Memory Corridor
            </p>
            <h2 style={{ color: "var(--color-ink)" }}>记忆回廊</h2>
            <p
              className="mt-8"
              style={{ color: "var(--color-ink-soft)", maxWidth: "50ch" }}
            >
              在这里，时间以另一种方式流动。每一篇日记都是一颗星辰，串联成属于你的银河。轻触任何一颗，便能重返那个梦境。
            </p>
          </div>
        </motion.div>

        {/* Corridor visualization — abstracted diary entries */}
        <motion.div
          className="mt-16 md:mt-24 grid grid-cols-3 md:grid-cols-5 gap-3 md:gap-4"
          {...fadeIn}
          transition={{ ...fadeIn.transition, delay: 0.3 }}
        >
          {[
            { h: "160px", bg: "var(--color-rose-faint)" },
            { h: "200px", bg: "var(--color-lavender-faint)" },
            { h: "140px", bg: "var(--color-sage-soft)" },
            { h: "180px", bg: "var(--color-rose-faint)" },
            { h: "150px", bg: "var(--color-warm-white)" },
          ].map((card, i) => (
            <motion.div
              key={i}
              className="rounded-sm"
              style={{
                height: card.h,
                background: card.bg,
                border: "1px solid oklch(85% 0.01 75 / 0.5)",
              }}
              whileHover={{
                y: -4,
                transition: { duration: 0.4, ease: [0.25, 1, 0.5, 1] },
              }}
            >
              {/* Abstract "text" lines */}
              <div className="p-4 pt-6 space-y-2">
                <div
                  className="rounded-full"
                  style={{
                    height: "3px",
                    width: "60%",
                    background: "oklch(70% 0.01 75 / 0.2)",
                  }}
                />
                <div
                  className="rounded-full"
                  style={{
                    height: "3px",
                    width: "80%",
                    background: "oklch(70% 0.01 75 / 0.15)",
                  }}
                />
                <div
                  className="rounded-full"
                  style={{
                    height: "3px",
                    width: "45%",
                    background: "oklch(70% 0.01 75 / 0.1)",
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
              color: "var(--color-rose)",
            }}
          >
            About
          </p>
          <h2 className="mb-10" style={{ color: "var(--color-ink)" }}>
            关于 Reverie
          </h2>
        </motion.div>

        <motion.div
          className="space-y-6"
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.15 }}
        >
          <p style={{ color: "var(--color-ink-soft)" }}>
            Reverie 诞生于一个简单的信念：
            <em style={{ fontStyle: "italic", color: "var(--color-ink)" }}>
              每个人的情绪都值得被记录。
            </em>
          </p>
          <p style={{ color: "var(--color-ink-soft)" }}>
            我们相信照片不只是像素的排列，而是情感的容器。通过 AI
            的温柔对话，我们帮助你发现照片背后被遗忘的故事，将它们编织成独一无二的日记，存放在专属于你的记忆回廊中。
          </p>
          <p style={{ color: "var(--color-ink-faint)" }}>
            不是冰冷的技术，而是有温度的陪伴。
          </p>
        </motion.div>

        {/* Decorative divider */}
        <motion.div
          className="mt-16"
          style={{
            width: "32px",
            height: "1px",
            background: "var(--color-sand)",
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
      className="py-16 px-6 md:px-16"
      style={{
        borderTop: "1px solid var(--color-sand)",
        background: "var(--color-cream)",
      }}
    >
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <p
          className="text-sm tracking-[0.2em]"
          style={{
            fontFamily: "'Instrument Sans', sans-serif",
            fontWeight: 400,
            color: "var(--color-ink-faint)",
          }}
        >
          Reverie Diary
        </p>
        <p
          className="text-xs"
          style={{ color: "var(--color-ink-faint)", opacity: 0.6 }}
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
      <DreamDust />
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
