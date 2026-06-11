'use client';
import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface AdModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdModal({ isOpen, onClose }: AdModalProps) {
  const [countdown, setCountdown] = useState(60);
  const [canClose, setCanClose] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCountdown(60);
      setCanClose(false);
      
      // Initialize AdSense
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err) {
        console.error('AdSense modal error:', err);
      }

      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanClose(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-background border border-card-border rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold mb-2">Supporting AI ToolYes</h2>
        <p className="text-foreground/70 text-sm mb-6 max-w-md">
          To keep our premium AI tools 100% free forever, we occasionally show advertisements. Thank you for your support!
        </p>

        {/* The Ad Container */}
        <div className="w-full bg-black/5 rounded-xl border border-white/10 min-h-[250px] flex items-center justify-center mb-6 overflow-hidden">
           <ins className="adsbygoogle"
               style={{ display: 'block', width: '100%', minHeight: '250px' }}
               data-ad-client="ca-pub-9189923835531293"
               data-ad-slot="1234567890" // Interstitial/Display slot
               data-ad-format="auto"
               data-full-width-responsive="true"></ins>
        </div>

        {canClose ? (
          <button 
            onClick={onClose}
            className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2"
          >
            <span>Continue to Tool</span>
            <X className="w-5 h-5" />
          </button>
        ) : (
          <button 
            disabled
            className="bg-primary/20 text-primary px-8 py-3 rounded-full font-bold cursor-not-allowed opacity-70"
          >
            Skip in {countdown}s
          </button>
        )}
      </div>
    </div>
  );
}
