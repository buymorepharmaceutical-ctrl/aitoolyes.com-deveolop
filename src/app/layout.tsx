import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI ToolYes - The Ultimate AI Powered Web Tools Platform",
  description: "Boost your productivity with 20+ free AI tools including UI Generators, SEO Analyzers, Code Visualizers, and Content Summarizers.",
  keywords: "AI tools, UI generator, SEO analyzer, free AI tools, glassmorphism generator, JSON formatter, developer tools, AI chat",
  openGraph: {
    title: "AI ToolYes - Premium AI Tools",
    description: "One AI Agent. The Output of a Full Team. Over 20+ premium tools for developers, designers, and marketers.",
    url: "https://aitoolyes.com",
    siteName: "AI ToolYes",
    images: [
      {
        url: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "AI ToolYes Dashboard",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI ToolYes - The Ultimate AI Powered Web Tools Platform",
    description: "Boost your productivity with 20+ free AI tools.",
    images: ["https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&q=80"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

import Link from 'next/link';
import AdsProvider from '@/components/AdsProvider';
import AdSlot from '@/components/AdSlot';
import GlobalOnboarding from '@/components/GlobalOnboarding';
import { GlobalAIProvider } from '@/components/GlobalAIContext';
import { AIChatWrapper } from '@/components/AIChatWrapper';

import Script from 'next/script';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jakarta.className} h-full antialiased`}
    >
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9189923835531293"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className="min-h-full flex flex-col items-center p-4 md:p-8 relative">
        <GlobalAIProvider>
          <GlobalOnboarding />
          {/* Animated Background */}
          <div className="fixed inset-0 z-[-1] overflow-hidden bg-[#0a0a0a]">
            <div className="absolute inset-0 opacity-100" style={{ 
              backgroundImage: "url('/bg_waves.png')",
              backgroundSize: '120%',
              animation: 'bgPan 25s ease-in-out infinite alternate'
            }} />
            <div className="absolute inset-0 bg-black/30" />
          </div>
          
          <AdsProvider />
          {/* Main Dashboard Container */}
          <div className="w-full max-w-6xl flex-1 flex flex-col glass-panel overflow-hidden bento-card relative z-10">
            {/* Header/Navbar */}
            <header className="glass-header flex items-center justify-between p-4 md:px-8">
              <Link href="/" className="font-bold text-xl tracking-tight text-primary">AI ToolYes</Link>
              <nav className="hidden md:flex gap-6 text-sm font-medium">
                <Link href="/" className="hover:text-primary transition-colors">Platform</Link>
                <Link href="/#tools" className="hover:text-primary transition-colors">Tools</Link>
                <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>
              </nav>
              <Link href="/admin" className="bg-primary/10 text-primary border border-primary/20 px-4 py-2 rounded-full text-sm font-semibold hover:bg-primary/20 transition-all">
                Admin Panel
              </Link>
            </header>
            
            {/* Page Content */}
            <main className="flex-1 overflow-auto p-4 md:p-8">
              <AdSlot />
              {children}
            </main>
          </div>
          
          <AIChatWrapper />
        </GlobalAIProvider>
      </body>
    </html>
  );
}
