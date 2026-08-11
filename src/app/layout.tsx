import type { Metadata } from "next";
import { Inter, Outfit, JetBrains_Mono } from "next/font/google";
import { DesktopGuard } from "@/components/DesktopGuard";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "GoLive DSS | Enterprise Release Readiness Support System",
  description: "Risk-based decision support system for enterprise software delivery governance.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} ${jetbrainsMono.variable} dark antialiased`}>
      <body className="bg-[#0B0F19] text-slate-100 font-sans selection:bg-cyan-500 selection:text-black min-h-screen">
        <DesktopGuard>{children}</DesktopGuard>
      </body>
    </html>
  );
}
