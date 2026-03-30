import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Reverie Diary — 梦境情绪日记",
  description: "上传照片，与AI对话照片背后的故事，生成属于你的梦境日记，存于记忆回廊。",
  keywords: ["reverie", "diary", "AI", "emotion", "memory", "日记", "情绪", "梦境"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ fontFamily: "'Playfair Display', 'Noto Serif SC', serif" }}>
        {children}
      </body>
    </html>
  );
}
