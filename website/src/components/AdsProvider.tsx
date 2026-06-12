'use client';
import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { AdMob, BannerAdSize, BannerAdPosition } from '@capacitor-community/admob';

export default function AdsProvider() {
  useEffect(() => {
    // 1. Initialize AdMob if running on Native Android/iOS (APK)
    const initAdMob = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          await AdMob.initialize({
            testingDevices: ['2077ef9a63d2b398840261c8221a0c9b'],
            initializeForTesting: true,
          });

          // Show a test banner ad at the bottom
          await AdMob.showBanner({
            adId: 'ca-app-pub-3940256099942544/6300978111', // Test Banner ID
            adSize: BannerAdSize.ADAPTIVE_BANNER,
            position: BannerAdPosition.BOTTOM_CENTER,
            margin: 0,
            isTesting: true
          });
        } catch (e) {
          console.error("AdMob Init Failed:", e);
        }
      }
    };

    initAdMob();
  }, []);

  return (
    <>
      {/* 2. Google AdSense for Web/PWA */}
      <script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9189923835531293"
        crossOrigin="anonymous"
      ></script>
    </>
  );
}
