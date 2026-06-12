'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

const ONBOARDING_KEY = 'ai-toolyes-onboarding-seen';

const slides = [
  {
    id: 1,
    title: "Welcome to AI ToolYes",
    description: "One AI Agent. The Output of a Full Team. Simplify your workflow with intelligent, agentic AI.",
    icon: "✨"
  },
  {
    id: 2,
    title: "Universal AI Assistant",
    description: "Chat with Gemma 4 and execute tools directly inside the conversation. Your smart companion.",
    icon: "🤖"
  },
  {
    id: 3,
    title: "20+ Premium Tools",
    description: "From SEO analysis to Code Generation and Glassmorphism UI, all your tools in one place, completely free.",
    icon: "🛠️"
  }
];

export default function GlobalOnboarding() {
  const [phase, setPhase] = useState<'splash' | 'onboarding' | 'done'>('splash');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Lock body scroll while splash/onboarding is active
    document.body.style.overflow = 'hidden';

    // Splash screen duration (2 seconds)
    const splashTimer = setTimeout(() => {
      const hasSeen = localStorage.getItem(ONBOARDING_KEY);
      if (hasSeen === 'true') {
        finishOnboarding();
      } else {
        setPhase('onboarding');
      }
    }, 2000);

    return () => {
      clearTimeout(splashTimer);
      if (phase === 'done') {
        document.body.style.overflow = 'auto';
      }
    };
  }, []);

  const finishOnboarding = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setPhase('done');
    document.body.style.overflow = 'auto';
  };

  if (!isMounted) return null;

  return (
    <AnimatePresence>
      {phase !== 'done' && (
        <motion.div
          key="onboarding-overlay"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0a0a0a]"
        >
          {/* Animated Background Match */}
          <div className="absolute inset-0 pointer-events-none opacity-100" style={{ 
            backgroundImage: "url('/bg_waves.webp')",
            backgroundSize: '120%',
            animation: 'bgPan 25s ease-in-out infinite alternate'
          }} />
          <div className="absolute inset-0 bg-black/30 pointer-events-none" />

          {/* SPLASH PHASE */}
          <AnimatePresence>
            {phase === 'splash' && (
              <motion.div
                key="splash"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.2, opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="flex flex-col items-center z-10"
              >
                <div className="w-32 h-32 md:w-48 md:h-48 relative mb-6 shadow-[0_0_50px_rgba(79,70,229,0.3)] rounded-3xl overflow-hidden">
                  <Image src="/logo.webp" alt="AI ToolYes Logo" fill className="object-cover" priority />
                </div>
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-white/80 font-medium tracking-widest uppercase text-sm"
                >
                  Loading Experience...
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ONBOARDING PHASE */}
          <AnimatePresence>
            {phase === 'onboarding' && (
              <motion.div
                key="onboarding"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -50, opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="z-10 w-full max-w-md p-6"
              >
                <div className="bg-white/10 backdrop-blur-2xl border border-white/20 p-8 rounded-3xl shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4">
                    <button 
                      onClick={finishOnboarding}
                      className="text-white/50 hover:text-white text-sm font-medium transition-colors"
                    >
                      Skip
                    </button>
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentSlide}
                      initial={{ x: 50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -50, opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      className="flex flex-col items-center w-full min-h-[220px]"
                    >
                      <div className="text-6xl mb-6">{slides[currentSlide].icon}</div>
                      <h2 className="text-2xl font-bold text-white mb-4">{slides[currentSlide].title}</h2>
                      <p className="text-white/70 leading-relaxed">
                        {slides[currentSlide].description}
                      </p>
                    </motion.div>
                  </AnimatePresence>

                  {/* Slide Indicators */}
                  <div className="flex gap-2 mt-8 mb-8">
                    {slides.map((_, idx) => (
                      <div 
                        key={idx} 
                        className={`h-2 rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-8 bg-indigo-500' : 'w-2 bg-white/20'}`}
                      />
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="w-full">
                    {currentSlide < slides.length - 1 ? (
                      <button
                        onClick={() => setCurrentSlide(prev => prev + 1)}
                        className="w-full py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-all border border-white/10"
                      >
                        Next
                      </button>
                    ) : (
                      <button
                        onClick={finishOnboarding}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold transition-all shadow-[0_0_20px_rgba(79,70,229,0.4)]"
                      >
                        Get Started
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
