'use client';
import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

export default function AdSlot() {
  useEffect(() => {
    // Only push ads on Web/PWA, Native APK uses AdMob Banner
    if (!Capacitor.isNativePlatform()) {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err) {
        console.error('AdSense error:', err);
      }
    }
  }, []);

  // Hide on native since AdMob handles it there
  if (Capacitor.isNativePlatform()) return null;

  return (
    <div className="w-full my-4 flex justify-center bg-black/5 rounded-xl border border-white/10 overflow-hidden min-h-[90px]">
      <ins className="adsbygoogle"
           style={{ display: 'block', width: '100%' }}
           data-ad-client="ca-pub-9189923835531293" // User's real Publisher ID
           data-ad-slot="1234567890" // Replace with real Slot ID when available
           data-ad-format="auto"
           data-full-width-responsive="true"></ins>
    </div>
  );
}
