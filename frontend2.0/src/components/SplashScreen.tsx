'use client';

import { useEffect, useState, useRef } from 'react';

export default function SplashScreen() {
  const [phase, setPhase] = useState<'initial' | 'fadeIn' | 'show' | 'fadeOut' | 'done'>('initial');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Cleanup function to clear timeout on unmount
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (phase === 'initial') {
      // Start fade in after a small delay for the component to mount
      timeoutRef.current = setTimeout(() => setPhase('fadeIn'), 100);
    } else if (phase === 'fadeIn') {
      // Show full logo for a while
      timeoutRef.current = setTimeout(() => setPhase('show'), 1500);
    } else if (phase === 'show') {
      // Start fade out after showing
      timeoutRef.current = setTimeout(() => setPhase('fadeOut'), 1500);
    } else if (phase === 'fadeOut') {
      // Remove from DOM after fade out completes
      timeoutRef.current = setTimeout(() => setPhase('done'), 1000);
    }
  }, [phase]);

  if (phase === 'done') return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-white transition-all duration-1000 ${
        phase === 'initial' ? 'opacity-0' : 
        phase === 'fadeIn' ? 'opacity-100 scale-100' : 
        phase === 'show' ? 'opacity-100 scale-100' : 
        'opacity-0 scale-110'
      }`}
    >
      <h1 
        className={`text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-4 transition-all duration-1000 ${
          phase === 'initial' || phase === 'fadeIn' ? 'opacity-0 transform translate-y-10' : 
          phase === 'show' ? 'opacity-100 transform translate-y-0' : 
          'opacity-0 transform -translate-y-10'
        }`}
      >
        WARUNG BANG JUL
      </h1>
      <div 
        className={`w-16 h-1 bg-orange-400 rounded transition-all duration-1000 ${
          phase === 'initial' || phase === 'fadeIn' ? 'opacity-0 w-0' : 
          phase === 'show' ? 'opacity-100 w-16' : 
          'opacity-0 w-32'
        }`}
      >
      </div>
    </div>
  );
} 