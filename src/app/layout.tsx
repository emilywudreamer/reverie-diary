import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Reverie — 情绪日记",
  description: "上传照片，与 AI 对话，生成属于你的梦境日记。",
  keywords: ["reverie", "diary", "AI", "emotion", "memory", "日记", "情绪"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;0,6..72,500;1,6..72,300;1,6..72,400&family=Noto+Serif+SC:wght@300;400;500;700&family=Instrument+Sans:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
