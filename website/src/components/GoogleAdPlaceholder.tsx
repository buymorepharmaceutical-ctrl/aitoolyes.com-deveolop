'use client';
import { useEffect } from 'react';

export default function GoogleAdPlaceholder({ slot }: { slot: string }) {
  useEffect(() => {
    try {
      // @ts-expect-error adsbygoogle is dynamically added
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  return (
    <div className="w-full my-6 bg-white/20 border border-dashed border-white/50 rounded-xl flex items-center justify-center p-4 min-h-[120px] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
      <div className="text-center">
        <p className="text-xs font-semibold text-foreground/50 uppercase tracking-widest mb-1">Advertisement</p>
        <p className="text-sm text-foreground/70">Google AdSense Space (Slot: {slot})</p>
      </div>
      
      {/* Real AdSense Code (Commented out until Publisher ID is ready) */}
      {/* 
      <ins className="adsbygoogle"
           style={{ display: 'block' }}
           data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
           data-ad-slot={slot}
           data-ad-format="auto"
           data-full-width-responsive="true"></ins>
      */}
    </div>
  );
}
