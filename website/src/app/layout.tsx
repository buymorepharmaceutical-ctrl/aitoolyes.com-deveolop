import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AIToolYes - Free On-Device AI Tools (No Cloud, 100% Private)",
  description: "Access 20+ completely free AI tools that run directly in your browser. From advanced document scanning to ATS resume checking. Zero cloud uploads, 100% privacy.",
  keywords: "free on-device AI tools, privacy first AI, browser based document scanner, ATS resume checker online free, camscanner alternative web, AI developer tools no login, machine learning in browser, AIToolYes",
  openGraph: {
    title: "AIToolYes - Premium AI Tools Built for Privacy",
    description: "Experience the fastest AI tools on the web. Document scanners, ATS checkers, and color extractors that run mathematically on your device without cloud servers.",
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
import Image from 'next/image';
import AdsProvider from '@/components/AdsProvider';
import AdSlot from '@/components/AdSlot';
import GlobalOnboarding from '@/components/GlobalOnboarding';
import { GlobalAIProvider } from '@/components/GlobalAIContext';
import { AIChatWrapper } from '@/components/AIChatWrapper';

import Script from 'next/script';

import PWAInstallButton from '@/components/PWAInstallButton';

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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "AI ToolYes",
              "url": "https://aitoolyes.com/",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://aitoolyes.com/blog?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "AI ToolYes",
              "operatingSystem": "Web",
              "applicationCategory": "DeveloperApplication",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              }
            })
          }}
        />
      </head>
      <body className="min-h-[100dvh] flex flex-col items-center p-2 md:p-8 pb-24 md:pb-8 relative">
        <GlobalAIProvider>
          <GlobalOnboarding />
          {/* Animated Background */}
          <div className="fixed inset-0 z-[-1] overflow-hidden bg-[#0a0a0a]">
            <div className="absolute inset-0 opacity-100" style={{
              animation: 'bgPan 25s ease-in-out infinite alternate'
            }}>
              <Image 
                src="/bg_waves.png" 
                alt="Background" 
                fill 
                priority 
                quality={75}
                className="object-cover object-center w-[120%] h-[120%] max-w-[120%]"
                style={{ transform: 'scale(1.2)' }}
              />
            </div>
            <div className="absolute inset-0 bg-black/30" />
          </div>
          
          <AdsProvider />
          {/* Main Dashboard Container */}
          <div className="w-full max-w-6xl flex-1 flex flex-col glass-panel bento-card relative z-10 min-h-[calc(100vh-2rem)]">
            {/* Header/Navbar */}
            <header className="glass-header flex items-center justify-between p-3 md:px-8">
              <Link href="/" className="font-bold text-xl tracking-tight text-primary">AI ToolYes</Link>
              <nav className="hidden md:flex gap-6 text-sm font-medium">
                <Link href="/" className="hover:text-primary transition-colors">Platform</Link>
                <Link href="/tools" className="hover:text-primary transition-colors">Tools</Link>
                <Link href="/about" className="hover:text-primary transition-colors">About</Link>
                <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>
                <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
              </nav>
              <div className="flex items-center gap-3">
                <PWAInstallButton />
                <Link href="/admin" className="hidden md:block bg-primary/10 text-primary border border-primary/20 px-4 py-2 rounded-full text-sm font-semibold hover:bg-primary/20 transition-all">
                  Admin Panel
                </Link>
              </div>
            </header>
            
            {/* Page Content */}
            <main className="flex-1 flex flex-col p-3 md:p-8 relative">
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
