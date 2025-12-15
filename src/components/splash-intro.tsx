'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export function SplashIntro({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Check if user has seen splash before in this session
    const hasSeenSplash = sessionStorage.getItem('hasSeenSplash');
    
    if (hasSeenSplash) {
      setShowSplash(false);
      return;
    }

    // Start fade out after 2.5 seconds
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 2500);

    // Hide splash after fade completes
    const hideTimer = setTimeout(() => {
      setShowSplash(false);
      sessionStorage.setItem('hasSeenSplash', 'true');
    }, 3200);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!showSplash) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Splash Screen */}
      <div
        className={`fixed inset-0 z-[100] flex items-center justify-center bg-[#1F2A44] transition-opacity duration-700 ${
          fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <div className={`text-center transition-all duration-500 ${fadeOut ? 'scale-110' : 'scale-100'}`}>
          {/* Logo */}
          <div className="relative w-64 h-64 md:w-80 md:h-80 mx-auto animate-fade-in">
            <Image
              src="/images/logo.jpg"
              alt="Little Grapplers"
              fill
              className="object-contain drop-shadow-2xl"
              priority
            />
          </div>
          
          {/* Tagline */}
          <p className="mt-6 text-lg md:text-xl text-white/70 font-medium animate-fade-up">
            Building Confidence. Building Character.
          </p>
          
          {/* Loading indicator */}
          <div className="mt-8 flex justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#2EC4B6] animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 rounded-full bg-[#2EC4B6] animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 rounded-full bg-[#2EC4B6] animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>

      {/* Main content (hidden during splash) */}
      <div className={fadeOut ? 'opacity-100' : 'opacity-0'}>
        {children}
      </div>
    </>
  );
}
