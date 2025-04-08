'use client';

import { useEffect, useState, useRef, FormEvent } from 'react';

interface SplashScreenProps {
  onUserNameSubmit?: (name: string) => void;
}

export default function SplashScreen({ onUserNameSubmit }: SplashScreenProps) {
  const [phase, setPhase] = useState<'initial' | 'fadeIn' | 'show' | 'form' | 'fadeOut' | 'done'>('initial');
  const [userName, setUserName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
      // Show form after logo display
      timeoutRef.current = setTimeout(() => setPhase('form'), 1500);
    } else if (phase === 'form') {
      // Focus on the input field
      if (inputRef.current) {
        inputRef.current.focus();
      }
      // No automatic transition - wait for form submission
    } else if (phase === 'fadeOut') {
      // Remove from DOM after fade out completes
      timeoutRef.current = setTimeout(() => setPhase('done'), 1000);
    }
  }, [phase]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!userName.trim()) {
      setError('Please enter your name');
      return;
    }
    
    // Call the callback with the name
    if (onUserNameSubmit) {
      onUserNameSubmit(userName);
    }
    
    // Proceed to fadeout
    setPhase('fadeOut');
  };

  if (phase === 'done') return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-white transition-all duration-1000 ${
        phase === 'initial' ? 'opacity-0' : 
        phase === 'fadeIn' ? 'opacity-100 scale-100' : 
        phase === 'show' || phase === 'form' ? 'opacity-100 scale-100' : 
        'opacity-0 scale-110'
      }`}
    >
      <h1 
        className={`text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-4 transition-all duration-1000 ${
          phase === 'initial' || phase === 'fadeIn' ? 'opacity-0 transform translate-y-10' : 
          phase === 'show' || phase === 'form' ? 'opacity-100 transform translate-y-0' : 
          'opacity-0 transform -translate-y-10'
        }`}
      >
        WARUNG BANG JUL
      </h1>
      <div 
        className={`w-16 h-1 bg-orange-400 rounded transition-all duration-1000 ${
          phase === 'initial' || phase === 'fadeIn' ? 'opacity-0 w-0' : 
          phase === 'show' || phase === 'form' ? 'opacity-100 w-16' : 
          'opacity-0 w-32'
        }`}
      >
      </div>
      
      {/* Name Form */}
      <div 
        className={`mt-8 w-full max-w-sm transition-all duration-1000 ${
          phase === 'form' ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10 pointer-events-none'
        }`}
      >
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-4">
            <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-2">
              Enter your name to continue
            </label>
            <input
              ref={inputRef}
              id="userName"
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none"
              placeholder="Your name"
              value={userName}
              onChange={(e) => {
                setUserName(e.target.value);
                if (error) setError('');
              }}
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm rounded-md text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-400 transition-colors duration-200"
            >
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 