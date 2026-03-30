"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

/* ─── Floating particles background ─── */
function DreamParticles() {
  const particles = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 15,
    delay: Math.random() * 10,
    opacity: Math.random() * 0.4 + 0.1,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            background: `radial-gradient(circle, rgba(179,146,240,${p.opacity}), transparent)`,
          }}
          animate={{
            y: [0, -60, 0],
            x: [0, Math.random() * 30 - 15, 0],
            opacity: [p.opacity, p.opacity * 1.8, p.opacity],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

/* ─── Section wrapper with fade-in ─── */
function Section({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <motion.section
      id={id}
      className={`relative z-10 ${className}`}
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 1, ease: "easeOut" }}
    >
      {children}
    </motion.section>
  );
}

/* ─── Navigation ─── */
function Nav() {
  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5"
      style={{
        background: "linear-gradient(to bottom, rgba(13,10,26,0.95), rgba(13,10,26,0))",
        backdropFilter: "blur(8px)",
      }}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 1, delay: 0.5 }}
    >
      <div className="text-xl tracking-widest" style={{ color: "var(--color-dreamy-lavender)" }}>
        ✦ REVERIE
      </div>
      <div className="hidden md:flex gap-8 text-sm tracking-wider" style={{ color: "var(--color-dreamy-mist)" }}>
        {["故事", "功能", "记忆回廊", "关于"].map((item, i) => (
          <motion.a
            key={item}
            href={`#section-${i}`}
            className="hover:opacity-100 opacity-60 transition-opacity cursor-pointer"
            whileHover={{ y: -2 }}
          >
            {item}
          </motion.a>
        ))}
      </div>
    </motion.nav>
  );
}

/* ─── Hero ─── */
function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.85]);

  return (
    <motion.div
      ref={ref}
      className="relative min-h-screen flex flex-col items-center justify-center text-center px-6"
      style={{ opacity, scale }}
    >
      {/* Radial glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(107,92,231,0.15), transparent)",
        }}
      />

      <motion.p
        className="text-sm tracking-[0.5em] uppercase mb-6 relative z-10"
        style={{ color: "var(--color-dreamy-lavender)" }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.8 }}
      >
        A Dream Journal Powered by AI
      </motion.p>

      <motion.h1
        className="text-5xl md:text-8xl font-bold leading-tight relative z-10"
        style={{
          background: "linear-gradient(135deg, var(--color-soft-white), var(--color-dreamy-lavender))",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 1 }}
      >
        Reverie
      </motion.h1>

      <motion.h2
        className="text-2xl md:text-4xl mt-4 relative z-10"
        style={{ color: "var(--color-dreamy-mist)" }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 1.3 }}
      >
        情绪日记本
      </motion.h2>

      <motion.p
        className="mt-8 max-w-lg text-lg leading-relaxed relative z-10"
        style={{ color: "rgba(232,223,245,0.7)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, delay: 1.8 }}
      >
        每张照片背后，都有一个未被讲述的故事。<br />
        让 AI 倾听你的情绪，编织成梦境般的日记。
      </motion.p>

      <motion.div
        className="mt-12 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 2.2 }}
      >
        <a
          href="#section-0"
          className="inline-block px-8 py-3 rounded-full text-sm tracking-widest border transition-all hover:scale-105"
          style={{
            borderColor: "var(--color-dreamy-lavender)",
            color: "var(--color-dreamy-lavender)",
            background: "rgba(107,92,231,0.08)",
          }}
        >
          探索梦境 ↓
        </a>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-10"
        animate={{ y: [0, 12, 0] }}
        transition={{ duration: 2.5, repeat: Infinity }}
        style={{ color: "var(--color-dreamy-lavender)", opacity: 0.5 }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </motion.div>
    </motion.div>
  );
}

/* ─── Feature card data ─── */
const features = [
  {
    number: "01",
    title: "上传照片",
    subtitle: "Upload & Recall",
    description: "将你珍视的瞬间上传至 Reverie。每一张照片，都是一扇通往记忆深处的门。AI 会感知画面中的色彩、光影和情绪氛围。",
    icon: "📷",
  },
  {
    number: "02",
    title: "AI 对话",
    subtitle: "Converse with AI",
    description: "与 AI 聊聊照片背后的故事。它不会评判，只会温柔地陪伴你回忆——那个午后、那个微笑、那场未完成的告别。",
    icon: "💬",
  },
  {
    number: "03",
    title: "生成日记",
    subtitle: "Dream Weaving",
    description: "AI 将你的情绪与故事编织成一篇梦境般的日记。文字如月光洒落纸面，轻柔而真实，只属于你。",
    icon: "✍️",
  },
  {
    number: "04",
    title: "记忆回廊",
    subtitle: "Memory Corridor",
    description: "所有的日记汇聚于此——你的「记忆回廊」。时间在这里变得柔软，随时可以重新走进那些被温柔保管的瞬间。",
    icon: "🏛️",
  },
];

/* ─── Feature section ─── */
function Features() {
  return (
    <div className="py-32 px-6 md:px-20">
      {features.map((f, i) => (
        <Section
          key={f.number}
          id={`section-${i}`}
          className="mb-40 max-w-5xl mx-auto"
        >
          <div className={`flex flex-col ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"} items-center gap-12 md:gap-20`}>
            {/* Visual */}
            <motion.div
              className="w-64 h-64 md:w-80 md:h-80 rounded-3xl flex items-center justify-center text-7xl shrink-0"
              style={{
                background: `linear-gradient(135deg, rgba(107,92,231,0.2), rgba(232,160,180,0.15))`,
                border: "1px solid rgba(179,146,240,0.15)",
                boxShadow: "0 0 80px rgba(107,92,231,0.1)",
              }}
              whileHover={{ scale: 1.05, rotate: 1 }}
              transition={{ duration: 0.6 }}
            >
              <span>{f.icon}</span>
            </motion.div>

            {/* Text */}
            <div className="text-center md:text-left">
              <p
                className="text-sm tracking-[0.4em] mb-2"
                style={{ color: "var(--color-dreamy-lavender)", opacity: 0.6 }}
              >
                {f.number} — {f.subtitle}
              </p>
              <h3
                className="text-3xl md:text-5xl font-bold mb-6"
                style={{
                  background: "linear-gradient(135deg, var(--color-soft-white), var(--color-dreamy-gold))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {f.title}
              </h3>
              <p
                className="text-lg leading-relaxed max-w-md"
                style={{ color: "rgba(232,223,245,0.7)" }}
              >
                {f.description}
              </p>
            </div>
          </div>

          {/* Divider */}
          {i < features.length - 1 && (
            <div
              className="mt-20 mx-auto w-px h-20"
              style={{
                background: "linear-gradient(to bottom, var(--color-dreamy-lavender), transparent)",
                opacity: 0.3,
              }}
            />
          )}
        </Section>
      ))}
    </div>
  );
}

/* ─── Memory Corridor showcase ─── */
function MemoryCorridor() {
  return (
    <Section className="py-32 px-6 text-center">
      <div
        className="max-w-4xl mx-auto rounded-3xl p-12 md:p-20"
        style={{
          background: "linear-gradient(135deg, rgba(107,92,231,0.08), rgba(13,10,26,0.9))",
          border: "1px solid rgba(179,146,240,0.1)",
        }}
      >
        <motion.p
          className="text-sm tracking-[0.5em] uppercase mb-4"
          style={{ color: "var(--color-dreamy-lavender)", opacity: 0.6 }}
        >
          The Memory Corridor
        </motion.p>
        <h2
          className="text-4xl md:text-6xl font-bold mb-8"
          style={{
            background: "linear-gradient(135deg, var(--color-dreamy-mist), var(--color-dreamy-rose))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          记忆回廊
        </h2>
        <p
          className="text-lg leading-relaxed max-w-2xl mx-auto mb-12"
          style={{ color: "rgba(232,223,245,0.7)" }}
        >
          在这里，时间以另一种方式流动。<br />
          每一篇日记都是一颗星辰，串联成属于你的银河。<br />
          轻触任何一颗，便能重返那个梦境。
        </p>

        {/* Mock corridor visualization */}
        <div className="flex justify-center gap-4 md:gap-6 mt-8">
          {[0.3, 0.5, 0.7, 1, 0.7, 0.5, 0.3].map((op, i) => (
            <motion.div
              key={i}
              className="rounded-2xl"
              style={{
                width: i === 3 ? 80 : 50,
                height: i === 3 ? 120 : 80,
                background: `linear-gradient(to bottom, rgba(179,146,240,${op * 0.4}), rgba(232,160,180,${op * 0.2}))`,
                border: `1px solid rgba(179,146,240,${op * 0.3})`,
              }}
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, delay: i * 0.3, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ─── About ─── */
function About() {
  return (
    <Section id="section-3" className="py-32 px-6 text-center max-w-3xl mx-auto">
      <p
        className="text-sm tracking-[0.5em] uppercase mb-4"
        style={{ color: "var(--color-dreamy-lavender)", opacity: 0.6 }}
      >
        About Reverie
      </p>
      <h2
        className="text-4xl md:text-5xl font-bold mb-8"
        style={{ color: "var(--color-soft-white)" }}
      >
        关于 Reverie
      </h2>
      <p
        className="text-lg leading-relaxed"
        style={{ color: "rgba(232,223,245,0.7)" }}
      >
        Reverie 诞生于一个简单的信念：<em>每个人的情绪都值得被记录</em>。
        我们相信，照片不只是像素的排列，而是情感的容器。
        通过 AI 的温柔对话，我们帮助你发现照片背后被遗忘的故事，
        将它们编织成独一无二的日记，存放在专属于你的记忆回廊中。
      </p>
      <p
        className="text-lg leading-relaxed mt-6"
        style={{ color: "rgba(232,223,245,0.5)" }}
      >
        不是冰冷的技术，而是有温度的陪伴。<br />
        这就是 Reverie。
      </p>
    </Section>
  );
}

/* ─── Footer ─── */
function Footer() {
  return (
    <footer
      className="relative z-10 py-16 px-6 text-center"
      style={{ borderTop: "1px solid rgba(179,146,240,0.08)" }}
    >
      <p className="text-sm tracking-widest" style={{ color: "var(--color-dreamy-lavender)", opacity: 0.5 }}>
        ✦ REVERIE DIARY
      </p>
      <p className="mt-4 text-xs" style={{ color: "rgba(232,223,245,0.3)" }}>
        © 2026 Reverie. All dreams reserved.
      </p>
    </footer>
  );
}

/* ─── Main page ─── */
export default function Home() {
  return (
    <>
      <DreamParticles />
      <Nav />
      <Hero />
      <Features />
      <MemoryCorridor />
      <About />
      <Footer />
    </>
  );
}
