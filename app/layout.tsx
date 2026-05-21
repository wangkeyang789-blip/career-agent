import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Career Agent - 智能求职助理",
  description: "你的 AI 求职助手，从职业方向探索到面试准备，全程陪伴",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
