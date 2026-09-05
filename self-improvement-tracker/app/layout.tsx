import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "LevelUp — Self-Improvement Tracker",
  description:
    "Gamify your fitness, nutrition, and skill-building journey. Track progress, compete with friends, and climb the leaderboard.",
  keywords: ["self-improvement", "fitness tracker", "skill tracking", "leaderboard", "productivity"],
  openGraph: {
    title: "LevelUp — Self-Improvement Tracker",
    description: "Gamify your self-improvement journey with friends.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
